export * from "./types.js";

import { Resource } from "../http/resource";
import type {
  TrainingPlanCatalogueResponse,
  TrainingPlanResponse,
  TrainingPlansResponse,
} from "./types.js";

/** Suunto Coach / My Plan endpoints. Accessed via `suunto.trainingPlans`. */
export class TrainingPlansResource extends Resource {
  private static readonly BASE_PATH = "/apiserver/v1/trainingplanning";

  /** Lists the training programmes available in the Suunto Coach catalogue. */
  catalogue(): Promise<TrainingPlanCatalogueResponse> {
    return this.call({ path: `${TrainingPlansResource.BASE_PATH}/catalogue` });
  }

  /** Lists the authenticated user's current and previous generated plans. */
  list(): Promise<TrainingPlansResponse> {
    return this.call({ path: `${TrainingPlansResource.BASE_PATH}/plans` });
  }

  /** Returns the authenticated user's active generated plan. */
  active(): Promise<TrainingPlanResponse> {
    return this.call({ path: `${TrainingPlansResource.BASE_PATH}/plans/active` });
  }

  /** Returns the authenticated user's most recently generated plan. */
  last(): Promise<TrainingPlanResponse> {
    return this.call({ path: `${TrainingPlansResource.BASE_PATH}/plans/last` });
  }

  /** Returns a generated plan by id. */
  byId(planId: string): Promise<TrainingPlanResponse> {
    return this.call({
      path: `${TrainingPlansResource.BASE_PATH}/plans/${encodeURIComponent(planId)}`,
    });
  }
}
