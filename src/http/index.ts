export * from "./types.js";

import type {HttpClientOptions, HttpResponse, Query, RequestBody, RequestContext, RequestOptions,} from "./types.js";
import {HttpError} from "./types.js";

const DEFAULTS = {
  timeoutMs: 30_000,
  retries: 2,
  retryBackoffMs: 300,
} as const;

const RETRYABLE_STATUS = new Set([408, 429, 500, 502, 503, 504]);
const IDEMPOTENT_METHODS = new Set(["GET", "HEAD", "OPTIONS", "PUT", "DELETE"]);

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export class HttpClient {
  private readonly baseUrl: string;
  private readonly defaultHeaders: Record<string, string>;
  private readonly timeoutMs: number;
  private readonly retries: number;
  private readonly retryBackoffMs: number;
  private readonly fetchImpl: typeof fetch;
  private readonly beforeRequest?: HttpClientOptions["beforeRequest"];

  constructor(options: HttpClientOptions = {}) {
    this.baseUrl = options.baseUrl?.replace(/\/+$/, "") ?? "";
    this.defaultHeaders = options.headers ?? {};
    this.timeoutMs = options.timeoutMs ?? DEFAULTS.timeoutMs;
    this.retries = options.retries ?? DEFAULTS.retries;
    this.retryBackoffMs = options.retryBackoffMs ?? DEFAULTS.retryBackoffMs;
    const fetchImpl = options.fetch ?? globalThis.fetch;
    this.beforeRequest = options.beforeRequest;

    if (typeof fetchImpl !== "function") {
      throw new TypeError(
        "No fetch implementation available. Use Node 18+ or pass `fetch` in options.",
      );
    }

    this.fetchImpl = options.fetch ? fetchImpl : fetchImpl.bind(globalThis);
  }

  get<T>(path: string, options?: RequestOptions): Promise<HttpResponse<T>> {
    return this.request<T>("GET", path, options);
  }

  delete<T>(path: string, options?: RequestOptions): Promise<HttpResponse<T>> {
    return this.request<T>("DELETE", path, options);
  }

  post<T>(path: string, options?: RequestOptions): Promise<HttpResponse<T>> {
    return this.request<T>("POST", path, options);
  }

  put<T>(path: string, options?: RequestOptions): Promise<HttpResponse<T>> {
    return this.request<T>("PUT", path, options);
  }

  patch<T>(path: string, options?: RequestOptions): Promise<HttpResponse<T>> {
    return this.request<T>("PATCH", path, options);
  }

  async request<T>(
    method: string,
    path: string,
    options: RequestOptions = {},
  ): Promise<HttpResponse<T>> {
    const url = this.buildUrl(path, options.query);
    const maxAttempts = (options.retries ?? this.retries) + 1;
    const retryable = IDEMPOTENT_METHODS.has(method.toUpperCase());

    let lastError: unknown;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const response = await this.attempt(method, url, options);
        if (
          !response.ok &&
          retryable &&
          RETRYABLE_STATUS.has(response.status) &&
          attempt < maxAttempts - 1
        ) {
          await sleep(this.backoff(attempt, response.headers));
          continue;
        }
        return await this.toResult<T>(response, method, url);
      } catch (err) {
        lastError = err;
        if (isAbortError(err) && options.signal?.aborted) throw err;
        if (!retryable || attempt >= maxAttempts - 1) throw err;
        await sleep(this.backoff(attempt));
      }
    }
    throw lastError;
  }

  private async attempt(
    method: string,
    url: string,
    options: RequestOptions,
  ): Promise<Response> {
    const headers: Record<string, string> = {
      ...this.defaultHeaders,
      ...options.headers,
    };

    let body: RequestBody | null | undefined = options.body;
    if (body == null && options.json !== undefined) {
      body = JSON.stringify(options.json);
      headers["content-type"] ??= "application/json";
    }
    if (!("accept" in headers)) headers["accept"] = "application/json";

    const ctx: RequestContext = { method, url, headers, body };
    if (this.beforeRequest) {
      const next = await this.beforeRequest(ctx);
      if (next) Object.assign(ctx, next);
    }

    const timeoutMs = options.timeoutMs ?? this.timeoutMs;
    const signal = mergeSignals(options.signal, timeoutMs);

    return this.fetchImpl(ctx.url, {
      method: ctx.method,
      headers: ctx.headers,
      body: ctx.body,
      signal,
    });
  }

  private async toResult<T>(
    response: Response,
    method: string,
    url: string,
  ): Promise<HttpResponse<T>> {
    const data = (await parseBody(response)) as T;
    if (!response.ok) {
      throw new HttpError(
        `${method} ${url} failed with status ${response.status}`,
        { status: response.status, url, method, body: data },
      );
    }
    return { data, status: response.status, headers: response.headers };
  }

  private backoff(attempt: number, headers?: Headers): number {
    const retryAfter = headers?.get("retry-after");
    if (retryAfter) {
      const seconds = Number(retryAfter);
      if (Number.isFinite(seconds)) return seconds * 1000;
    }
    const jitter = Math.random() * this.retryBackoffMs;
    return this.retryBackoffMs * 2 ** attempt + jitter;
  }

  private buildUrl(path: string, query?: Query): string {
    const suffixedPath = path.startsWith("/") ? path : `/${path}`;
    const base = /^https?:\/\//i.test(path)
      ? path
      : `${this.baseUrl}${suffixedPath}`;
    if (!query) return base;

    const url = new URL(base);
    for (const [key, value] of Object.entries(query)) {
      if (value == null) continue;
      const values = Array.isArray(value) ? value : [value];
      for (const v of values) {
        if (v != null) url.searchParams.append(key, String(v));
      }
    }
    return url.toString();
  }
}

async function parseBody(response: Response): Promise<unknown> {
  if (response.status === 204 || response.status === 205) return undefined;
  const contentType = response.headers.get("content-type") ?? "";
  const text = await response.text();
  if (!text) return undefined;
  if (
    contentType.includes("application/x-ndjson") ||
    contentType.includes("application/jsonl") ||
    contentType.includes("application/x-jsonlines")
  ) {
    return text
      .split(/\r?\n/)
      .filter((line) => line.length > 0)
      .map((line) => JSON.parse(line));
  }
  if (contentType.includes("application/json")) {
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }
  return text;
}

function mergeSignals(
  userSignal: AbortSignal | undefined,
  timeoutMs: number,
): AbortSignal {
  const timeoutSignal = AbortSignal.timeout(timeoutMs);
  if (!userSignal) return timeoutSignal;
  if (typeof AbortSignal.any === "function") {
    return AbortSignal.any([userSignal, timeoutSignal]);
  }
  return userSignal;
}

function isAbortError(err: unknown): boolean {
  return err instanceof Error && err.name === "AbortError";
}
