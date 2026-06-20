import type {
  GuideCondition,
  GuideField,
  GuideFieldsStep,
  GuideNotificationStep,
  GuidePhase,
  GuideRepeatStep,
  GuideStep,
} from "../types";
import {
  cadence,
  hr,
  pace,
  power,
  speed,
  stepDistanceCountdown,
  stepDurationCountdown,
  targetCadence,
  targetHr,
  targetPace,
  targetPower,
  targetSpeed,
  text as textField,
} from "./fields";
import {manualLap, or, stepDistance, stepDuration} from "./conditions";

function newUuid(): string {
  return globalThis.crypto.randomUUID().toUpperCase();
}

/** Suunto-enforced maximum length for a step title. */
export const GUIDE_STEP_TITLE_MAX_LENGTH = 13;

function assertStepTitle(title: string): void {
  if (title.length > GUIDE_STEP_TITLE_MAX_LENGTH) {
    throw new Error(
      `guide: step title must be at most ${GUIDE_STEP_TITLE_MAX_LENGTH} characters (got ${title.length}, "${title}") — Suunto returns 404 otherwise`,
    );
  }
}

type TriggerKind = "duration" | "distance";

/**
 * Builder for a single fields-typed step. Passed into the callback of
 * `.warmUp` / `.interval` / `.rest` / `.coolDown` / `.split`. Mutable;
 * methods return `this` for chaining.
 */
export class PhaseBuilder {
  private _title?: string;
  private _id?: string;
  private _uuid?: string;
  private _trigger?: {kind: TriggerKind; value: number};
  private readonly _targetFields: GuideField[] = [];
  private readonly _liveFields: GuideField[] = [];
  private readonly _extraFields: GuideField[] = [];
  private _suppressManualLap = false;
  private _suppressAlerts = false;

  constructor(private readonly phase: GuidePhase) {}

  /** Set the step title shown on the watch (max {@link GUIDE_STEP_TITLE_MAX_LENGTH} chars). */
  title(title: string): this {
    assertStepTitle(title);
    this._title = title;
    return this;
  }

  /** End the step after `sec` seconds (or on manual lap). Adds a countdown field. */
  duration(sec: number): this {
    this._trigger = {kind: "duration", value: sec};
    return this;
  }

  /** End the step after `meters` meters (or on manual lap). Adds a countdown field. */
  distance(meters: number): this {
    this._trigger = {kind: "distance", value: meters};
    return this;
  }

  /** Add target heart-rate range (bpm) + a live HR readout. `value` defaults to midpoint. */
  targetHr(min: number, max: number, value?: number, title?: string): this {
    this._targetFields.push(targetHr(min, max, value, title));
    this._liveFields.push(hr());
    return this;
  }

  /** Add target pace range (sec/km) + live pace readout. `value` defaults to midpoint. */
  targetPace(min: number, max: number, value?: number, title?: string): this {
    this._targetFields.push(targetPace(min, max, value, title));
    this._liveFields.push(pace());
    return this;
  }

  /** Add target power range (watts) + live power readout. `value` defaults to midpoint. */
  targetPower(min: number, max: number, value?: number, title?: string): this {
    this._targetFields.push(targetPower(min, max, value, title));
    this._liveFields.push(power());
    return this;
  }

  /** Add target cadence range (rpm or steps/min, activity-dependent) + live cadence readout. */
  targetCadence(min: number, max: number, value?: number, title?: string): this {
    this._targetFields.push(targetCadence(min, max, value, title));
    this._liveFields.push(cadence());
    return this;
  }

  /** Add target speed range (m/s — ×3.6 for km/h, ×2.237 for mph) + live speed readout. */
  targetSpeed(min: number, max: number, value?: number, title?: string): this {
    this._targetFields.push(targetSpeed(min, max, value, title));
    this._liveFields.push(speed());
    return this;
  }

  /** Append an arbitrary pre-built {@link GuideField}. */
  field(f: GuideField): this { this._extraFields.push(f); return this; }

  /** Skip the default `lap: { type: "manual", hidden: true }`. */
  noManualLap(): this { this._suppressManualLap = true; return this; }

  /** Suppress the auto-generated alert mirroring the trigger. */
  noAlerts(): this { this._suppressAlerts = true; return this; }

  /** Override the auto-generated extension UUID. */
  uuid(uuid: string): this { this._uuid = uuid; return this; }

  /** Set the step `id`. */
  id(id: string): this { this._id = id; return this; }

