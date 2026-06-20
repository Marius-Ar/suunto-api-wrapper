import {SuuntoActivityType} from "../common/types";

/** Unzipped guide payload: parsed `guide.json` + raw `icon.png` bytes. */
export interface GuideContent {
  definition: GuideDefinition;
  icon: Uint8Array;
  raw: Uint8Array;
}

/**
 * Content of `guide.json` inside the guide zip.
 *
 * Mirrors the `com.soy.algorithms.planner.Guide.Sequence` model used by the
 * Suunto mobile app. Discriminated unions key off `"type"`.
 */
export interface GuideDefinition {
  type: "sequence";
  name: string;
  description: string;
  shortDescription: string;
  owner: string;
  url?: string;
  activities: SuuntoActivityType[];
  usage: GuideUsage;
  localDate?: string;
  externalId?: string;
  steps: GuideStep[];
  extensions?: GuideSequenceExtensions;
}

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

export type GuidePhase =
  | "warmUp"
  | "interval"
  | "rest"
  | "coolDown"
  | "split"
  | "finished";

export type GuideUsage = "workout";

export type GuideWorkoutPlanType = "interval" | "race";

export type GuideUnitSystem = "metric" | "imperial";

export type GuideFieldVariableAggregate = "average" | "max" | "min";

export type GuideFieldVariableWindow = "workout" | "step" | "manualLap";

// ---------------------------------------------------------------------------
// Steps
// ---------------------------------------------------------------------------

export type GuideStep =
  | GuideFieldsStep
  | GuideNotificationStep
  | GuideRepeatStep;

/**
 * Active workout step. Renders one or more {@link GuideField}s on the watch
 * (e.g. target heart rate, live heart rate, step countdown) and runs until the
 * `trigger` condition fires or the user laps manually.
 *
 * Most workout content lives in this variant: warm-up blocks, intervals,
 * recoveries, cool-downs. Pair with `phase` + `extensions["com.suunto"].phase`
 * to tag the block's role inside the session.
 */
export interface GuideFieldsStep {
  type: "fields";
  createManualLap?: boolean;
  lap?: GuideLap;
  trigger?: GuideCondition;
  transitions?: GuideTransition[];
  title?: string;
  options?: GuideStepOptions;
  fields?: GuideField[];
  id?: string;
  notification?: GuideNotification;
  phase?: GuidePhase;
  alerts?: GuideAlert[];
  extensions?: GuideStepExtensions;
}

/**
 * Passive banner shown to the athlete — no trigger, no duration. Used to
 * preview what comes next ("Set: 5 x 1km, 150-160 bpm") or to flag a section
 * boundary. The watch displays `title` plus any text/value `fields` and then
 * advances to the next step.
 *
 * Use this for headings, descriptive intros, or end-of-guide messages; use
 * {@link GuideFieldsStep} for anything the athlete actually performs.
 */
export interface GuideNotificationStep {
  type: "notification";
  createManualLap?: boolean;
  title?: string;
  fields?: GuideField[];
  id?: string;
  extensions?: GuideStepExtensions;
}

/**
 * Loop container. Runs its `steps` array `times` times in order before
 * moving on. Steps can themselves be {@link GuideRepeatStep}s, so interval
 * structures like "5 sets of (1km hard + 60s recovery)" nest naturally.
 *
 * The loop body typically contains an alternating pair (work / rest), but any
 * sequence of steps is valid.
 */
export interface GuideRepeatStep {
  type: "repeat";
  times: number;
  steps: GuideStep[];
  id?: string;
  extensions?: GuideStepExtensions;
}

// ---------------------------------------------------------------------------
// Trigger / Condition (same union)
// ---------------------------------------------------------------------------

export type GuideCondition =
  | GuideConditionAnd
  | GuideConditionOr
  | GuideConditionDistance
  | GuideConditionDuration
  | GuideConditionStepDistance
  | GuideConditionStepDuration
  | GuideConditionLocation
  | GuideConditionManualLap;

export interface GuideConditionAnd {
  type: "and";
  triggers: GuideCondition[];
  conditions?: GuideCondition[];
}

export interface GuideConditionOr {
  type: "or";
  triggers: GuideCondition[];
  conditions?: GuideCondition[];
}

/** Total distance since workout start, in meters. */
export interface GuideConditionDistance {
  type: "distance";
  value: number;
}

/** Total duration since workout start, in seconds. */
export interface GuideConditionDuration {
  type: "duration";
  value: number;
}

/** Distance since current step start, in meters. */
export interface GuideConditionStepDistance {
  type: "stepDistance";
  value: number;
}

/** Duration since current step start, in seconds. */
export interface GuideConditionStepDuration {
  type: "stepDuration";
  value: number;
}

export interface GuideConditionLocation {
  type: "location";
  latitude: number;
  longitude: number;
  distance?: number;
}

