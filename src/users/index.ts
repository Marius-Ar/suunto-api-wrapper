export * from "./types.js";

import type { HttpClient } from "../http";
import type { UserProfileResponse, UserSearchResponse } from "./types.js";

/**
 * Fetch a user's public profile by username. Unauthenticated — no session
 * required.
 */
export async function getUserByName(
  client: HttpClient,
  username: string,
): Promise<UserProfileResponse> {
  const res = await client.get<UserProfileResponse>(
    `/apiserver/v1/user/name/${encodeURIComponent(username)}`,
  );
  return res.data;
}

/** Search for users by name/username. */
export async function searchUsers(
  client: HttpClient,
  searchTerms: string,
): Promise<UserSearchResponse> {
  const res = await client.get<UserSearchResponse>(
    `/apiserver/v1/user/search/${encodeURIComponent(searchTerms)}`,
  );
  return res.data;
}

/** User endpoints, bound to an {@link HttpClient}. Accessed via `suunto.users`. */
export class UsersResource {
  constructor(private readonly client: HttpClient) {}

  /** A user's public profile, by username. */
  byName(username: string): Promise<UserProfileResponse> {
    return getUserByName(this.client, username);
  }

  /** Search for users by name/username. */
  search(searchTerms: string): Promise<UserSearchResponse> {
    return searchUsers(this.client, searchTerms);
  }
}
