import type {
  GuideField,
  GuideFieldCountdown,
  GuideFieldTargetFromZone,
  GuideFieldTargetFromZoneType,
  GuideFieldTargetRange,
  GuideFieldTargetRangeType,
  GuideFieldText,
  GuideFieldVariable,
  GuideFieldVariableAggregate,
  GuideFieldVariableType,
  GuideFieldVariableWindow,
  GuideFieldZoneSelector,
  GuideFieldZoneSelectorType,
} from "../types";

interface VariableOpts {
  window?: GuideFieldVariableWindow;
  aggregate?: GuideFieldVariableAggregate;
  title?: string;
  windowIndex?: number;
  comparison?: number;
}

/** Generic live readout — `heartRate`, `pace`, `cadence`, etc. */
export function variable(
  type: GuideFieldVariableType,
  opts: VariableOpts = {},
): GuideFieldVariable {
  return {type, ...opts};
}

/** Live heart-rate readout (bpm). */
export const hr = (opts?: VariableOpts) => variable("heartRate", opts);
/** Live pace readout (sec/km). */
export const pace = (opts?: VariableOpts) => variable("pace", opts);
/** Live power readout (watts). */
export const power = (opts?: VariableOpts) => variable("power", opts);
/** Live cadence readout (rpm or steps/min, activity-dependent). */
export const cadence = (opts?: VariableOpts) => variable("cadence", opts);
/** Live speed readout (m/s). */
export const speed = (opts?: VariableOpts) => variable("speed", opts);

/** Target heart-rate range, in bpm. `value` defaults to midpoint of `[min, max]`. */
export function targetHr(
  min: number,
  max: number,
  value: number = (min + max) / 2,
  title?: string,
): GuideFieldTargetRange {
  return targetRange("targetHeartRate", min, max, value, title);
}

/** Target pace range, in sec/km. `value` defaults to midpoint. */
export function targetPace(
  min: number,
  max: number,
  value: number = (min + max) / 2,
  title?: string,
): GuideFieldTargetRange {
  return targetRange("targetPace", min, max, value, title);
}

/** Target power range, in watts. `value` defaults to midpoint. */
export function targetPower(
  min: number,
  max: number,
  value: number = (min + max) / 2,
  title?: string,
): GuideFieldTargetRange {
  return targetRange("targetPower", min, max, value, title);
}

/** Target cadence range, in rpm or steps/min (activity-dependent). `value` defaults to midpoint. */
export function targetCadence(
  min: number,
  max: number,
  value: number = (min + max) / 2,
  title?: string,
): GuideFieldTargetRange {
  return targetRange("targetCadence", min, max, value, title);
}

/** Target speed range, in m/s (multiply by 3.6 for km/h, 2.237 for mph). `value` defaults to midpoint. */
export function targetSpeed(
  min: number,
  max: number,
  value: number = (min + max) / 2,
  title?: string,
): GuideFieldTargetRange {
  return targetRange("targetSpeed", min, max, value, title);
}

function targetRange(
  type: GuideFieldTargetRangeType,
  min: number,
  max: number,
  value: number,
  title: string | undefined,
): GuideFieldTargetRange {
  const f: GuideFieldTargetRange = {type, value, min, max};
  if (title !== undefined) f.title = title;
  return f;
}

/** Target inferred from a user-configured zone (no explicit min/max). */
export function targetFromZone(
  type: GuideFieldTargetFromZoneType,
  zone: number,
  opts: {value?: number; min?: number; max?: number; title?: string} = {},
): GuideFieldTargetFromZone {
  return {type, zone, ...opts};
}

/** Selector: heart-rate zone number to follow during the step. */
export function targetHrZone(zone: number, title?: string): GuideFieldZoneSelector {
  return zoneSelector("targetHeartRateZone", zone, title);
}

/** Selector: pace zone number to follow during the step. */
export function targetPaceZone(zone: number, title?: string): GuideFieldZoneSelector {
  return zoneSelector("targetPaceZone", zone, title);
}

/** Selector: power zone number to follow during the step. */
export function targetPowerZone(zone: number, title?: string): GuideFieldZoneSelector {
  return zoneSelector("targetPowerZone", zone, title);
}

function zoneSelector(
  type: GuideFieldZoneSelectorType,
  zone: number,
  title: string | undefined,
): GuideFieldZoneSelector {
  const f: GuideFieldZoneSelector = {type, value: zone};
  if (title !== undefined) f.title = title;
  return f;
}

/** Step-duration countdown field. `sec` = total step duration in seconds. */
export function stepDurationCountdown(sec: number, title?: string): GuideFieldCountdown {
  return countdown("stepDurationCountdown", sec, title);
}

/** Step-distance countdown field. `meters` = total step distance in meters. */
export function stepDistanceCountdown(meters: number, title?: string): GuideFieldCountdown {
  return countdown("stepDistanceCountdown", meters, title);
}

function countdown(
  type: "stepDurationCountdown" | "stepDistanceCountdown",
  value: number,
  title: string | undefined,
): GuideFieldCountdown {
  const f: GuideFieldCountdown = {type, value};
  if (title !== undefined) f.title = title;
  return f;
}

/** Suunto-enforced maximum length for a text field `value`. */
export const GUIDE_TEXT_FIELD_VALUE_MAX_LENGTH = 54;

/** Static text field shown to the athlete (max {@link GUIDE_TEXT_FIELD_VALUE_MAX_LENGTH} chars). */
export function text(value: string, title?: string): GuideFieldText {
  if (value.length > GUIDE_TEXT_FIELD_VALUE_MAX_LENGTH) {
    throw new Error(
      `guide: text field value must be at most ${GUIDE_TEXT_FIELD_VALUE_MAX_LENGTH} characters (got ${value.length}) — Suunto returns 404 otherwise`,
    );
  }
  const f: GuideFieldText = {type: "text", value};
  if (title !== undefined) f.title = title;
  return f;
}

/** Pass through a pre-built field — escape hatch. */
export function rawField(f: GuideField): GuideField {
  return f;
}
