export * from "./types.js";

import {Resource} from "../http/resource";
import {
  GetOwnWorkoutsParams,
  GetWorkoutParams,
  GetWorkoutsParams,
  GetWorkoutsWithinParams,
  WorkoutAdditionalData,
  WorkoutExtensionName,
  WorkoutResponse,
  WorkoutsResponse,
  WorkoutStatsResponse,
  WorkoutsWithinResponse,
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
export class WorkoutsResource extends Resource {
  /** The authenticated user's own workouts. */
  own(params: GetOwnWorkoutsParams = {}): Promise<WorkoutsResponse> {
    return this.call<WorkoutsResponse>({
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
    return this.call<WorkoutsResponse>({
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
    return this.call<WorkoutResponse>({
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
    return this.call<WorkoutStatsResponse>({
      path: `/apiserver/v1/workouts/${encodeURIComponent(username)}/stats`,
    });
  }

  /**
   * Post a comment on a workout. Returns the created comment in the response
   * payload. Requires authentication.
   */
  async comment(
    workoutKey: string,
    comment: string,
  ): Promise<void> {
    await this.client.post<void>(
      `/apiserver/v1/workouts/comment/${encodeURIComponent(workoutKey)}`,
      { body: comment },
    );
  }

  /**
   * Public workouts whose center position falls inside the given geographic
   * bounding box. Used by the "explore nearby" map view. Unauthenticated.
   */
  within(
    params: GetWorkoutsWithinParams,
  ): Promise<WorkoutsWithinResponse> {
    return this.call<WorkoutsWithinResponse>({
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
