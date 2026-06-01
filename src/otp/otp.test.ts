import { describe, expect, it } from "vitest";
import { generateXtotp, secondsUntilRollover } from "./index.js";

describe("generateXtotp", () => {
  it("returns a zero-padded 6-digit code", async () => {
    const code = await generateXtotp("test@example.com", 1_700_000_000_000);
    expect(code).toMatch(/^\d{6}$/);
  });

  it("matches known values", async () => {
    const t = 1_700_000_000_000;
    expect(await generateXtotp("test@example.com", t)).toBe("485969");
    expect(await generateXtotp("a@b.com", t)).toBe("155798");
  });

  it("is deterministic for a fixed time window", async () => {
    const t = 1_700_000_000_000;
    expect(await generateXtotp("a@b.com", t)).toBe(
      await generateXtotp("a@b.com", t),
    );
  });
});

describe("secondsUntilRollover", () => {
  it("is within (0, 30]", () => {
    const s = secondsUntilRollover(1_700_000_000_000);
    expect(s).toBeGreaterThan(0);
    expect(s).toBeLessThanOrEqual(30);
  });
});
