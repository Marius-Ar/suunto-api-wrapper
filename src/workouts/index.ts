export * from "./types.js";

import type { HttpClient } from "../http";
import {GetOwnWorkoutsParams, GetWorkoutsParams, WorkoutsResponse} from "./types.js";

export async function getWorkouts(
  client: HttpClient,
  username: string,
  params: GetWorkoutsParams = {},
): Promise<WorkoutsResponse> {
  const { limit = 40, sortonst = true } = params;
  const res = await client.get<WorkoutsResponse>(
    `/apiserver/v1/workouts/${encodeURIComponent(username)}/public`,
    { query: { limit, sortonst } },
  );
  return res.data;
}

export async function getOwnWorkouts(
    client: HttpClient,
    params: GetOwnWorkoutsParams = {},
): Promise<WorkoutsResponse> {
  const { offset = 0, limit = 50, since = 0 } = params;

  const searchParams = new URLSearchParams();
  searchParams.append('offset', String(offset));
  searchParams.append('limit', String(limit));
  searchParams.append('since', String(since));

  const res = await client.get<WorkoutsResponse>(
      `/apiserver/v1/workouts?${searchParams.toString()}`
  );
  return res.data;
}

/** Workout endpoints, bound to an {@link HttpClient}. Accessed via `suunto.workouts`. */
export class WorkoutsResource {
  constructor(private readonly client: HttpClient) {}

  /** The authenticated user's own workouts. */
  own(params?: GetOwnWorkoutsParams): Promise<WorkoutsResponse> {
    return getOwnWorkouts(this.client, params);
  }

  /** A given user's public workouts. */
  public(username: string, params?: GetWorkoutsParams): Promise<WorkoutsResponse> {
    return getWorkouts(this.client, username, params);
  }
}