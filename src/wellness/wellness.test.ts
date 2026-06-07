import { describe, expect, it, vi } from "vitest";
import {
  getActivityExport,
  getRecoveryExport,
  getSleepExport,
  getSleepStagesExport,
} from "./index.js";
import type { HttpClient } from "../http";

function mockClient(data: unknown): HttpClient {
  return {
    get: vi.fn().mockResolvedValue({ data, status: 200, headers: new Headers() }),
  } as unknown as HttpClient;
}

describe("getSleepExport", () => {
  it("calls /v1/sleep/export with no query when since is omitted", async () => {
    const client = mockClient([]);
    await getSleepExport(client);

    expect(client.get).toHaveBeenCalledWith("/v1/sleep/export", {
      query: undefined,
    });
  });

  it("forwards since as query when provided (including 0)", async () => {
    const client = mockClient([]);
    await getSleepExport(client, { since: 0 });

    expect(client.get).toHaveBeenCalledWith("/v1/sleep/export", {
      query: { since: 0 },
    });
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
    const client = mockClient(rows);
    const result = await getSleepExport(client, { since: 1700000000000 });

    expect(result).toEqual(rows);
  });
});

describe("getSleepStagesExport", () => {
  it("calls /v1/sleepstages/export with since", async () => {
    const client = mockClient([]);
    await getSleepStagesExport(client, { since: 1700000000000 });

    expect(client.get).toHaveBeenCalledWith("/v1/sleepstages/export", {
      query: { since: 1700000000000 },
    });
  });

  it("returns rows typed as stage intervals", async () => {
    const rows = [
      {
        timestamp: "2026-05-23T01:44:00.000+02:00",
        entryData: { stage: "LIGHT", duration: 150 },
      },
    ];
    const client = mockClient(rows);
    const result = await getSleepStagesExport(client);
    expect(result).toEqual(rows);
  });
});

describe("getRecoveryExport", () => {
  it("calls /v1/recovery/export with no query when since omitted", async () => {
    const client = mockClient([]);
    await getRecoveryExport(client);

    expect(client.get).toHaveBeenCalledWith("/v1/recovery/export", {
      query: undefined,
    });
  });

  it("returns rows with balance and stressState", async () => {
    const rows = [
      {
        timestamp: "2026-05-22T14:30:00.000+02:00",
        entryData: { balance: 0.71, stressState: 1 },
      },
    ];
    const client = mockClient(rows);
    const result = await getRecoveryExport(client);
    expect(result).toEqual(rows);
  });
});

describe("getActivityExport", () => {
  it("calls /v1/activity/export with since", async () => {
    const client = mockClient([]);
    await getActivityExport(client, { since: 1700000000000 });

    expect(client.get).toHaveBeenCalledWith("/v1/activity/export", {
      query: { since: 1700000000000 },
    });
  });

  it("returns rows with hr, stepCount, energyConsumption", async () => {
    const rows = [
      {
        timestamp: "2026-05-22T14:20:00.000+02:00",
        entryData: { hr: 1.3333334, stepCount: 18, energyConsumption: 4186.8 },
      },
    ];
    const client = mockClient(rows);
    const result = await getActivityExport(client);
    expect(result).toEqual(rows);
  });
});