export interface GuideConditionManualLap {
  type: "manualLap";
}

// ---------------------------------------------------------------------------
// Fields
// ---------------------------------------------------------------------------

export type GuideField =
  | GuideFieldVariable
  | GuideFieldTargetRange
  | GuideFieldTargetFromZone
  | GuideFieldZoneSelector
  | GuideFieldCountdown
  | GuideFieldText;

/** Live readout of a metric (heart rate, pace, etc.). */
export type GuideFieldVariableType =
  | "altitude"
  | "ascent"
  | "ascentTime"
  | "cadence"
  | "descent"
  | "descentTime"
  | "distance"
  | "duration"
  | "energy"
  | "heartRate"
  | "pace"
  | "power"
  | "speed"
  | "strokeRate"
  | "strokes"
  | "swolf"
  | "temperature"
  | "verticalSpeed";

export interface GuideFieldVariable {
  type: GuideFieldVariableType;
  window?: GuideFieldVariableWindow;
  aggregate?: GuideFieldVariableAggregate;
  title?: string;
  windowIndex?: number;
  comparison?: number;
}

/** Target with optional min/max range. */
export type GuideFieldTargetRangeType =
  | "targetCadence"
  | "targetHeartRate"
  | "targetPace"
  | "targetPower"
  | "targetSpeed";

export interface GuideFieldTargetRange {
  type: GuideFieldTargetRangeType;
  value?: number;
  min?: number;
  max?: number;
  title?: string;
}

/** Target inferred from a configured user zone. */
export type GuideFieldTargetFromZoneType =
  | "targetFromHeartRateZone"
  | "targetFromPaceZone"
  | "targetFromPowerZone";

export interface GuideFieldTargetFromZone {
  type: GuideFieldTargetFromZoneType;
  zone: number;
  value?: number;
  min?: number;
  max?: number;
  title?: string;
}

/** Zone index selector. */
export type GuideFieldZoneSelectorType =
  | "targetHeartRateZone"
  | "targetPaceZone"
  | "targetPowerZone";

export interface GuideFieldZoneSelector {
  type: GuideFieldZoneSelectorType;
  value: number;
  title?: string;
}

/** Remaining distance (meters) or duration (seconds) for the current step. */
export type GuideFieldCountdownType =
  | "stepDistanceCountdown"
  | "stepDurationCountdown";

export interface GuideFieldCountdown {
  type: GuideFieldCountdownType;
  value: number;
  title?: string;
}

export interface GuideFieldText {
  type: "text";
  value: string;
  title?: string;
}

// ---------------------------------------------------------------------------
// Supporting types
// ---------------------------------------------------------------------------

export interface GuideAlert {
  type: "default";
  condition: GuideCondition;
  countdown?: GuideCountdown;
}

export interface GuideCountdown {
  type: "standard";
}

export interface GuideLap {
  type: "manual";
  hidden?: boolean;
}

export interface GuideNotification {
  type: "default";
  title?: string;
  text?: string;
}

export interface GuideTransition {
  condition: GuideCondition;
  stepId?: string;
}

export interface GuideStepOptions {
  repeatNumberPreferred?: boolean;
}

// ---------------------------------------------------------------------------
// Extensions
// ---------------------------------------------------------------------------

export interface GuideStepExtensions {
  "com.suunto": SuuntoStepExtensions;
}

export interface SuuntoStepExtensions {
  phase?: GuidePhase;
  isCustomNameSet?: boolean;
  uuid?: string;
}

export interface GuideSequenceExtensions {
  "com.suunto": SuuntoGuideSequenceExtensions;
}

export interface SuuntoGuideSequenceExtensions {
  workoutPlanType?: GuideWorkoutPlanType;
  raceParameters?: GuideRaceParameters;
}

export interface GuideRaceParameters {
  totalDurationSeconds?: number;
  totalDistanceMeters: number;
  unitSystem: GuideUnitSystem;
}

// ---------------------------------------------------------------------------
// API list / upload responses
// ---------------------------------------------------------------------------

export interface GuideListResponse {
    error: string | null;
    payload: Guide[];
    metadata: {
        ts: string;
    }
}

export interface GuideUploadResponse {
    error: string | null;
    payload: Guide;
    metadata: {
        ts: string;
    }
}

export interface Guide {
    id: string,
    username: string,
    type: string,
    modificationTime: number,
    fileModificationTime: number,
    name: string,
    description: string,
    shortDescription: string,
    owner: string,
    url: string,
    iconUrl: string,
    backgroundUrl: any,  // TODO: Replace with actual type
    richText: string,
    "activities": SuuntoActivityType[],
    /** YYYY-MM-DD format */
    "localDate": string,
    "usage": string,
    "pinned": boolean,
    "externalId": string,
    "ownerId": string,
    "catalogueId": any,  // TODO: Replace with actual type
    "extended": any  // TODO: Replace with actual type
}
