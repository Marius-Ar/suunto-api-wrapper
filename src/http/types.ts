export type RequestBody = NonNullable<RequestInit["body"]>;

export type QueryValue = string | number | boolean | null | undefined;
export type Query = Record<string, QueryValue | QueryValue[]>;

export interface HttpClientOptions {
  baseUrl?: string;
  headers?: Record<string, string>;
  timeoutMs?: number;
  retries?: number;
  retryBackoffMs?: number;
  fetch?: typeof fetch;
  beforeRequest?: (
    ctx: RequestContext,
  ) => void | RequestContext | Promise<void | RequestContext>;
}

export interface RequestContext {
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: RequestBody | null;
}

export type ResponseType = "json" | "bytes";

export interface RequestOptions {
  query?: Query;
  headers?: Record<string, string>;
  json?: unknown;
  body?: RequestBody | null;
  timeoutMs?: number;
  retries?: number;
  signal?: AbortSignal;
  responseType?: ResponseType;
}

export interface HttpResponse<T> {
  data: T;
  status: number;
  headers: Headers;
}

export class HttpError extends Error {
  readonly status: number;
  readonly url: string;
  readonly method: string;
  readonly body: unknown;

  constructor(
    message: string,
    init: { status: number; url: string; method: string; body: unknown },
  ) {
    super(message);
    this.name = "HttpError";
    this.status = init.status;
    this.url = init.url;
    this.method = init.method;
    this.body = init.body;
  }
}
