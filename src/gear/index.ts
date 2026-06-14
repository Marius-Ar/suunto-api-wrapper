export * from "./types.js";

import { endpoint, type HttpClient } from "../http";
import type { GetLatestGearParams, GearResponse } from "./types.js";

/** Gear endpoints, bound to an {@link HttpClient}. Accessed via `suunto.gear`. */
export class GearResource {
  constructor(private readonly client: HttpClient) {}

  /** A user's latest gear. */
  latest(
    username: string,
    params: GetLatestGearParams = {},
  ): Promise<GearResponse> {
    return endpoint<GearResponse>(this.client, {
      path: `/apiserver/v1/gear/${encodeURIComponent(username)}/latest`,
      query: { allTypes: params.allTypes ?? true },
    });
  }
}
