import type { SearchUser } from "../users";
import {SuuntoActivityType} from "../common/types";
export { SuuntoActivityType };

// ─── Query params ────────────────────────────────────────────────────────────

export interface GetWorkoutsParams {
  limit?: number;
  sortonst?: boolean;
}

export interface GetOwnWorkoutsParams {
  since?: number;
  offset?: number;
  limit?: number;
}

/** Bounding-box query for {@link getWorkoutsWithin}. All coords in decimal degrees. */
export interface GetWorkoutsWithinParams {
  /** South latitude of the bounding box. */
  lowerLat: number;
  /** West longitude of the bounding box. */
  lowerLng: number;
  /** North latitude of the bounding box. */
  upperLat: number;
  /** East longitude of the bounding box. */
  upperLng: number;
  /** Max results. Defaults to 50. */
  limit?: number;
}

/** Valid values for the `extensions` query param on the single-workout endpoint. */
export enum WorkoutExtensionName {
  Dive = "DiveExtension",
  JumpRope = "JumpRopeExtension",
  Summary = "SummaryExtension",
  Swimming = "SwimmingExtension",
  Weather = "WeatherExtension",
  Workout = "WorkoutExtension",
  CompetitionHeader = "CompetitionHeaderExtension",
}

/** Valid values for the `additionalData` query param on the single-workout endpoint. */
export enum WorkoutAdditionalData {
  Achievements = "achievements",
  Photos = "photos",
  Videos = "videos",
  Comments = "comments",
  UserReacted = "user_reacted",
}

export interface GetWorkoutParams {
  /** Extensions to include in the response. Defaults to `[Summary, CompetitionHeader]`. */
  extensions?: WorkoutExtensionName[];
  /** Extra data blocks to include. Defaults to all five values. */
  additionalData?: WorkoutAdditionalData[];
}

// ─── Shared primitives ───────────────────────────────────────────────────────

/** GPS coordinate: x = longitude, y = latitude. */
export interface Position {
  x: number;
  y: number;
}

export interface Cadence {
  max: number;
  avg: number;
}

export interface HrData {
  workoutMaxHR: number;
  workoutAvgHR: number;
  userMaxHR: number;
  avg: number;
  hrmax: number;
  max: number;
}

export interface Gear {
  manufacturer: string;
  name: string;
  displayName: string;
  serialNumber: string;
  softwareVersion: string;
  hardwareVersion: string;
  productType: string;
}

export interface HeartRateRecovery {
  comparisonLevel: string;
  drop: number;
  level: string;
}

// ─── TSS ─────────────────────────────────────────────────────────────────────

export interface TssEntry {
  calculationMethod: string;
  trainingStressScore: number;
  intensityFactor: number | null;
  normalizedPower: number | null;
  averageGradeAdjustedPace: number | null;
}

// ─── Rankings ────────────────────────────────────────────────────────────────

export interface RouteRanking {
  originalRanking: number;
  originalNumberOfWorkouts: number;
}

export interface Rankings {
  totalTimeOnRouteRanking: RouteRanking;
}

// ─── Achievements ────────────────────────────────────────────────────────────

export interface ActivityCounts {
  timeCategory: number;
  currentCount: number;
  previousCount: number | null;
  firstInCount: number | null;
  activityCount: number | null;
  activityTypeCount: number | null;
}

export interface CumulativeAchievement {
  description: number;
  activityCounts: ActivityCounts;
}

export interface PersonalBestAchievement {
  timeCategory: number;
  valueCategory: number;
  since: string | null;
}

export interface ClientCalculatedAchievements {
  cumulativeAchievements: CumulativeAchievement[];
  personalBestAchievements: PersonalBestAchievement[];
}

// ─── Comments & reactions ────────────────────────────────────────────────────

export interface WorkoutComment {
  key: string;
  timestamp: number;
  username: string;
  realname: string;
  profilePictureUrl: string | null;
  comment: string;
}

export interface WorkoutReaction {
  utfCode: string;
  count: number;
  userReacted: boolean;
}

// ─── Extensions (discriminated union) ────────────────────────────────────────

export interface IntensityZone {
  totalTime: number;
  lowerLimit: number;
}

