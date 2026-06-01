import { afterEach, describe, expect, it } from "vitest";
import { HttpClient } from "./index.js";

const realFetch = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = realFetch;
});

function jsonResponse() {
  return new Response("{}", {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}

describe("HttpClient fetch binding", () => {
  // Regression: browsers throw "Illegal invocation" if the global fetch is
  // called detached from globalThis. This test fails if HttpClient stores a
  // bare `globalThis.fetch` reference instead of binding it.
  it("invokes the global fetch bound to globalThis", async () => {
    let receiver: unknown = "unset";
    globalThis.fetch = function (this: unknown) {
      receiver = this;
      return Promise.resolve(jsonResponse());
    } as typeof fetch;

    const client = new HttpClient({ baseUrl: "https://example.com" });
    await client.get("/ping");

    expect(receiver).toBe(globalThis);
  });

  it("uses a caller-supplied fetch as-is", async () => {
    let called = false;
    const client = new HttpClient({
      baseUrl: "https://example.com",
      fetch: () => {
        called = true;
        return Promise.resolve(jsonResponse());
      },
    });
    await client.get("/ping");

    expect(called).toBe(true);
  });
});
