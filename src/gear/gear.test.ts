import { describe, expect, it, vi } from "vitest";
import { getLatestGear } from "./index.js";
import type { HttpClient } from "../http";

function mockClient(data: unknown): HttpClient {
  return {
    get: vi.fn().mockResolvedValue({ data, status: 200, headers: new Headers() }),
  } as unknown as HttpClient;
}

describe("getLatestGear", () => {
  it("calls the correct URL with default params", async () => {
    const client = mockClient({ payload: [] });
    await getLatestGear(client, "johndoe");

    expect(client.get).toHaveBeenCalledWith(
      "/apiserver/v1/gear/johndoe/latest",
      { query: { allTypes: true } },
    );
  });

  it("encodes special characters in username", async () => {
    const client = mockClient({});
    await getLatestGear(client, "john doe");

    expect(client.get).toHaveBeenCalledWith(
      "/apiserver/v1/gear/john%20doe/latest",
      expect.anything(),
    );
  });

  it("forwards allTypes=false", async () => {
    const client = mockClient({});
    await getLatestGear(client, "johndoe", { allTypes: false });

    expect(client.get).toHaveBeenCalledWith(
      "/apiserver/v1/gear/johndoe/latest",
      { query: { allTypes: false } },
    );
  });

  it("returns the response data", async () => {
    const payload = { error: null, payload: [{ serialNumber: "abc" }] };
    const client = mockClient(payload);
    const result = await getLatestGear(client, "johndoe");

    expect(result).toEqual(payload);
  });
});