  /** @internal — invoked by {@link StepsBuilder}. */
  _build(): GuideFieldsStep {
    const countdownField = this.getCountdownField();

    const fields: GuideField[] = [
      ...this._targetFields,
      ...this._liveFields,
      ...(countdownField ? [countdownField] : []),
      ...this._extraFields,
    ];

    const step: GuideFieldsStep = {
      type: "fields",
      phase: this.phase,
      extensions: {
        "com.suunto": {
          phase: this.phase,
          isCustomNameSet: false,
          uuid: this._uuid ?? newUuid(),
        },
      },
    };

    if (this._title !== undefined) step.title = this._title;
    if (this._id !== undefined) step.id = this._id;
    if (!this._suppressManualLap) step.lap = {type: "manual", hidden: true};
    if (this._trigger) {
      const cond: GuideCondition =
        this._trigger.kind === "duration"
          ? stepDuration(this._trigger.value)
          : stepDistance(this._trigger.value);
      step.trigger = or(cond, manualLap());
      if (!this._suppressAlerts) {
        step.alerts = [
          {
            type: "default",
            condition: cond,
            countdown: {type: "standard"},
          },
        ];
      }
    }
    if (fields.length > 0) step.fields = fields;
    return step;
  }

  private getCountdownField() {
    if (!this._trigger) return undefined
    return this._trigger.kind === "duration"
            ? stepDurationCountdown(this._trigger.value)
            : stepDistanceCountdown(this._trigger.value);
  }
}

/**
 * Shared fluent surface for assembling a sequence of {@link GuideStep}s.
 *
 * Each phase shortcut (`.warmUp`, `.interval`, `.rest`, `.coolDown`,
 * `.split`) takes a callback receiving a {@link PhaseBuilder} that you
 * configure with `.title` / `.duration` / `.distance` / `.targetHr` / ...
 * The step is committed when the callback returns.
 *
 * The builder is **mutable** — methods return `this`.
 */
export class StepsBuilder {
  protected steps: GuideStep[] = [];

  /** Warm-up block. */
  warmUp(fn: (p: PhaseBuilder) => void): this { return this.phaseStep("warmUp", fn); }
  /** Work interval. */
  interval(fn: (p: PhaseBuilder) => void): this { return this.phaseStep("interval", fn); }
  /** Recovery between intervals. */
  rest(fn: (p: PhaseBuilder) => void): this { return this.phaseStep("rest", fn); }
  /** Cool-down block. */
  coolDown(fn: (p: PhaseBuilder) => void): this { return this.phaseStep("coolDown", fn); }
  /** Mid-session split marker. */
  split(fn: (p: PhaseBuilder) => void): this { return this.phaseStep("split", fn); }

  /**
   * Terminal "guide complete" message. No trigger, no alerts. If `message`
   * is given, it becomes a text field on the step.
   */
  finished(message?: string): this {
    const step: GuideFieldsStep = {
      type: "fields",
      lap: {type: "manual", hidden: true},
      title: "Terminé",
      fields: message ? [textField(message)] : [],
      notification: {type: "default"},
      extensions: {"com.suunto": {phase: "finished"}},
      phase: "finished",
    };
    this.steps.push(step);
    return this;
  }

  /** Append a notification step (passive banner — title + optional text). */
  notification(title: string, text?: string): this {
    assertStepTitle(title);
    const fields: GuideField[] = text === undefined ? [] : [textField(text)];
    const step: GuideNotificationStep = {type: "notification", title, fields};
    this.steps.push(step);
    return this;
  }

  /**
   * Append a repeat block. The callback receives a fresh {@link StepsBuilder}
   * to fill with the steps to loop.
   */
  repeat(times: number, fn: (r: StepsBuilder) => void): this {
    const child = new StepsBuilder();
    fn(child);
    const step: GuideRepeatStep = {
      type: "repeat",
      times,
      steps: child._drain(),
      extensions: {"com.suunto": {uuid: newUuid()}},
    };
    this.steps.push(step);
    return this;
  }

  /** Append a pre-built step — escape hatch for shapes the fluent API doesn't cover. */
  step(raw: GuideStep): this {
    this.steps.push(raw);
    return this;
  }

  /** @internal */
  _drain(): GuideStep[] { return this.steps; }

  private phaseStep(phase: GuidePhase, fn: (p: PhaseBuilder) => void): this {
    const p = new PhaseBuilder(phase);
    fn(p);
    this.steps.push(p._build());
    return this;
  }
}