export interface IntensityZones {
  zone1: IntensityZone;
  zone2: IntensityZone;
  zone3: IntensityZone;
  zone4: IntensityZone;
  zone5: IntensityZone;
}

export interface FitnessExtension {
  type: "FitnessExtension";
  maxHeartRate: number | null;
  vo2Max: number | null;
  estimatedVo2Max: number | null;
  fitnessAge: number | null;
}

export interface IntensityExtension {
  type: "IntensityExtension";
  zones: {
    heartRate: IntensityZones | null;
    speed: IntensityZones | null;
    power: IntensityZones | null;
  };
  physiologicalThresholds: unknown | null;
  overallIntensity: unknown | null;
}

export interface SummaryExtension {
  type: "SummaryExtension";
  avgSpeed: number | null;
  avgPower: number | null;
  maxPower: number | null;
  avgVerticalOscillation: number | null;
  avgStrideLength: number | null;
  avgGroundContactTime: number | null;
  avgCadence: number | null;
  maxCadence: number | null;
  ascent: number | null;
  descent: number | null;
  ascentTime: number | null;
  descentTime: number | null;
  pte: number | null;
  peakEpoc: number | null;
  performanceLevel: number | null;
  recoveryTime: number | null;
  weather: unknown | null;
  minTemperature: number | null;
  avgTemperature: number | null;
  maxTemperature: number | null;
  workoutType: unknown | null;
  /** 1–5 rating, or null if not set. */
  feeling: number | null;
  tags: unknown | null;
  gear: Gear | null;
  additionalGears: unknown | null;
  exerciseId: string;
  apps: unknown[];
  repetitionCount: number | null;
  lacticThHr: number | null;
  avgAscentSpeed: number | null;
  maxAscentSpeed: number | null;
  avgDescentSpeed: number | null;
  maxDescentSpeed: number | null;
  avgDistancePerStroke: number | null;
  fatConsumption: number | null;
  carbohydrateConsumption: number | null;
  avgLeftGroundContactBalance: number | null;
  avgRightGroundContactBalance: number | null;
  lacticThPace: number | null;
  avgFlightTime: number | null;
  avgContactTimeRatio: number | null;
  teamSportId: unknown | null;
  heartRateRecovery: HeartRateRecovery | null;
  finalEndurance: unknown | null;
  minimumEndurance: unknown | null;
  curEnduranceDistance: unknown | null;
  minEnduranceDistance: unknown | null;
  enduranceValid: unknown | null;
}

/** Present on outdoor workouts that have weather data. */
export interface WeatherExtension {
  type: "WeatherExtension";
  weatherIcon: string;
  temperature: number;
  windSpeed: number;
  windDirection: number;
  humidity: number;
}

/** Present only on pool-swimming workouts (activityId 21). */
export interface SwimmingHeaderExtension {
  type: "SwimmingHeaderExtension";
  avgSwolf: number;
  avgStrokeRate: number;
  poolLength: number;
  breaststrokeGlideTime: number | null;
  ventilationFrequency: number | null;
  avgFreestyleBreathAngle: number | null;
  maxFreestyleBreathAngle: number | null;
  freestyleGlideAngle: number | null;
  avgBreaststrokeBreathAngle: number | null;
  maxBreaststrokeBreathAngle: number | null;
  freestyleDuration: number | null;
  breaststrokeDuration: number | null;
  otherStylesDuration: number | null;
  freestylePercent: number | null;
  breaststrokePercent: number | null;
  otherStylesPercent: number | null;
  breaststrokeHeadAngle: number | null;
}

export type WorkoutExtension =
  | FitnessExtension
  | IntensityExtension
  | SummaryExtension
  | WeatherExtension
  | SwimmingHeaderExtension;

// ─── Workout ─────────────────────────────────────────────────────────────────

