import { afterEach, describe, expect, it } from "vitest";
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
});
