import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import { HttpClient } from "./index.js";

describe("HttpClient", () => {
  const originalFetch = globalThis.fetch;
  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("invokes globalThis.fetch with the correct receiver (regression: 'Illegal invocation')", async () => {
    // Mirrors the browser's native-fetch invariant: receiver must be the
    // global object. Throws the same way a real browser would when fetch is
    // called as a method of some other object.
    function strictFetch(this: unknown, _url: string): Promise<Response> {
      if (this !== globalThis && this !== undefined) {
        throw new TypeError("Failed to execute 'fetch': Illegal invocation");
      }
      return Promise.resolve(
        new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      );
    }
    globalThis.fetch = strictFetch as unknown as typeof fetch;

    const client = new HttpClient({ baseUrl: "https://example.test" });
    const res = await client.get<{ ok: boolean }>("/ping");
    expect(res.data).toEqual({ ok: true });
  });

  it("parses application/x-ndjson into an array, one parsed JSON per line", async () => {
    const body =
      '{"a":1}\n{"a":2}\r\n\n{"a":3}\n';
    const customFetch = () =>
      Promise.resolve(
        new Response(body, {
          status: 200,
          headers: { "content-type": "application/x-ndjson" },
        }),
      );

    const client = new HttpClient({
      baseUrl: "https://example.test",
      fetch: customFetch as unknown as typeof fetch,
    });
    const res = await client.get<Array<{ a: number }>>("/stream");
    expect(res.data).toEqual([{ a: 1 }, { a: 2 }, { a: 3 }]);
  });

  it("does not bind a caller-supplied fetch (it may already be wrapped)", async () => {
    const seen: { thisArg: unknown }[] = [];
    const customFetch = function (this: unknown, _url: string) {
      seen.push({ thisArg: this });
      return Promise.resolve(
        new Response("{}", {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      );
    };

    const client = new HttpClient({
      baseUrl: "https://example.test",
      fetch: customFetch as unknown as typeof fetch,
    });
    await client.get("/ping");

    // Receiver is the HttpClient instance because we deliberately do NOT bind
    // caller-supplied fetch — the caller controls binding/wrapping.
    expect(seen).toHaveLength(1);
    expect(seen[0].thisArg).toBe(client);
  });

  describe('delete', () => {
    let mockClient: HttpClient;
    beforeEach(() => {
      mockClient = new HttpClient();
      vi.spyOn(mockClient, 'request').mockResolvedValue(undefined as never);
    })

    it('should call request method with 0 retries', () => {
      mockClient.delete('https://example.com');

      expect(mockClient.request).toHaveBeenCalledWith('DELETE', 'https://example.com', {retries: 0});
    });

    it('should call request method with the provided amount of retries', () => {
      mockClient.delete('https://example.com', {retries: 2});

      expect(mockClient.request).toHaveBeenCalledWith('DELETE', 'https://example.com', {retries: 2});
    });
  });
});