export interface Workout {
  username: string;
  sharingFlags: number;
  activityId: SuuntoActivityType;
  key: string;
  startTime: number;
  stopTime: number;
  totalTime: number;
  estimatedFloorsClimbed: number;
  totalDistance: number;
  totalAscent: number;
  totalDescent: number;
  startPosition: Position;
  stopPosition: Position;
  centerPosition: Position;
  maxSpeed: number;
  /** Encoded polyline string. Absent on indoor/GPS-less workouts. */
  polyline?: string;
  stepCount: number;
  recoveryTime: number;
  cumulativeRecoveryTime: number;
  rankings: Rankings;
  extensions: WorkoutExtension[];
  /** Absent on pool-swimming workouts. */
  minAltitude?: number;
  /** Absent on pool-swimming workouts. */
  maxAltitude?: number;
  isManuallyAdded: boolean;
  tss: TssEntry;
  tssList: TssEntry[];
  suuntoTags: string[];
  /** Absent on some workouts (e.g. when the user has no achievements yet). */
  clientCalculatedAchievements?: ClientCalculatedAchievements;
  workoutKey: string;
  visibilityFacebook: boolean;
  visibilityTwitter: boolean;
  viewCount: number;
  visibilityGroups: boolean;
  pictureCount: number;
  commentCount: number;
  reactionCount: number;
  created: number;
  timeInZone0: number;
  timeInZone1: number;
  timeInZone2: number;
  timeInZone3: number;
  timeInZone4: number;
  timeInZone5: number;
  visibilityExplore: boolean;
  avgPace: number;
  visibilityFriends: boolean;
  energyConsumption: number;
  avgSpeed: number;
  hrdata: HrData;
  cadence: Cadence;
  timeOffsetInMinutes: number;
  lastModified: number;
  /** Only present when commentCount > 0. */
  comments?: WorkoutComment[];
  /** Only present when reactionCount > 0. */
  reactions?: WorkoutReaction[];
  /** Owner's display name. Returned on feed-style endpoints (e.g. `within`). */
  fullname?: string;
  /** Owner's profile picture URL. Returned on feed-style endpoints. */
  userPhoto?: string;
  /** Owner's cover photo URL. Returned on feed-style endpoints. */
  coverPhoto?: string;
  /** Free-text achievement labels (e.g. "Fastest time on this route"). */
  achievements?: string[];
  /** Average power, watts. Mirrors `SummaryExtension.avgPower` on feed responses. */
  avgPower?: number;
}

// ─── Response envelope ───────────────────────────────────────────────────────

export interface WorkoutsResponse {
  error: string | null;
  payload: Workout[];
  metadata: {
    workoutcount: string;
    until: string;
  };
}

export interface WorkoutResponse {
  error: string | null;
  payload: Workout;
  metadata: Record<string, unknown>;
}

/** Single item from the {@link getWorkoutsWithin} feed: owner + workout. */
export interface WorkoutsWithinItem {
  user: SearchUser;
  workout: Workout;
}

export interface WorkoutsWithinResponse {
  error: string | null;
  payload: WorkoutsWithinItem[];
  metadata: {
    workoutcount: string;
  };
}

// ─── Stats ───────────────────────────────────────────────────────────────────

/** Aggregated totals for a single activity type. */
export interface WorkoutStatsEntry {
  /** Suunto activity type ID this entry aggregates. */
  _id: SuuntoActivityType;
  /** Metres. */
  totalDistance: number;
  /** Seconds. */
  totalTime: number;
  /** Kilocalories. */
  energyConsumption: number;
  /** Number of workouts of this activity. */
  numberOfWorkouts: number;
  /** Metres. Only meaningful for dives. */
  maxDepth: number;
}

export interface WorkoutStats {
  /** Sum of distances across all activities, in metres. */
  totalDistanceSum: number;
  /** Sum of times across all activities, in seconds. */
  totalTimeSum: number;
  /** Sum of energy consumption across all activities, in kilocalories. */
  totalEnergyConsumptionSum: number;
  /** Total workout count across all activities. */
  totalNumberOfWorkoutsSum: number;
  /** Number of distinct days that have at least one workout. */
  totalDays: number;
  /**
   * Per-activity aggregates, restricted to a curated set of activity types
   * (the ones the official UI surfaces as headline cards).
   */
  allStats: WorkoutStatsEntry[];
  /** Per-activity aggregates covering every activity type the user has recorded. */
  allActualStats: WorkoutStatsEntry[];
}

export interface WorkoutStatsResponse {
  error: string | null;
  payload: WorkoutStats;
  metadata: {
    ts: string;
  };
}
