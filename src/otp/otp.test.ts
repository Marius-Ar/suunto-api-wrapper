import { describe, expect, it } from "vitest";
import { generateXtotp, secondsUntilRollover } from "./index.js";

describe("generateXtotp", () => {
  it("returns a zero-padded 6-digit code", () => {
    const code = generateXtotp("test@example.com", 1_700_000_000_000);
    expect(code).toMatch(/^\d{6}$/);
  });

  it("is deterministic for a fixed time window", () => {
    const t = 1_700_000_000_000;
    expect(generateXtotp("a@b.com", t)).toBe(generateXtotp("a@b.com", t));
  });

  it("differs across accounts", () => {
    const t = 1_700_000_000_000;
    expect(generateXtotp("a@b.com", t)).not.toBe(generateXtotp("c@d.com", t));
  });
});

describe("secondsUntilRollover", () => {
  it("is within (0, 30]", () => {
    const s = secondsUntilRollover(1_700_000_000_000);
    expect(s).toBeGreaterThan(0);
    expect(s).toBeLessThanOrEqual(30);
  });
});
