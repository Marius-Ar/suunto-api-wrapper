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

/** Suunto activity type IDs returned by the API as `activityId` / `_id`. */
export enum SuuntoActivityType {
  WALKING = 0,
  RUNNING = 1,
  CYCLING = 2,
  CROSS_COUNTRY_SKIING = 3,
  OTHER_1 = 4,
  OTHER_2 = 5,
  OTHER_3 = 6,
  OTHER_4 = 7,
  OTHER_5 = 8,
  OTHER_6 = 9,
  MOUNTAIN_BIKING = 10,
  HIKING = 11,
  ROLLER_SKATING = 12,
  DOWNHILL_SKIING = 13,
  PADDLING = 14,
  ROWING = 15,
  GOLF = 16,
  INDOOR = 17,
  PARKOUR = 18,
  BALLGAMES = 19,
  OUTDOOR_GYM = 20,
  SWIMMING = 21,
  TRAIL_RUNNING = 22,
  GYM = 23,
  NORDIC_WALKING = 24,
  HORSEBACK_RIDING = 25,
  MOTOR_SPORTS = 26,
  SKATEBOARDING = 27,
  WATER_SPORTS = 28,
  CLIMBING = 29,
  SNOWBOARDING = 30,
  SKI_TOURING = 31,
  FITNESS_CLASS = 32,
  SOCCER = 33,
  TENNIS = 34,
  BASKETBALL = 35,
  BADMINTON = 36,
  BASEBALL = 37,
  VOLLEYBALL = 38,
  AMERICAN_FOOTBALL = 39,
  TABLE_TENNIS = 40,
  RACQUETBALL = 41,
  SQUASH = 42,
  FLOORBALL = 43,
  HANDBALL = 44,
  SOFTBALL = 45,
  BOWLING = 46,
  CRICKET = 47,
  RUGBY = 48,
  ICE_SKATING = 49,
  ICE_HOCKEY = 50,
  YOGA = 51,
  INDOOR_CYCLING = 52,
  TREADMILL = 53,
  CROSSFIT = 54,
  CROSSTRAINER = 55,
  ROLLER_SKIING = 56,
  INDOOR_ROWING = 57,
  STRETCHING = 58,
  TRACK_AND_FIELD = 59,
  ORIENTEERING = 60,
  SUP = 61,
  COMBAT_SPORTS = 62,
  KETTLEBELL = 63,
  DANCING = 64,
  SNOWSHOEING = 65,
  FRISBEE_GOLF = 66,
  FUTSAL = 67,
  MULTISPORT = 68,
  AEROBICS = 69,
  TREKKING = 70,
  SAILING = 71,
  KAYAKING = 72,
  CIRCUIT_TRAINING = 73,
  TRIATHLON = 74,
  PADEL = 75,
  CHEERLEADING = 76,
  BOXING = 77,
  SCUBADIVING = 78,
  FREEDIVING = 79,
  ADVENTURE_RACING = 80,
  GYMNASTICS = 81,
  CANOEING = 82,
  MOUNTAINEERING = 83,
  TELEMARKSKIING = 84,
  OPENWATER_SWIMMING = 85,
  WINDSURFING = 86,
  KITESURFING_KITING = 87,
  PARAGLIDING = 88,
  SNORKELING = 90,
  SURFING = 91,
  SWIMRUN = 92,
  DUATHLON = 93,
  AQUATHLON = 94,
  OBSTACLE_RACING = 95,
  FISHING = 96,
  HUNTING = 97,
  GRAVEL_CYCLING = 99,
  MERMAIDING = 100,
  SPEARFISHING = 101,
  JUMP_ROPE = 102,
  TRACK_RUNNING = 103,
  CALISTHENICS = 104,
  E_BIKING = 105,
  E_MTB = 106,
  BACKCOUNTRY_SKIING = 107,
  WHEELCHAIR = 108,
  HAND_CYCLING = 109,
  SPLIT_BOARDING = 110,
  BIATHLON = 111,
  MEDITATION = 112,
  FIELD_HOCKEY = 113,
  CYCLOCROSS = 114,
  VERTICAL_RUN = 115,
  SKI_MOUNTAINEERING = 116,
  SKATE_SKIING = 117,
  CLASSIC_SKIING = 118,
  CHORES = 119,
  PILATES = 120,
  NEW_YOGA = 121,
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
  clientCalculatedAchievements: ClientCalculatedAchievements;
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
