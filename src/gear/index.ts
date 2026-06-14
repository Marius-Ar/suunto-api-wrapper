export * from "./types.js";

import type { HttpClient } from "../http";
import type { GetLatestGearParams, GearResponse } from "./types.js";

/** Gear endpoints, bound to an {@link HttpClient}. Accessed via `suunto.gear`. */
export class GearResource {
  constructor(private readonly client: HttpClient) {}

  /** A user's latest gear. */
  async latest(
    username: string,
    params: GetLatestGearParams = {},
  ): Promise<GearResponse> {
    const { allTypes = true } = params;
    const res = await this.client.get<GearResponse>(
      `/apiserver/v1/gear/${encodeURIComponent(username)}/latest`,
      { query: { allTypes } },
    );
    return res.data;
  }
}
