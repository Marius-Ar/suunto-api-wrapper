import { SuuntoActivityType } from "../common/types";

/** Standard API envelope returned by the training-planning endpoints. */
export interface TrainingPlanningResponse<T> {
  /** Backend error message, or `null` on success. */
  error: string | null;
  /** Endpoint-specific response body. */
  payload: T;
  /** Response metadata; `ts` is the server timestamp in epoch milliseconds. */
  metadata: { ts: string };
}

/** Inclusive numeric target range; either bound may be open (`null`). */
export interface TrainingTargetRange {
  min: number | null;
  max: number | null;
}

/** One workout scheduled inside a generated Suunto Coach plan. */
export interface PlannedWorkout {
  /** Suunto activity ID for the workout. */
  activityId: SuuntoActivityType;
  /** ISO-8601 weekday number: 1 = Monday, 7 = Sunday. */
  dayOfWeek: number;
  /** Scheduled local date in `YYYY-MM-DD` format. */
  trainingDate: string;
  /** Planned duration in seconds. */
  duration: number;
  /** Suunto intensity zone number, or `null` when no zone is prescribed. */
  intensityZone: number | null;
  /** Target pace in decimal minutes per kilometre. */
  targetPace: TrainingTargetRange | null;
  /** Target heart rate in beats per minute. */
  targetHeartRate: TrainingTargetRange | null;
  /** Target power in watts. */
  targetPower: TrainingTargetRange | null;
  /** Expected average speed in metres per second. */
  avgSpeed: number | null;
  /** Planned Training Stress Score (TSS). */
  trainingStressScore: number | null;
  /** Estimated workout distance in metres. */
  estimatedDistanceInMeters: number | null;
  /** Display name supplied by the plan. */
  name: string;
  /** Intended physiological training impacts. */
  impacts: string[];
  /** Plain-text coach instructions. */
  notes: string;
  /** Detailed coach instructions formatted as Markdown. */
  markdownNotes: string;
  /** Associated SuuntoPlus guide ID, or `null` until one is generated. */
  guideId: string | null;
}

/** Aggregate targets for one week of the plan. */
export interface WeeklyTargets {
  /** Total planned duration in seconds. */
  duration: number;
  /** Total planned training load (TSS). */
  trainingLoad: number;
  /** Total planned distance in metres. */
  distance: number;
}

/** One numbered week inside a generated training plan. */
export interface WeeklyProgram {
  /** One-based week number within the plan. */
  weekNumber: number;
  /** Week start date in `YYYY-MM-DD` format. */
  startDate: string;
  /** Main training objective for the week. */
  goal: string;
  /** Additional coach note for the week. */
  note: string;
  weeklyTargets: WeeklyTargets;
  plannedWorkouts: PlannedWorkout[];
}

/** Catalogue metadata describing a Suunto Coach programme template. */
export interface TrainingPlanHeader {
  id: string;
  type: string;
  name: string;
  version: string;
  mainSport: string;
  /** Suunto activity IDs supported by the programme. */
  sports: SuuntoActivityType[];
  /** Programme length in weeks. */
  durationWeeks: number;
  thumbnailUrl: string;
  level: string;
  /** Programme focus; absent on some catalogue entries. */
  focus?: string;
  /** Creation timestamp in ISO-8601 format. */
  createdAt: string;
  /** Last-update timestamp in ISO-8601 format. */
  updatedAt: string;
}

/** A generated, user-specific Suunto Coach training plan. */
export interface TrainingPlan {
  id: string;
  name: string;
  status: string;
  /** Planned duration in weeks. */
  durationWeeks: number;
  /** Plan start date in `YYYY-MM-DD` format. */
  startDate: string;
  /** Plan target/end date in `YYYY-MM-DD` format. */
  targetDate: string;
  /** Uppercase weekday name used as the week boundary, e.g. `"MONDAY"`. */
  firstDayOfWeek: string;
  metaPlanId: string;
  weeklyPrograms: WeeklyProgram[];
  /** Answers submitted to the programme questionnaire. */
  answers: unknown[];
  metaPlanHeader: TrainingPlanHeader;
  /** Questionnaire definitions used to generate the plan. */
  questions: unknown[];
  description: string;
  /** Long programme description formatted as Markdown. */
  richInfo: string;
}

/** Category used to group programme templates in the catalogue. */
export interface TrainingPlanCatalogueCategory {
  id: string;
  name: string;
  iconUrl: string;
  refs: string[];
}

/** Available Suunto Coach programme categories and templates. */
export interface TrainingPlanCatalogue {
  categories: TrainingPlanCatalogueCategory[];
  plans: TrainingPlanHeader[];
}

export type TrainingPlanResponse = TrainingPlanningResponse<TrainingPlan>;
export type TrainingPlansResponse = TrainingPlanningResponse<TrainingPlan[]>;
export type TrainingPlanCatalogueResponse =
  TrainingPlanningResponse<TrainingPlanCatalogue>;
