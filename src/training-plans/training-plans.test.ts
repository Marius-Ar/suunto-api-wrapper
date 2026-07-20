import { describe, expect, it } from "vitest";
import { mockClient } from "../testing.js";
import { TrainingPlansResource } from "./index.js";

function plans(data: unknown = { error: null, payload: [], metadata: { ts: "1" } }) {
  const client = mockClient(data);
  return { client, resource: new TrainingPlansResource(client) };
}

describe("TrainingPlansResource", () => {
  it.each([
    ["catalogue", "/apiserver/v1/trainingplanning/catalogue"],
    ["list", "/apiserver/v1/trainingplanning/plans"],
    ["active", "/apiserver/v1/trainingplanning/plans/active"],
    ["last", "/apiserver/v1/trainingplanning/plans/last"],
  ] as const)("%s calls the correct URL", async (method, path) => {
    const { client, resource } = plans();
    await resource[method]();
    expect(client.get).toHaveBeenCalledWith(path);
  });

  it("gets a plan by its URL-encoded id", async () => {
    const { client, resource } = plans();
    await resource.byId("plan id/1");
    expect(client.get).toHaveBeenCalledWith(
      "/apiserver/v1/trainingplanning/plans/plan%20id%2F1",
    );
  });

  it("returns the response data", async () => {
    const response = { error: null, payload: [{ id: "plan-1" }], metadata: { ts: "1" } };
    const { resource } = plans(response);
    await expect(resource.list()).resolves.toEqual(response);
  });
});
