import { describe, expect, it, vi } from "vitest";
import { getWorkout, getWorkouts, getOwnWorkouts, getWorkoutStats } from "./index.js";
import {
  WorkoutAdditionalData,
  WorkoutExtensionName,
} from "./types.js";
import type { HttpClient } from "../http";

function mockClient(data: unknown): HttpClient {
  return {
    get: vi.fn().mockResolvedValue({ data, status: 200, headers: new Headers() }),
  } as unknown as HttpClient;
}

describe("getWorkouts", () => {
  it("calls the correct URL with default params", async () => {
    const client = mockClient({ workouts: [] });
    await getWorkouts(client, "johndoe");

    expect(client.get).toHaveBeenCalledWith(
      "/apiserver/v1/workouts/johndoe/public",
      { query: { limit: 40, sortonst: true } },
    );
  });

  it("encodes special characters in username", async () => {
    const client = mockClient({});
    await getWorkouts(client, "john doe");

    expect(client.get).toHaveBeenCalledWith(
      "/apiserver/v1/workouts/john%20doe/public",
      expect.anything(),
    );
  });

  it("forwards custom params", async () => {
    const client = mockClient({});
    await getWorkouts(client, "johndoe", { limit: 10, sortonst: false });

    expect(client.get).toHaveBeenCalledWith(
      "/apiserver/v1/workouts/johndoe/public",
      { query: { limit: 10, sortonst: false } },
    );
  });

  it("returns the response data", async () => {
    const payload = { workouts: [{ id: "abc" }] };
    const client = mockClient(payload);
    const result = await getWorkouts(client, "johndoe");

    expect(result).toEqual(payload);
  });
});

describe("getOwnWorkouts", () => {
  it("calls the correct URL with default params", async () => {
    const client = mockClient({ workouts: [] });
    await getOwnWorkouts(client);

    expect(client.get).toHaveBeenCalledWith(
      "/apiserver/v1/workouts?offset=0&limit=50&since=0",
    );
  });

  it("forwards custom params", async () => {
    const client = mockClient({});
    await getOwnWorkouts(client, { offset: 10, limit: 20, since: 1700000000 });

    expect(client.get).toHaveBeenCalledWith(
      "/apiserver/v1/workouts?offset=10&limit=20&since=1700000000",
    );
  });

  it("returns the response data", async () => {
    const payload = { workouts: [{ id: "xyz" }] };
    const client = mockClient(payload);
    const result = await getOwnWorkouts(client);

    expect(result).toEqual(payload);
  });
});

describe("getWorkout", () => {
  it("calls the correct URL with default extensions and additionalData", async () => {
    const client = mockClient({ payload: {} });
    await getWorkout(client, "johndoe", "abc123");

    expect(client.get).toHaveBeenCalledWith(
      "/apiserver/v2/workouts/johndoe/abc123/combined",
      {
        query: {
          extensions: "SummaryExtension,CompetitionHeaderExtension",
          additionalData: "achievements,photos,videos,comments,user_reacted",
        },
      },
    );
  });

  it("encodes special characters in username and workoutKey", async () => {
    const client = mockClient({});
    await getWorkout(client, "john doe", "key/with/slashes");

    expect(client.get).toHaveBeenCalledWith(
      "/apiserver/v2/workouts/john%20doe/key%2Fwith%2Fslashes/combined",
      expect.anything(),
    );
  });

  it("forwards custom extensions and additionalData", async () => {
    const client = mockClient({});
    await getWorkout(client, "johndoe", "abc123", {
      extensions: [WorkoutExtensionName.Dive, WorkoutExtensionName.Weather],
      additionalData: [WorkoutAdditionalData.Comments],
    });

    expect(client.get).toHaveBeenCalledWith(
      "/apiserver/v2/workouts/johndoe/abc123/combined",
      {
        query: {
          extensions: "DiveExtension,WeatherExtension",
          additionalData: "comments",
        },
      },
    );
  });

  it("returns the response data", async () => {
    const payload = { error: null, payload: { key: "abc123" }, metadata: {} };
    const client = mockClient(payload);
    const result = await getWorkout(client, "johndoe", "abc123");

    expect(result).toEqual(payload);
  });
});

describe("getWorkoutStats", () => {
  it("calls the correct URL", async () => {
    const client = mockClient({ error: null, payload: [], metadata: {} });
    await getWorkoutStats(client, "johndoe");

    expect(client.get).toHaveBeenCalledWith(
      "/apiserver/v1/workouts/johndoe/stats",
    );
  });

  it("encodes special characters in username", async () => {
    const client = mockClient({});
    await getWorkoutStats(client, "john doe");

    expect(client.get).toHaveBeenCalledWith(
      "/apiserver/v1/workouts/john%20doe/stats",
    );
  });

  it("returns the response data", async () => {
    const payload = {
      error: null,
      payload: {
        totalDistanceSum: 236110,
        totalTimeSum: 57565.209,
        totalEnergyConsumptionSum: 8927,
        totalNumberOfWorkoutsSum: 16,
        totalDays: 10,
        allStats: [
          {
            _id: 99,
            totalDistance: 123392,
            totalTime: 25037.366,
            energyConsumption: 3547,
            numberOfWorkouts: 9,
            maxDepth: 0,
          },
        ],
        allActualStats: [
          {
            _id: 11,
            totalDistance: 5832,
            totalTime: 4529.619,
            energyConsumption: 797,
            numberOfWorkouts: 1,
            maxDepth: 0,
          },
        ],
      },
      metadata: { ts: "1780695054942" },
    };
    const client = mockClient(payload);
    const result = await getWorkoutStats(client, "johndoe");

    expect(result).toEqual(payload);
  });
});
