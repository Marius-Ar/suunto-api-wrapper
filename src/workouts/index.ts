export * from "./types.js";

import { endpoint, type HttpClient } from "../http";
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
  own(params: GetOwnWorkoutsParams = {}): Promise<WorkoutsResponse> {
    return endpoint<WorkoutsResponse>(this.client, {
      path: "/apiserver/v1/workouts",
      query: {
        offset: params.offset ?? 0,
        limit: params.limit ?? 50,
        since: params.since ?? 0,
      },
    });
  }

  /** A given user's public workouts. */
  public(
    username: string,
    params: GetWorkoutsParams = {},
  ): Promise<WorkoutsResponse> {
    return endpoint<WorkoutsResponse>(this.client, {
      path: `/apiserver/v1/workouts/${encodeURIComponent(username)}/public`,
      query: { limit: params.limit ?? 40, sortonst: params.sortonst ?? true },
    });
  }

  /**
   * A single workout by username and workout key. Works for any public workout
   * and, when the client is authenticated as the owner, for private ones too.
   */
  byKey(
    username: string,
    workoutKey: string,
    params: GetWorkoutParams = {},
  ): Promise<WorkoutResponse> {
    const extensions = params.extensions ?? DEFAULT_WORKOUT_EXTENSIONS;
    const additionalData = params.additionalData ?? DEFAULT_WORKOUT_ADDITIONAL_DATA;
    return endpoint<WorkoutResponse>(this.client, {
      path: `/apiserver/v2/workouts/${encodeURIComponent(username)}/${encodeURIComponent(workoutKey)}/combined`,
      query: {
        extensions: extensions.join(","),
        additionalData: additionalData.join(","),
      },
    });
  }

  /**
   * Aggregated workout stats per activity for the given user. Works
   * unauthenticated.
   */
  stats(username: string): Promise<WorkoutStatsResponse> {
    return endpoint<WorkoutStatsResponse>(this.client, {
      path: `/apiserver/v1/workouts/${encodeURIComponent(username)}/stats`,
    });
  }

  /**
   * Public workouts whose center position falls inside the given geographic
   * bounding box. Used by the "explore nearby" map view. Unauthenticated.
   */
  within(
    params: GetWorkoutsWithinParams,
  ): Promise<WorkoutsWithinResponse> {
    return endpoint<WorkoutsWithinResponse>(this.client, {
      path: "/apiserver/v1/workouts/public/within",
      query: {
        lowerlat: params.lowerLat,
        lowerlng: params.lowerLng,
        upperlat: params.upperLat,
        upperlng: params.upperLng,
        limit: params.limit ?? 50,
      },
    });
  }
}
