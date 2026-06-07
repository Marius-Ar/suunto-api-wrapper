/** Default export host for the 247 service. */
export const SPORTS_TRACKER_247_API = "https://247.sports-tracker.com";

export interface ExportParams {
  /** Epoch milliseconds. Only entries with a timestamp `>= since` are returned. Use 0 to retrieve all data */
  since?: number;
}

/**
 * One row from a 247 NDJSON export stream. Every row wraps a typed payload
 * under `entryData` plus a top-level ISO `timestamp` (with offset).
 */
export interface ExportEntry<T> {
  timestamp: string;
  entryData: T;
}

/** Sleep summary payload (durations are in seconds). */
export interface SleepSummaryData {
  sleepId: number;
  bedtimeStart: string;
  bedtimeEnd: string;
  duration: number;
  deepSleepDuration: number;
  lightSleepDuration: number;
  remSleepDuration: number;
  sleepOnsetLatencyDuration: number;
  wakeAfterSleepOnsetDuration: number;
  wakeBeforeOffBedDuration: number;
  hrAvg: number;
  hrMin: number;
  isNap: boolean;
  quality?: number;
  maxSpo2?: number;
  altitude?: number;
  avgHrv?: number;
  avgHrvSampleCount?: number;
}

export type SleepStage = "AWAKE" | "REM" | "LIGHT" | "DEEP";

/** Single sleep-stage interval. `duration` is in seconds. */
export interface SleepStageData {
  stage: SleepStage;
  duration: number;
}
/** Recovery sample. `balance` is in [0, 1]; `stressState` is an integer code. */
export interface RecoveryData {
  balance: number;
  stressState: number;
}
/** Activity sample. `energyConsumption` is in joules. */
export interface ActivityData {
  hr: number;
  stepCount: number;
  energyConsumption: number;
}

export type SleepSummary = ExportEntry<SleepSummaryData>;
export type SleepStageInterval = ExportEntry<SleepStageData>;
export type RecoveryEntry = ExportEntry<RecoveryData>;
export type ActivityEntry = ExportEntry<ActivityData>;

/**
 * 247 `/export` endpoints stream `application/x-ndjson`. The HTTP layer parses
 * each line into one record, so each function resolves with an array of
 * records.
 */
export type SleepExportResponse = SleepSummary[];
export type SleepStagesExportResponse = SleepStageInterval[];
export type RecoveryExportResponse = RecoveryEntry[];
export type ActivityExportResponse = ActivityEntry[];
