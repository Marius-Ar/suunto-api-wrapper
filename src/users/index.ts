export * from "./types.js";

import type {HttpClient} from "../http";
import type {UserProfileResponse, UserSearchResponse} from "./types.js";

/** User endpoints, bound to an {@link HttpClient}. Accessed via `suunto.users`. */
export class UsersResource {
  constructor(private readonly client: HttpClient) {}

  /** A user's public profile, by username. */
  async byName(username: string): Promise<UserProfileResponse> {
    const res = await this.client.get<UserProfileResponse>(
        `/apiserver/v1/user/name/${encodeURIComponent(username)}`,
    );
    return res.data;
  }

  /** Search for users by name/username. */
  async search(searchTerms: string): Promise<UserSearchResponse> {
    const res = await this.client.get<UserSearchResponse>(
        `/apiserver/v1/user/search/${encodeURIComponent(searchTerms)}`,
    );
    return res.data;
  }
}
