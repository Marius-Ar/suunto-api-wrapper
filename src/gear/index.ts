export * from "./types.js";

import type { HttpClient } from "../http";
import type { GetLatestGearParams, GearResponse } from "./types.js";

/** A user's latest gear. */
export async function getLatestGear(
  client: HttpClient,
  username: string,
  params: GetLatestGearParams = {},
): Promise<GearResponse> {
  const { allTypes = true } = params;
  const res = await client.get<GearResponse>(
    `/apiserver/v1/gear/${encodeURIComponent(username)}/latest`,
    { query: { allTypes } },
  );
  return res.data;
}

/** Gear endpoints, bound to an {@link HttpClient}. Accessed via `suunto.gear`. */
export class GearResource {
  constructor(private readonly client: HttpClient) {}

  /** A user's latest (?) gear. */
  latest(username: string, params?: GetLatestGearParams): Promise<GearResponse> {
    return getLatestGear(this.client, username, params);
  }
}
