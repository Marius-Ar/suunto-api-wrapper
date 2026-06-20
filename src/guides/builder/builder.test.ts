import {describe, expect, it} from "vitest";
import {guide} from "./guide-builder";
import type {
  GuideDefinition,
  GuideFieldsStep,
  GuideNotificationStep,
  GuideRepeatStep,
} from "../types";

function build(): GuideDefinition {
  return guide()
    .name("Hshhss")
    .description("Bdbdhs")
    .shortDescription("Bdbdhs")
    .owner("Suunto Workout Planner")
    .activities([2])
    .usage("workout")
    .notification("Échauffement", "15'00.0 130 - 140 bpm")
    .warmUp(s => s.title("Échauffement").duration(900).targetHr(130, 140, 135))
    .notification("Set", "5 x 1,00 km\n 01'00.0 150 - 160 bpm")
    .repeat(5, r => r
      .interval(s => s.title("Intervalle").distance(1000).targetHr(150, 160, 155))
      .rest(s => s.title("Récupération").duration(60).targetHr(100, 110, 105)),
    )
    .notification("Repos", "15'00.0 100 - 110 bpm")
    .coolDown(s => s.title("Repos").duration(900).targetHr(100, 110, 105))
    .finished("SuuntoPlus™ Guide terminé")
    .build();
}

