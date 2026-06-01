import { describe, expect, it, vi } from "vitest";
import { getWorkouts, getOwnWorkouts } from "./index.js";
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
