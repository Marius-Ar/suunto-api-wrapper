import { describe, expect, it } from "vitest";
import { GearResource } from "./index.js";
import { mockClient } from "../testing.js";

function gear(data: unknown) {
  const client = mockClient(data);
  return { client, resource: new GearResource(client) };
}

describe("GearResource.latest", () => {
  it("calls the correct URL with default params", async () => {
    const { client, resource } = gear({ payload: [] });
    await resource.latest("johndoe");

    expect(client.get).toHaveBeenCalledWith(
      "/apiserver/v1/gear/johndoe/latest",
      { query: { allTypes: true } },
    );
  });

  it("encodes special characters in username", async () => {
    const { client, resource } = gear({});
    await resource.latest("john doe");

    expect(client.get).toHaveBeenCalledWith(
      "/apiserver/v1/gear/john%20doe/latest",
      expect.anything(),
    );
  });

  it("forwards allTypes=false", async () => {
    const { client, resource } = gear({});
    await resource.latest("johndoe", { allTypes: false });

    expect(client.get).toHaveBeenCalledWith(
      "/apiserver/v1/gear/johndoe/latest",
      { query: { allTypes: false } },
    );
  });

  it("returns the response data", async () => {
    const payload = { error: null, payload: [{ serialNumber: "abc" }] };
    const { resource } = gear(payload);
    const result = await resource.latest("johndoe");

    expect(result).toEqual(payload);
  });
});