describe("guide builder", () => {
  it("sets top-level metadata", () => {
    const def = build();
    expect(def.type).toBe("sequence");
    expect(def.name).toBe("Hshhss");
    expect(def.owner).toBe("Suunto Workout Planner");
    expect(def.usage).toBe("workout");
    expect(def.activities).toEqual([2]);
  });

  it("throws if name missing", () => {
    expect(() => guide().owner("x").build()).toThrow(/name/);
  });

  it("throws if owner missing", () => {
    expect(() => guide().name("x").build()).toThrow(/owner/);
  });

  it("throws if description missing", () => {
    expect(() => guide().name("x").owner("y").build()).toThrow(/description/);
  });

  it("throws if shortDescription missing", () => {
    expect(() =>
      guide().name("x").owner("y").description("d").build(),
    ).toThrow(/short description/);
  });

  it("throws if description exceeds 256 chars", () => {
    expect(() =>
      guide()
        .name("x")
        .owner("y")
        .description("a".repeat(257))
        .shortDescription("s")
        .warmUp(s => s.duration(60))
        .build(),
    ).toThrow(/description must be at most 256/);
  });

  it("throws if shortDescription exceeds 23 chars", () => {
    expect(() =>
      guide()
        .name("x")
        .owner("y")
        .description("d")
        .shortDescription("a".repeat(24))
        .warmUp(s => s.duration(60))
        .build(),
    ).toThrow(/short description must be at most 23/);
  });

  it("throws if a phase step title exceeds 13 chars", () => {
    expect(() =>
      guide()
        .name("x").owner("y").description("d").shortDescription("s")
        .warmUp(s => s.title("a".repeat(14)).duration(60))
        .build(),
    ).toThrow(/step title must be at most 13/);
  });

  it("throws if a notification title exceeds 13 chars", () => {
    expect(() =>
      guide()
        .name("x").owner("y").description("d").shortDescription("s")
        .notification("a".repeat(14))
        .build(),
    ).toThrow(/step title must be at most 13/);
  });

  it("throws if a text field value exceeds 54 chars", () => {
    expect(() =>
      guide()
        .name("x").owner("y").description("d").shortDescription("s")
        .notification("ok", "a".repeat(55))
        .build(),
    ).toThrow(/text field value must be at most 54/);
  });

  it("throws if no steps appended", () => {
    expect(() =>
      guide().name("x").owner("y").description("d").shortDescription("s").build(),
    ).toThrow(/at least one step/);
  });

  it("emits the expected step sequence", () => {
    const types = build().steps.map(s => s.type);
    expect(types).toEqual([
      "notification",
      "fields",
      "notification",
      "repeat",
      "notification",
      "fields",
      "fields",
    ]);
  });

  it("notification step has positional title + text", () => {
    const def = build();
    const notif = def.steps[0] as GuideNotificationStep;
    expect(notif.type).toBe("notification");
    expect(notif.title).toBe("Échauffement");
    expect(notif.fields).toEqual([
      {type: "text", value: "15'00.0 130 - 140 bpm"},
    ]);
  });

  it("warmUp commits with trigger, alerts, countdown, manual lap, extensions", () => {
    const warmUp = build().steps[1] as GuideFieldsStep;
    expect(warmUp.type).toBe("fields");
    expect(warmUp.phase).toBe("warmUp");
    expect(warmUp.title).toBe("Échauffement");
    expect(warmUp.lap).toEqual({type: "manual", hidden: true});
    expect(warmUp.trigger).toEqual({
      type: "or",
      triggers: [
        {type: "stepDuration", value: 900},
        {type: "manualLap"},
      ],
    });
    expect(warmUp.alerts).toEqual([
      {
        type: "default",
        condition: {type: "stepDuration", value: 900},
        countdown: {type: "standard"},
      },
    ]);
    expect(warmUp.fields).toEqual([
      {type: "targetHeartRate", value: 135, min: 130, max: 140},
      {type: "heartRate"},
      {type: "stepDurationCountdown", value: 900},
    ]);
    expect(warmUp.extensions?.["com.suunto"].phase).toBe("warmUp");
    expect(warmUp.extensions?.["com.suunto"].isCustomNameSet).toBe(false);
    expect(warmUp.extensions?.["com.suunto"].uuid).toMatch(
      /^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$/,
    );
  });

  it("distance-based interval uses stepDistance trigger + countdown", () => {
    const repeat = build().steps[3] as GuideRepeatStep;
    const interval = repeat.steps[0] as GuideFieldsStep;
    expect(interval.phase).toBe("interval");
    expect(interval.trigger).toEqual({
      type: "or",
      triggers: [
        {type: "stepDistance", value: 1000},
        {type: "manualLap"},
      ],
    });
    expect(interval.fields).toEqual([
      {type: "targetHeartRate", value: 155, min: 150, max: 160},
      {type: "heartRate"},
      {type: "stepDistanceCountdown", value: 1000},
    ]);
  });

  it("repeat wraps inner steps and adds extension uuid", () => {
    const repeat = build().steps[3] as GuideRepeatStep;
    expect(repeat.type).toBe("repeat");
    expect(repeat.times).toBe(5);
    expect(repeat.steps.map(s => s.type)).toEqual(["fields", "fields"]);
    expect(repeat.extensions?.["com.suunto"].uuid).toMatch(/^[0-9A-F-]{36}$/);
  });

  it("finished step has phase + notification, no trigger, no alerts", () => {
    const finished = build().steps[6] as GuideFieldsStep;
    expect(finished.phase).toBe("finished");
    expect(finished.title).toBe("Terminé");
    expect(finished.trigger).toBeUndefined();
    expect(finished.alerts).toBeUndefined();
    expect(finished.notification).toEqual({type: "default"});
    expect(finished.fields).toEqual([
      {type: "text", value: "SuuntoPlus™ Guide terminé"},
    ]);
  });

  it("noManualLap suppresses lap; noAlerts suppresses alerts", () => {
    const def = guide()
      .name("x").owner("y").description("d").shortDescription("s")
      .interval(s => s.duration(60).noManualLap().noAlerts())
      .build();
    const step = def.steps[0] as GuideFieldsStep;
    expect(step.lap).toBeUndefined();
    expect(step.alerts).toBeUndefined();
  });

  it("uuid override is honoured", () => {
    const def = guide()
      .name("x").owner("y").description("d").shortDescription("s")
      .interval(s => s.duration(60).uuid("CUSTOM-UUID"))
      .build();
    const step = def.steps[0] as GuideFieldsStep;
    expect(step.extensions?.["com.suunto"].uuid).toBe("CUSTOM-UUID");
  });

  it("targetHr defaults value to midpoint", () => {
    const def = guide().name("x").owner("y").description("d").shortDescription("s")
      .interval(s => s.duration(60).targetHr(100, 200))
      .build();
    const step = def.steps[0] as GuideFieldsStep;
    expect(step.fields?.[0]).toEqual({
      type: "targetHeartRate", value: 150, min: 100, max: 200,
    });
  });
});
