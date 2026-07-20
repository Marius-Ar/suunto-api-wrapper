export interface TrainingPlanningResponse<T> {
  error: string | null;
  payload: T;
  metadata: { ts: string };
}

export interface TrainingTargetRange {
  min: number | null;
  max: number | null;
}

export interface PlannedWorkout {
  activityId: number;
  dayOfWeek: number;
  trainingDate: string;
  duration: number;
  intensityZone: number | null;
  targetPace: TrainingTargetRange | null;
  targetHeartRate: TrainingTargetRange | null;
  targetPower: TrainingTargetRange | null;
  avgSpeed: number | null;
  trainingStressScore: number | null;
  estimatedDistanceInMeters: number | null;
  name: string;
  impacts: string[];
  notes: string;
  markdownNotes: string;
  guideId: string | null;
}

export interface WeeklyTargets {
  duration: number;
  trainingLoad: number;
  distance: number;
}

export interface WeeklyProgram {
  weekNumber: number;
  startDate: string;
  goal: string;
  note: string;
  weeklyTargets: WeeklyTargets;
  plannedWorkouts: PlannedWorkout[];
}

export interface TrainingPlanHeader {
  id: string;
  type: string;
  name: string;
  version: string;
  mainSport: string;
  sports: number[];
  durationWeeks: number;
  thumbnailUrl: string;
  level: string;
  focus: string;
  createdAt: string;
  updatedAt: string;
}

export interface TrainingPlan {
  id: string;
  name: string;
  status: string;
  durationWeeks: number;
  startDate: string;
  targetDate: string;
  firstDayOfWeek: string;
  metaPlanId: string;
  weeklyPrograms: WeeklyProgram[];
  answers: unknown[];
  metaPlanHeader: TrainingPlanHeader;
  questions: unknown[];
  description: string;
  richInfo: string;
}

export interface TrainingPlanCatalogueCategory {
  id: string;
  name: string;
  iconUrl: string;
  refs: string[];
}

export interface TrainingPlanCatalogue {
  categories: TrainingPlanCatalogueCategory[];
  plans: TrainingPlanHeader[];
}

export type TrainingPlanResponse = TrainingPlanningResponse<TrainingPlan>;
export type TrainingPlansResponse = TrainingPlanningResponse<TrainingPlan[]>;
export type TrainingPlanCatalogueResponse =
  TrainingPlanningResponse<TrainingPlanCatalogue>;
