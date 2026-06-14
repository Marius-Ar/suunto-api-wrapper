import { vi } from "vitest";
import type { HttpClient } from "./http";

/**
 * Builds a fake {@link HttpClient} whose `get` returns `data` with a 200 status.
 * For unit-testing resource methods without spinning a real `HttpClient`.
 */
export function mockClient(data: unknown): HttpClient {
  return {
    get: vi
      .fn()
      .mockResolvedValue({ data, status: 200, headers: new Headers() }),
  } as unknown as HttpClient;
}

export type Captured = { url: string; headers: Record<string, string> };

/**
 * Builds a `fetch` impl that records each request into `captured` and returns
 * `body` with the given content type. For integration-testing the full request
 * pipeline (headers, query, parsing).
 */
export function captureFetch(
  captured: Captured[],
  body = "[]",
  contentType = "application/x-ndjson",
): typeof fetch {
  return ((url: string, init?: RequestInit) => {
    const headers: Record<string, string> = {};
    const raw = (init?.headers ?? {}) as Record<string, string>;
    for (const [k, v] of Object.entries(raw)) headers[k.toLowerCase()] = v;
    captured.push({ url, headers });
    return Promise.resolve(
      new Response(body, {
        status: 200,
        headers: { "content-type": contentType },
      }),
    );
  }) as unknown as typeof fetch;
}
