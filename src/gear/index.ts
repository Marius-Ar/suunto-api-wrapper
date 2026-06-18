export * from "./types.js";

import { Resource } from "../http/resource";
import type { GetLatestGearParams, GearResponse } from "./types.js";

/** Gear endpoints, bound to an {@link HttpClient}. Accessed via `suunto.gear`. */
export class GearResource extends Resource {
  private static readonly BASE_PATH = "/apiserver/v1/gear";

  /** A user's latest gear. */
  latest(
    username: string,
    params: GetLatestGearParams = {},
  ): Promise<GearResponse> {
    return this.call<GearResponse>({
      path: `${GearResource.BASE_PATH}/${encodeURIComponent(username)}/latest`,
      query: { allTypes: params.allTypes ?? true },
    });
  }
}
