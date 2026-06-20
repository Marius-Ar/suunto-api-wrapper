export * from "./types.js";

import { Resource } from "../http/resource";
import type { UserProfileResponse, UserSearchResponse } from "./types.js";

/** User endpoints, bound to an {@link HttpClient}. Accessed via `suunto.users`. */
export class UsersResource extends Resource {
  private static readonly BASE_PATH = "/apiserver/v1/user";

  /** A user's public profile, by username. */
  byName(username: string): Promise<UserProfileResponse> {
    return this.call<UserProfileResponse>({
      path: `${UsersResource.BASE_PATH}/name/${encodeURIComponent(username)}`,
    });
  }

  /** Search for users by name/username. */
  search(searchTerms: string): Promise<UserSearchResponse> {
    return this.call<UserSearchResponse>({
      path: `${UsersResource.BASE_PATH}/search/${encodeURIComponent(searchTerms)}`,
    });
  }
}
