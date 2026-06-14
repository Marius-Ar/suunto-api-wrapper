import {describe, expect, it} from "vitest";
import {UsersResource} from "./index";
import {mockClient} from "../testing.js";

function users(data: unknown) {
  const client = mockClient(data);
  return {client, resource: new UsersResource(client)}
}

describe("getUserByName", () => {
  it("calls the correct URL", async () => {
    const {client, resource} = users([]);
    await resource.byName("johndoe");

    expect(client.get).toHaveBeenCalledWith("/apiserver/v1/user/name/johndoe");
  });

  it("encodes special characters in username", async () => {
    const {client, resource} = users([]);
    await resource.byName("john doe");

    expect(client.get).toHaveBeenCalledWith(
      "/apiserver/v1/user/name/john%20doe",
    );
  });

  it("returns the response data", async () => {
    const payload = { error: null, payload: { username: "johndoe" } };
    const {resource} = users(payload);
    const result = await resource.byName("johndoe");

    expect(result).toEqual(payload);
  });
});

describe("searchUsers", () => {
  it("calls the correct URL", async () => {
    const {client, resource} = users([]);
    await resource.search("tttt");

    expect(client.get).toHaveBeenCalledWith("/apiserver/v1/user/search/tttt");
  });

  it("encodes special characters in the search terms", async () => {
    const {client, resource} = users([]);
    await resource.search("john doe");

    expect(client.get).toHaveBeenCalledWith(
      "/apiserver/v1/user/search/john%20doe",
    );
  });

  it("returns the response data", async () => {
    const payload = {
      error: null,
      payload: [{ connection: "STRANGER", user: { username: "tttt" }, workout: null }],
    };
    const {resource} = users(payload);
    const result = await resource.search("tttt");

    expect(result).toEqual(payload);
  });
});
