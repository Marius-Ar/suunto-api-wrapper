import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AuthSession } from "./session.js";
import { generateXtotp } from "../otp";

function ctx(initial: Record<string, string> = {}) {
  return { headers: { ...initial } };
}

describe("AuthSession.applyTo", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(1_700_000_000_000);
  });
  afterEach(() => vi.useRealTimers());

  it("adds no auth headers when neither email nor sessionKey is set", async () => {
    const c = ctx({ "user-agent": "ua" });
    await new AuthSession().applyTo(c);
    expect(c.headers).toEqual({ "user-agent": "ua" });
  });

  it("sets x-totp from email", async () => {
    const c = ctx();
    await new AuthSession({ email: "a@b.com" }).applyTo(c);
    expect(c.headers["x-totp"]).toBe(await generateXtotp("a@b.com"));
    expect(c.headers["sttauthorization"]).toBeUndefined();
  });

  it("sets sttauthorization from sessionKey", async () => {
    const c = ctx();
    await new AuthSession({ sessionKey: "sess-key" }).applyTo(c);
    expect(c.headers["sttauthorization"]).toBe("sess-key");
    expect(c.headers["x-totp"]).toBeUndefined();
  });

  it("sets both headers when both are provided", async () => {
    const c = ctx();
    await new AuthSession({ email: "a@b.com", sessionKey: "sess-key" }).applyTo(c);
    expect(c.headers["x-totp"]).toMatch(/^\d{6}$/);
    expect(c.headers["sttauthorization"]).toBe("sess-key");
  });

  it("preserves existing headers", async () => {
    const c = ctx({ "user-agent": "ua", accept: "application/json" });
    await new AuthSession({ sessionKey: "sess-key" }).applyTo(c);
    expect(c.headers["user-agent"]).toBe("ua");
    expect(c.headers["accept"]).toBe("application/json");
    expect(c.headers["sttauthorization"]).toBe("sess-key");
  });

  it("exposes init values as readonly fields", () => {
    const s = new AuthSession({ email: "a@b.com", sessionKey: "sess-key" });
    expect(s.email).toBe("a@b.com");
    expect(s.sessionKey).toBe("sess-key");
  });
});
