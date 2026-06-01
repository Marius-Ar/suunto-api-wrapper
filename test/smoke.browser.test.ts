import { describe, expect, it } from "vitest";
// Import the BUILT artifact, not src — this is what actually ships.
// Run `npm run build` before this suite.
import { SuuntoClient, HttpError } from "../dist/index.mjs";

// A single real request in a real browser engine that exercises both
// browser-only subsystems end to end:
//   1. x-totp generation via the Web Crypto API (needs crypto.subtle)
//   2. the global fetch call (needs fetch bound to the window)
//
// The class of bug this guards against — a missing global like `Buffer`
// (ReferenceError) or a detached `fetch` (TypeError "Illegal invocation") —
// throws *before* any HTTP response is produced. So the success criterion is:
// the request completes a real round trip. We don't control what the harness
// server returns, so any HTTP status (including an HttpError for a 4xx/5xx)
// counts as success; only a non-HTTP error (Reference/Type) is a failure.
describe("browser smoke", () => {
  it("builds an authed request and fetches over the global fetch", async () => {
    const suunto = new SuuntoClient({
      baseUrl: window.location.origin,
      email: "smoke@example.com", // triggers Web Crypto x-totp on each request
      retries: 0,
    });

    try {
      const res = await suunto.http.get(window.location.pathname);
      expect(typeof res.status).toBe("number");
    } catch (err) {
      // A real HTTP error means the round trip happened — that's a pass.
      // Anything else (ReferenceError, TypeError) is the bug we're catching.
      expect(err).toBeInstanceOf(HttpError);
    }
  });
});
