export {
  HttpClient,
  HttpError,
  type HttpClientOptions,
  type HttpResponse,
  type RequestOptions,
  type RequestContext,
  type RequestBody,
  type Query,
} from "./http/index.js";

export { generateXtotp, secondsUntilRollover } from "./otp/index.js";

export {
  login,
  sessionTokenFrom,
  SPORTS_TRACKER_API,
  DEFAULT_USER_AGENT,
  type LoginOptions,
  type LoginResponse,
} from "./auth/index.js";

export {
  SuuntoActivityType,
  WorkoutsResource,
  type GetWorkoutsParams,
  type GetOwnWorkoutsParams,
  type GetWorkoutsWithinParams,
  type WorkoutsResponse,
  type WorkoutsWithinResponse,
  type WorkoutsWithinItem,
  type WorkoutStatsResponse,
  type WorkoutStats,
  type WorkoutStatsEntry,
  type Workout,
  type Position,
  type Cadence,
  type HrData,
  type Gear,
  type HeartRateRecovery,
  type TssEntry,
  type Rankings,
  type RouteRanking,
  type ClientCalculatedAchievements,
  type CumulativeAchievement,
  type PersonalBestAchievement,
  type ActivityCounts,
  type WorkoutComment,
  type WorkoutReaction,
  type IntensityZone,
  type IntensityZones,
  type WorkoutExtension,
  type FitnessExtension,
  type IntensityExtension,
  type SummaryExtension,
  type WeatherExtension,
  type SwimmingHeaderExtension,
} from "./workouts/index.js";

export {
  UsersResource,
  type UserProfile,
  type UserProfileResponse,
  type SearchUser,
  type UserSearchResult,
  type UserSearchResponse,
} from "./users/index.js";

export {
  GearResource,
  type GetLatestGearParams,
  type GearSummary,
  type GearResponse,
} from "./gear/index.js";

export {
  WellnessResource,
  SPORTS_TRACKER_247_API,
  type ExportParams,
  type ExportEntry,
  type SleepSummaryData,
  type SleepStage,
  type SleepStageData,
  type RecoveryData,
  type ActivityData,
  type SleepSummary,
  type SleepStageInterval,
  type RecoveryEntry,
  type ActivityEntry,
  type SleepExportResponse,
  type SleepStagesExportResponse,
  type RecoveryExportResponse,
  type ActivityExportResponse,
} from "./wellness/index.js";

export { SuuntoClient, type SuuntoClientOptions } from "./client.js";
