import type {
  GuideCondition,
  GuideConditionAnd,
  GuideConditionDistance,
  GuideConditionDuration,
  GuideConditionLocation,
  GuideConditionManualLap,
  GuideConditionOr,
  GuideConditionStepDistance,
  GuideConditionStepDuration,
} from "../types";

/** Combine triggers with logical OR — fires when any inner trigger fires. */
export function or(...triggers: GuideCondition[]): GuideConditionOr {
  return {type: "or", triggers};
}

/** Combine triggers with logical AND — fires only when every trigger fires. */
export function and(...triggers: GuideCondition[]): GuideConditionAnd {
  return {type: "and", triggers};
}

/** Fires after `sec` seconds elapsed inside the current step. */
export function stepDuration(sec: number): GuideConditionStepDuration {
  return {type: "stepDuration", value: sec};
}

/** Fires after `meters` covered inside the current step. */
export function stepDistance(meters: number): GuideConditionStepDistance {
  return {type: "stepDistance", value: meters};
}

/** Fires after `sec` seconds since workout start. */
export function duration(sec: number): GuideConditionDuration {
  return {type: "duration", value: sec};
}

/** Fires after `meters` since workout start. */
export function distance(meters: number): GuideConditionDistance {
  return {type: "distance", value: meters};
}

/** Fires when the user presses the lap button. */
export function manualLap(): GuideConditionManualLap {
  return {type: "manualLap"};
}

/** Fires when the athlete is within `distance` meters of the given coords. */
export function location(
  latitude: number,
  longitude: number,
  withinMeters?: number,
): GuideConditionLocation {
  return withinMeters === undefined
    ? {type: "location", latitude, longitude}
    : {type: "location", latitude, longitude, distance: withinMeters};
}
