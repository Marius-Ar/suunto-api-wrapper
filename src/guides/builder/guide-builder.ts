import type {SuuntoActivityType} from "../../common/types";
import type {
  GuideDefinition,
  GuideSequenceExtensions,
  GuideUsage,
} from "../types";
import {StepsBuilder} from "./steps-builder";

/** Suunto-enforced maximum length for `guide.description`. */
export const GUIDE_DESCRIPTION_MAX_LENGTH = 256;
/** Suunto-enforced maximum length for `guide.shortDescription`. */
export const GUIDE_SHORT_DESCRIPTION_MAX_LENGTH = 23;

/**
 * Fluent builder for a top-level {@link GuideDefinition}. Created via
 * {@link guide}. Metadata setters (`.name`, `.owner`, `.activities`, ...)
 * and step methods (`.warmUp`, `.notification`, `.repeat`, ...) chain in any
 * order; call `.build()` to get the final definition.
 *
 * The builder is **mutable** — calls mutate the instance and return `this`.
 *
 * @example
 * ```ts
 * const definition = guide()
 *   .name("Tempo")
 *   .owner("me")
 *   .activities([SuuntoActivityType.Running])
 *   .usage("workout")
 *   .warmUp(s => s.title("Warm up").duration(900).targetHr(130, 140))
 *   .repeat(5, r => r
 *     .interval(s => s.distance(1000).targetHr(150, 160))
 *     .rest(s => s.duration(60).targetHr(100, 110))
 *   )
 *   .coolDown(s => s.duration(900).targetHr(100, 110))
 *   .finished("Done!")
 *   .build();
 * ```
 */
export class GuideBuilder extends StepsBuilder {
  private _name?: string;
  private _description = "";
  private _shortDescription = "";
  private _owner?: string;
  private _activities: SuuntoActivityType[] = [];
  private _usage: GuideUsage = "workout";
  private _url?: string;
  private _localDate?: string;
  private _externalId?: string;
  private _extensions?: GuideSequenceExtensions;

  /** Display name shown to the athlete. **Required.** */
  name(name: string): this { this._name = name; return this; }
  /** Long description. */
  description(description: string): this { this._description = description; return this; }
  /** Short description (used in lists). */
  shortDescription(shortDescription: string): this { this._shortDescription = shortDescription; return this; }
  /** Author/owner identifier. **Required.** */
  owner(owner: string): this { this._owner = owner; return this; }
  /** Activity types the guide applies to. */
  activities(activities: SuuntoActivityType[]): this { this._activities = activities; return this; }
  /** Guide usage — defaults to `"workout"`. */
  usage(usage: GuideUsage): this { this._usage = usage; return this; }
  /** Optional remote URL. */
  url(url: string): this { this._url = url; return this; }
  /** `YYYY-MM-DD` local date. */
  localDate(localDate: string): this { this._localDate = localDate; return this; }
  /** External id (third-party system reference). */
  externalId(externalId: string): this { this._externalId = externalId; return this; }
  /** Override the sequence-level Suunto extensions block. */
  extensions(extensions: GuideSequenceExtensions): this { this._extensions = extensions; return this; }

  /**
   * Assemble and return the {@link GuideDefinition}. Throws if any required
   * field is missing: `name`, `owner`, `description`, `shortDescription`, or
   * at least one step (Suunto returns 404 on upload for a stepless guide).
   */
  build(): GuideDefinition {
    if (!this._name) throw new Error("guide: name is required — call .name(...)");
    if (!this._owner) throw new Error("guide: owner is required — call .owner(...)");
    if (!this._description) throw new Error("guide: description is required — call .description(...)");
    if (!this._shortDescription) throw new Error("guide: short description is required — call .shortDescription(...)");
    if (this._description.length > GUIDE_DESCRIPTION_MAX_LENGTH) {
      throw new Error(
        `guide: description must be at most ${GUIDE_DESCRIPTION_MAX_LENGTH} characters (got ${this._description.length}) — Suunto returns 404 otherwise`,
      );
    }
    if (this._shortDescription.length > GUIDE_SHORT_DESCRIPTION_MAX_LENGTH) {
      throw new Error(
        `guide: short description must be at most ${GUIDE_SHORT_DESCRIPTION_MAX_LENGTH} characters (got ${this._shortDescription.length}) — Suunto returns 404 otherwise`,
      );
    }

    const steps = this._drain();
    if (steps.length === 0) {
      throw new Error(
        "guide: at least one step is required — call .warmUp / .interval / .notification / .finished / ...",
      );
    }

    const def: GuideDefinition = {
      type: "sequence",
      name: this._name,
      description: this._description,
      shortDescription: this._shortDescription,
      owner: this._owner,
      activities: this._activities,
      usage: this._usage,
      steps,
    };
    if (this._url !== undefined) def.url = this._url;
    if (this._localDate !== undefined) def.localDate = this._localDate;
    if (this._externalId !== undefined) def.externalId = this._externalId;
    if (this._extensions !== undefined) def.extensions = this._extensions;
    return def;
  }
}

/** Entry point for the fluent guide builder. */
export function guide(): GuideBuilder {
  return new GuideBuilder();
}
