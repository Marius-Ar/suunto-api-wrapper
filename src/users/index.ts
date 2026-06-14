export * from "./types.js";

import { endpoint, type HttpClient } from "../http";
import type { UserProfileResponse, UserSearchResponse } from "./types.js";

/** User endpoints, bound to an {@link HttpClient}. Accessed via `suunto.users`. */
export class UsersResource {
  constructor(private readonly client: HttpClient) {}

  /** A user's public profile, by username. */
  byName(username: string): Promise<UserProfileResponse> {
    return endpoint<UserProfileResponse>(this.client, {
      path: `/apiserver/v1/user/name/${encodeURIComponent(username)}`,
    });
  }

  /** Search for users by name/username. */
  search(searchTerms: string): Promise<UserSearchResponse> {
    return endpoint<UserSearchResponse>(this.client, {
      path: `/apiserver/v1/user/search/${encodeURIComponent(searchTerms)}`,
    });
  }
}
