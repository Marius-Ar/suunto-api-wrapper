export * from "./types.js";

import type { HttpClient } from "../http";
import {
  GetOwnWorkoutsParams,
  GetWorkoutParams,
  GetWorkoutsParams,
  GetWorkoutsWithinParams,
  WorkoutAdditionalData,
  WorkoutExtensionName,
  WorkoutResponse,
  WorkoutsResponse,
  WorkoutsWithinResponse,
  WorkoutStatsResponse,
} from "./types.js";

const DEFAULT_WORKOUT_EXTENSIONS: WorkoutExtensionName[] = [
  WorkoutExtensionName.Summary,
  WorkoutExtensionName.CompetitionHeader,
];

const DEFAULT_WORKOUT_ADDITIONAL_DATA: WorkoutAdditionalData[] = [
  WorkoutAdditionalData.Achievements,
  WorkoutAdditionalData.Photos,
  WorkoutAdditionalData.Videos,
  WorkoutAdditionalData.Comments,
  WorkoutAdditionalData.UserReacted,
];

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

export async function getWorkout(
    client: HttpClient,
    username: string,
    workoutKey: string,
    params: GetWorkoutParams = {},
): Promise<WorkoutResponse> {
  const {
    extensions = DEFAULT_WORKOUT_EXTENSIONS,
    additionalData = DEFAULT_WORKOUT_ADDITIONAL_DATA,
  } = params;

  const res = await client.get<WorkoutResponse>(
      `/apiserver/v2/workouts/${encodeURIComponent(username)}/${encodeURIComponent(workoutKey)}/combined`,
      {
        query: {
          extensions: extensions.join(","),
          additionalData: additionalData.join(","),
        },
      },
  );
  return res.data;
}

/**
 * Public workouts whose center position falls inside the given geographic
 * bounding box. Used by the "explore nearby" map view. Unauthenticated.
 */
export async function getWorkoutsWithin(
  client: HttpClient,
  params: GetWorkoutsWithinParams,
): Promise<WorkoutsWithinResponse> {
  const { lowerLat, lowerLng, upperLat, upperLng, limit = 50 } = params;
  const res = await client.get<WorkoutsWithinResponse>(
    "/apiserver/v1/workouts/public/within",
    {
      query: {
        lowerlat: lowerLat,
        lowerlng: lowerLng,
        upperlat: upperLat,
        upperlng: upperLng,
        limit,
      },
    },
  );
  return res.data;
}

/**
 * Aggregated workout stats per activity for a user. Unauthenticated — no
 * session required.
 */
export async function getWorkoutStats(
  client: HttpClient,
  username: string,
): Promise<WorkoutStatsResponse> {
  const res = await client.get<WorkoutStatsResponse>(
    `/apiserver/v1/workouts/${encodeURIComponent(username)}/stats`,
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

  /**
   * A single workout by username and workout key. Works for any public workout
   * and, when the client is authenticated as the owner, for private ones too.
   */
  byKey(
    username: string,
    workoutKey: string,
    params?: GetWorkoutParams,
  ): Promise<WorkoutResponse> {
    return getWorkout(this.client, username, workoutKey, params);
  }

  /**
   * Aggregated workout stats per activity for the given user. Works
   * unauthenticated.
   */
  stats(username: string): Promise<WorkoutStatsResponse> {
    return getWorkoutStats(this.client, username);
  }

  /** Public workouts whose center falls inside a geographic bounding box. */
  within(params: GetWorkoutsWithinParams): Promise<WorkoutsWithinResponse> {
    return getWorkoutsWithin(this.client, params);
  }
}