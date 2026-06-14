import { describe, expect, it } from "vitest";
import { WellnessResource } from "./index.js";
import { AuthSession } from "../auth";
import { captureFetch, type Captured } from "../testing.js";

function ndjson(rows: unknown[]): string {
  return rows.map((r) => JSON.stringify(r)).join("\n");
}

function wellness(rows: unknown[]) {
  const captured: Captured[] = [];
  const resource = new WellnessResource({
    auth: new AuthSession({ sessionKey: "sess-key" }),
    fetch: captureFetch(captured, ndjson(rows)),
  });
  return { captured, resource };
}

describe("WellnessResource transport", () => {
  it("sets accept: */* on every request", async () => {
    const { captured, resource } = wellness([]);
    await resource.sleep();
    expect(captured[0].headers["accept"]).toBe("*/*");
  });

  it("forwards the session key via sttauthorization", async () => {
    const { captured, resource } = wellness([]);
    await resource.sleep();
    expect(captured[0].headers["sttauthorization"]).toBe("sess-key");
  });

  it("targets the 247 host by default", async () => {
    const { captured, resource } = wellness([]);
    await resource.sleep();
    expect(captured[0].url.startsWith("https://247.sports-tracker.com")).toBe(
      true,
    );
  });

  it("honors baseUrl override", async () => {
    const captured: Captured[] = [];
    const resource = new WellnessResource({
      auth: new AuthSession({ sessionKey: "sess-key" }),
      baseUrl: "https://247.example.test",
      fetch: captureFetch(captured, "[]"),
    });
    await resource.activity();
    expect(captured[0].url).toBe("https://247.example.test/v1/activity/export");
  });
});

describe("WellnessResource.sleep", () => {
  it("calls /v1/sleep/export with no query when since is omitted", async () => {
    const { captured, resource } = wellness([]);
    await resource.sleep();
    expect(captured[0].url).toBe(
      "https://247.sports-tracker.com/v1/sleep/export",
    );
  });

  it("forwards since as query when provided (including 0)", async () => {
    const { captured, resource } = wellness([]);
    await resource.sleep({ since: 0 });
    expect(captured[0].url).toBe(
      "https://247.sports-tracker.com/v1/sleep/export?since=0",
    );
  });

  it("returns the parsed NDJSON rows", async () => {
    const rows = [
      {
        timestamp: "2026-05-23T00:10:00.000+02:00",
        entryData: {
          sleepId: 1779487800,
          bedtimeStart: "2026-05-23T00:10:00.000+02:00",
          bedtimeEnd: "2026-05-23T09:58:00.000+02:00",
          duration: 35280,
          deepSleepDuration: 7860,
          lightSleepDuration: 20190,
          remSleepDuration: 6600,
          sleepOnsetLatencyDuration: 0,
          wakeAfterSleepOnsetDuration: 630,
          wakeBeforeOffBedDuration: 0,
          hrAvg: 0.93333334,
          hrMin: 0.8833333,
          quality: 0.68,
          isNap: false,
        },
      },
    ];
    const { resource } = wellness(rows);
    const result = await resource.sleep({ since: 1700000000000 });
    expect(result).toEqual(rows);
  });
});

describe("WellnessResource.sleepStages", () => {
  it("calls /v1/sleepstages/export with since", async () => {
    const { captured, resource } = wellness([]);
    await resource.sleepStages({ since: 1700000000000 });
    expect(captured[0].url).toBe(
      "https://247.sports-tracker.com/v1/sleepstages/export?since=1700000000000",
    );
  });

  it("returns rows typed as stage intervals", async () => {
    const rows = [
      {
        timestamp: "2026-05-23T01:44:00.000+02:00",
        entryData: { stage: "LIGHT", duration: 150 },
      },
    ];
    const { resource } = wellness(rows);
    const result = await resource.sleepStages();
    expect(result).toEqual(rows);
  });
});

describe("WellnessResource.recovery", () => {
  it("calls /v1/recovery/export with no query when since omitted", async () => {
    const { captured, resource } = wellness([]);
    await resource.recovery();
    expect(captured[0].url).toBe(
      "https://247.sports-tracker.com/v1/recovery/export",
    );
  });

  it("returns rows with balance and stressState", async () => {
    const rows = [
      {
        timestamp: "2026-05-22T14:30:00.000+02:00",
        entryData: { balance: 0.71, stressState: 1 },
      },
    ];
    const { resource } = wellness(rows);
    const result = await resource.recovery();
    expect(result).toEqual(rows);
  });
});

describe("WellnessResource.activity", () => {
  it("calls /v1/activity/export with since", async () => {
    const { captured, resource } = wellness([]);
    await resource.activity({ since: 1700000000000 });
    expect(captured[0].url).toBe(
      "https://247.sports-tracker.com/v1/activity/export?since=1700000000000",
    );
  });

  it("returns rows with hr, stepCount, energyConsumption", async () => {
    const rows = [
      {
        timestamp: "2026-05-22T14:20:00.000+02:00",
        entryData: { hr: 1.3333334, stepCount: 18, energyConsumption: 4186.8 },
      },
    ];
    const { resource } = wellness(rows);
    const result = await resource.activity();
    expect(result).toEqual(rows);
  });
});
