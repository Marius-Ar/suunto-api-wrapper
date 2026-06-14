import { describe, expect, it } from "vitest";
import { SuuntoClient } from "./client.js";
import { captureFetch, type Captured } from "./testing.js";

describe("SuuntoClient http247", () => {
  it("forces accept: */* on 247 requests", async () => {
    const captured: Captured[] = [];
    const suunto = new SuuntoClient({
      sessionKey: "sess-key",
      fetch: captureFetch(captured),
    });

    await suunto.wellness.sleep();

    expect(captured).toHaveLength(1);
    expect(captured[0].url).toBe("https://247.sports-tracker.com/v1/sleep/export");
    expect(captured[0].headers["accept"]).toBe("*/*");
    expect(captured[0].headers["sttauthorization"]).toBe("sess-key");
  });

  it("forwards since as query string on 247 requests", async () => {
    const captured: Captured[] = [];
    const suunto = new SuuntoClient({
      sessionKey: "sess-key",
      fetch: captureFetch(captured),
    });

    await suunto.wellness.recovery({ since: 1700000000000 });

    expect(captured[0].url).toBe(
      "https://247.sports-tracker.com/v1/recovery/export?since=1700000000000",
    );
  });

  it("leaves accept: application/json on the main http client", async () => {
    const captured: Captured[] = [];
    const suunto = new SuuntoClient({
      sessionKey: "sess-key",
      fetch: captureFetch(captured, '{"payload":[]}', "application/json"),
    });

    await suunto.users.byName("someuser");

    expect(captured).toHaveLength(1);
    expect(captured[0].headers["accept"]).toBe("application/json");
  });

  it("honors baseUrl247 override", async () => {
    const captured: Captured[] = [];
    const suunto = new SuuntoClient({
      sessionKey: "sess-key",
      baseUrl247: "https://247.example.test",
      fetch: captureFetch(captured),
    });

    await suunto.wellness.activity();

    expect(captured[0].url).toBe("https://247.example.test/v1/activity/export");
  });
});
