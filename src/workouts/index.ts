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

/** Workout endpoints, bound to an {@link HttpClient}. Accessed via `suunto.workouts`. */
export class WorkoutsResource {
  constructor(private readonly client: HttpClient) {}

  /** The authenticated user's own workouts. */
  async own(params: GetOwnWorkoutsParams = {}): Promise<WorkoutsResponse> {
    const { offset = 0, limit = 50, since = 0 } = params;

    const searchParams = new URLSearchParams();
    searchParams.append("offset", String(offset));
    searchParams.append("limit", String(limit));
    searchParams.append("since", String(since));

    const res = await this.client.get<WorkoutsResponse>(
      `/apiserver/v1/workouts?${searchParams.toString()}`,
    );
    return res.data;
  }

  /** A given user's public workouts. */
  async public(
    username: string,
    params: GetWorkoutsParams = {},
  ): Promise<WorkoutsResponse> {
    const { limit = 40, sortonst = true } = params;
    const res = await this.client.get<WorkoutsResponse>(
      `/apiserver/v1/workouts/${encodeURIComponent(username)}/public`,
      { query: { limit, sortonst } },
    );
    return res.data;
  }

  /**
   * A single workout by username and workout key. Works for any public workout
   * and, when the client is authenticated as the owner, for private ones too.
   */
  async byKey(
    username: string,
    workoutKey: string,
    params: GetWorkoutParams = {},
  ): Promise<WorkoutResponse> {
    const {
      extensions = DEFAULT_WORKOUT_EXTENSIONS,
      additionalData = DEFAULT_WORKOUT_ADDITIONAL_DATA,
    } = params;

    const res = await this.client.get<WorkoutResponse>(
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
   * Aggregated workout stats per activity for the given user. Works
   * unauthenticated.
   */
  async stats(username: string): Promise<WorkoutStatsResponse> {
    const res = await this.client.get<WorkoutStatsResponse>(
      `/apiserver/v1/workouts/${encodeURIComponent(username)}/stats`,
    );
    return res.data;
  }

  /**
   * Public workouts whose center position falls inside the given geographic
   * bounding box. Used by the "explore nearby" map view. Unauthenticated.
   */
  async within(
    params: GetWorkoutsWithinParams,
  ): Promise<WorkoutsWithinResponse> {
    const { lowerLat, lowerLng, upperLat, upperLng, limit = 50 } = params;
    const res = await this.client.get<WorkoutsWithinResponse>(
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
}
