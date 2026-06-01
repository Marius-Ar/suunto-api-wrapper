import { describe, expect, it, vi } from "vitest";
import { getUserByName, searchUsers } from "./index.js";
import type { HttpClient } from "../http";

function mockClient(data: unknown): HttpClient {
  return {
    get: vi.fn().mockResolvedValue({ data, status: 200, headers: new Headers() }),
  } as unknown as HttpClient;
}

describe("getUserByName", () => {
  it("calls the correct URL", async () => {
    const client = mockClient({ payload: {} });
    await getUserByName(client, "johndoe");

    expect(client.get).toHaveBeenCalledWith("/apiserver/v1/user/name/johndoe");
  });

  it("encodes special characters in username", async () => {
    const client = mockClient({});
    await getUserByName(client, "john doe");

    expect(client.get).toHaveBeenCalledWith(
      "/apiserver/v1/user/name/john%20doe",
    );
  });

  it("returns the response data", async () => {
    const payload = { error: null, payload: { username: "johndoe" } };
    const client = mockClient(payload);
    const result = await getUserByName(client, "johndoe");

    expect(result).toEqual(payload);
  });
});

describe("searchUsers", () => {
  it("calls the correct URL", async () => {
    const client = mockClient({ payload: [] });
    await searchUsers(client, "tttt");

    expect(client.get).toHaveBeenCalledWith("/apiserver/v1/user/search/tttt");
  });

  it("encodes special characters in the search terms", async () => {
    const client = mockClient({});
    await searchUsers(client, "john doe");

    expect(client.get).toHaveBeenCalledWith(
      "/apiserver/v1/user/search/john%20doe",
    );
  });

  it("returns the response data", async () => {
    const payload = {
      error: null,
      payload: [{ connection: "STRANGER", user: { username: "tttt" }, workout: null }],
    };
    const client = mockClient(payload);
    const result = await searchUsers(client, "tttt");

    expect(result).toEqual(payload);
  });
});
