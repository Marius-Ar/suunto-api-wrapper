import { describe, expect, it } from "vitest";
import { WorkoutsResource } from "./index.js";
import {
  WorkoutAdditionalData,
  WorkoutExtensionName,
} from "./types.js";
import { mockClient } from "../testing.js";

function workouts(data: unknown) {
  const client = mockClient(data);
  return { client, resource: new WorkoutsResource(client) };
}

describe("WorkoutsResource.public", () => {
  it("calls the correct URL with default params", async () => {
    const { client, resource } = workouts({ workouts: [] });
    await resource.public("johndoe");

    expect(client.get).toHaveBeenCalledWith(
      "/apiserver/v1/workouts/johndoe/public",
      { query: { limit: 40, sortonst: true } },
    );
  });

  it("encodes special characters in username", async () => {
    const { client, resource } = workouts({});
    await resource.public("john doe");

    expect(client.get).toHaveBeenCalledWith(
      "/apiserver/v1/workouts/john%20doe/public",
      expect.anything(),
    );
  });

  it("forwards custom params", async () => {
    const { client, resource } = workouts({});
    await resource.public("johndoe", { limit: 10, sortonst: false });

    expect(client.get).toHaveBeenCalledWith(
      "/apiserver/v1/workouts/johndoe/public",
      { query: { limit: 10, sortonst: false } },
    );
  });

  it("returns the response data", async () => {
    const payload = { workouts: [{ id: "abc" }] };
    const { resource } = workouts(payload);
    const result = await resource.public("johndoe");

    expect(result).toEqual(payload);
  });
});

describe("WorkoutsResource.own", () => {
  it("calls the correct URL with default params", async () => {
    const { client, resource } = workouts({ workouts: [] });
    await resource.own();

    expect(client.get).toHaveBeenCalledWith(
      "/apiserver/v1/workouts",
      { query: { offset: 0, limit: 50, since: 0 } },
    );
  });

  it("forwards custom params", async () => {
    const { client, resource } = workouts({});
    await resource.own({ offset: 10, limit: 20, since: 1700000000 });

    expect(client.get).toHaveBeenCalledWith(
      "/apiserver/v1/workouts",
      { query: { offset: 10, limit: 20, since: 1700000000 } },
    );
  });

  it("returns the response data", async () => {
    const payload = { workouts: [{ id: "xyz" }] };
    const { resource } = workouts(payload);
    const result = await resource.own();

    expect(result).toEqual(payload);
  });
});

describe("WorkoutsResource.byKey", () => {
  it("calls the correct URL with default extensions and additionalData", async () => {
    const { client, resource } = workouts({ payload: {} });
    await resource.byKey("johndoe", "abc123");

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
    const { client, resource } = workouts({});
    await resource.byKey("john doe", "key/with/slashes");

    expect(client.get).toHaveBeenCalledWith(
      "/apiserver/v2/workouts/john%20doe/key%2Fwith%2Fslashes/combined",
      expect.anything(),
    );
  });

  it("forwards custom extensions and additionalData", async () => {
    const { client, resource } = workouts({});
    await resource.byKey("johndoe", "abc123", {
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
    const { resource } = workouts(payload);
    const result = await resource.byKey("johndoe", "abc123");

    expect(result).toEqual(payload);
  });
});

describe("WorkoutsResource.within", () => {
  const box = {
    lowerLat: 45.7,
    lowerLng: 4.75,
    upperLat: 45.85,
    upperLng: 4.95,
  };

  it("calls the correct URL with the bounding box and default limit", async () => {
    const { client, resource } = workouts({
      error: null,
      payload: [],
      metadata: { workoutcount: "0" },
    });
    await resource.within(box);

    expect(client.get).toHaveBeenCalledWith(
      "/apiserver/v1/workouts/public/within",
      {
        query: {
          lowerlat: 45.7,
          lowerlng: 4.75,
          upperlat: 45.85,
          upperlng: 4.95,
          limit: 50,
        },
      },
    );
  });

  it("forwards a custom limit", async () => {
    const { client, resource } = workouts({});
    await resource.within({ ...box, limit: 10 });

    expect(client.get).toHaveBeenCalledWith(
      "/apiserver/v1/workouts/public/within",
      {
        query: {
          lowerlat: 45.7,
          lowerlng: 4.75,
          upperlat: 45.85,
          upperlng: 4.95,
          limit: 10,
        },
      },
    );
  });

  it("returns the response data", async () => {
    const payload = {
      error: null,
      payload: [{ user: { username: "u" }, workout: { key: "w" } }],
      metadata: { workoutcount: "1" },
    };
    const { resource } = workouts(payload);
    const result = await resource.within(box);

    expect(result).toEqual(payload);
  });
});

describe("WorkoutsResource.like", () => {
  it("POSTs to the reaction endpoint", async () => {
    const { client, resource } = workouts(undefined);
    await resource.like("abc123");

    expect(client.post).toHaveBeenCalledWith(
      "/apiserver/v1/workouts/reaction/abc123",
      { headers: { 'content-type': 'application/json' } }
    );
  });

  it("encodes special characters in workoutId", async () => {
    const { client, resource } = workouts(undefined);
    await resource.like("key/with/slashes");

    expect(client.post).toHaveBeenCalledWith(
      "/apiserver/v1/workouts/reaction/key%2Fwith%2Fslashes",
      { headers: { 'content-type': 'application/json' } }
    );
  });
});

describe("WorkoutsResource.unlike", () => {
  it("DELETEs the reaction endpoint", async () => {
    const { client, resource } = workouts(undefined);
    await resource.unlike("abc123");

    expect(client.delete).toHaveBeenCalledWith(
      "/apiserver/v1/workouts/reaction/abc123",
    );
  });

  it("encodes special characters in workoutId", async () => {
    const { client, resource } = workouts(undefined);
    await resource.unlike("key/with/slashes");

    expect(client.delete).toHaveBeenCalledWith(
      "/apiserver/v1/workouts/reaction/key%2Fwith%2Fslashes",
    );
  });
});

describe("WorkoutsResource.stats", () => {
  it("calls the correct URL", async () => {
    const { client, resource } = workouts({
      error: null,
      payload: [],
      metadata: {},
    });
    await resource.stats("johndoe");

    expect(client.get).toHaveBeenCalledWith(
      "/apiserver/v1/workouts/johndoe/stats",
    );
  });

  it("encodes special characters in username", async () => {
    const { client, resource } = workouts({});
    await resource.stats("john doe");

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
    const { resource } = workouts(payload);
    const result = await resource.stats("johndoe");

    expect(result).toEqual(payload);
  });
});

describe("WorkoutsResource.comment", () => {
  it("posts to the correct URL with JSON body", async () => {
    const { client, resource } = workouts({});
    await resource.comment("abc123", "nice run");

    expect(client.post).toHaveBeenCalledWith(
      "/apiserver/v1/workouts/comment/abc123",
      { body: "nice run" },
    );
  });

  it("encodes special characters in workoutKey", async () => {
    const { client, resource } = workouts({});
    await resource.comment("abc 123", "hi");

    expect(client.post).toHaveBeenCalledWith(
      "/apiserver/v1/workouts/comment/abc%20123",
      expect.anything(),
    );
  });

  it("resolves to undefined on success", async () => {
    const { resource } = workouts({});
    const result = await resource.comment("abc123", "nice run");

    expect(result).toBeUndefined();
  });
});
