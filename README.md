# suunto-api-wrapper

[![npm version](https://img.shields.io/npm/v/suunto-api-wrapper.svg)](https://www.npmjs.com/package/suunto-api-wrapper)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=Marius-Ar_suunto-api-wrapper&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=Marius-Ar_suunto-api-wrapper)

A small, typed TypeScript client for the **Suunto mobile app API** the same
backend the Suunto phone app talks to (served by Sports Tracker at
`api.sports-tracker.com`).

**No Suunto apizone / developer account required.** This library does **not**
use Suunto's official partner API at `apizone.suunto.com`, so there are no
OAuth client IDs, no app registration, and no developer approval to deal with.
You authenticate with the same email + password you use in the Suunto app.

It handles the annoying parts and exposes the endpoints as
typed, resource‑grouped methods:

```ts
const suunto = await SuuntoClient.login({ email, password });

const workouts = await suunto.workouts.own({ limit: 10 });
const profile  = await suunto.users.byName("someuser");
const gear     = await suunto.gear.latest("someuser");
```

No runtime dependencies — it's built on Node's native `fetch`.

---

## ⚠️ Disclaimer

This is an **unofficial** library. It is **not affiliated with, endorsed by, or
supported by Suunto or Sports Tracker** in any way.

- It talks to an **undocumented API** that can change or break without
  notice.
- Use it **only with your own account and your own data**, at your own risk as it may break Suunto or Sports Tracker TOS. Be
  respectful of the service: don't hammer the API or use it for scraping/abuse.

If Suunto or Sports Tracker request it, this project will comply.

---

## Installation

```bash
npm install suunto-api-wrapper
```

Requires **Node.js 20+** or any modern browser — it relies on the global
`fetch` and Web Crypto APIs, so it runs in Node and the browser (e.g. Angular,
React) with no polyfills.

The package ships both **ESM** and **CommonJS** builds with full type
declarations, so `import` and `require` both work:

```ts
import { SuuntoClient } from "suunto-api-wrapper";       // ESM
const { SuuntoClient } = require("suunto-api-wrapper");  // CJS
```

---

## Usage

### Authenticating

`SuuntoClient.login` performs the email/password login, stores the returned
session key, and returns a ready‑to‑use client. Every request it makes is authed.

```ts
import { SuuntoClient } from "suunto-api-wrapper";

const suunto = await SuuntoClient.login({
  email: "you@example.com",
  password: "your-password",
});

console.log(suunto.sessionKey); // the active session key
```

### Resource namespaces

The client groups endpoints by resource. Each call returns the parsed JSON
payload, typed to the real API response shape (an envelope of
`{ error, payload, metadata }`).

| Namespace          | Method                           | Endpoint                                  |
| ------------------ |----------------------------------| ----------------------------------------- |
| `suunto.workouts`  | `.own(params?)`                  | your own workouts                         |
|                    | `.public(username, params?)`     | a user's public workouts                  |
|                    | `.byKey(username, key, params?)` | a single workout (public, or your own when authed) |
|                    | `.stats(username)`              | aggregated workout stats per activity     |
|                    | `.within(box)`                  | public workouts inside a lat/lng bounding box |
|                    | `.comment(key, text)`            | post a comment on a workout               |
|                    | `.like(key)`                    | react (like) a workout                    |
|                    | `.unlike(key)`                  | remove your reaction from a workout       |
| `suunto.users`     | `.byName(username)`             | a user's public profile                   |
|                    | `.search(terms)`                | search for users                          |
| `suunto.gear`      | `.latest(username, params?)`    | a user's latest gear                      |
| `suunto.guides`    | `.list()`                       | SuuntoPlus guides available to you (metadata only) |
|                    | `.get(id)`                      | a single guide unpacked from its zip (definition + icon + raw bytes) |
|                    | `.create(definition, icon?)`    | upload a new guide (zips definition + 300x300 PNG icon) |
|                    | `.update(id, definition, icon?)` | replace an existing guide                |
|                    | `.delete(id)`                   | permanently delete a guide                |
| `suunto.trainingPlans` | `.catalogue()`              | available Suunto Coach programme templates |
|                    | `.list()`                       | your generated training plans             |
|                    | `.active()`                     | your currently active training plan       |
|                    | `.last()`                       | your most recently generated training plan |
|                    | `.byId(id)`                     | a generated training plan by ID           |
| `suunto.wellness`  | `.sleep(params?)`               | sleep summaries (247)                     |
|                    | `.sleepStages(params?)`         | per‑stage sleep intervals (247)           |
|                    | `.recovery(params?)`            | recovery balance + stress state (247)     |
|                    | `.activity(params?)`            | daily activity samples (247)              |

```ts
// Workouts
const own         = await suunto.workouts.own({ limit: 20, offset: 0, since: 0 });
const publicItems = await suunto.workouts.public("someuser", { limit: 40 });
const single      = await suunto.workouts.byKey("someuser", "workoutKey123");
const stats       = await suunto.workouts.stats("someuser");
const nearby      = await suunto.workouts.within({
  lowerLat: 45.70, lowerLng: 4.75, upperLat: 45.85, upperLng: 4.95, limit: 50,
});
await suunto.workouts.comment("workoutKey123", "nice run!");
await suunto.workouts.like("workoutKey123");
await suunto.workouts.unlike("workoutKey123");

// Users
const profile = await suunto.users.byName("someuser");
const matches = await suunto.users.search("john");

// Gear
const gear = await suunto.gear.latest("someuser", { allTypes: true });

// SuuntoPlus guides
const guides = await suunto.guides.list();              // list metadata for every guide
const guide  = await suunto.guides.get("guide-id");     // unzipped: { definition, icon, raw }
// guide.definition — parsed guide.json (name, activities, steps, ...)
// guide.icon       — icon.png bytes
// guide.raw        — full zip bytes if you want to cache/persist it

// Create a new guide. Icon must be a 300x300 PNG; omit it to use the
// built-in transparent default.
const created = await suunto.guides.create(guide.definition, iconPngBytes);

// Replace an existing guide's content + icon
await suunto.guides.update("guide-id", guide.definition);

await suunto.guides.delete("guide-id");                 // permanent; throws on 404

// Suunto Coach / My Plan (read-only)
const catalogue = await suunto.trainingPlans.catalogue();
const plans     = await suunto.trainingPlans.list();
const active    = await suunto.trainingPlans.active();
const latest    = await suunto.trainingPlans.last();
const plan      = await suunto.trainingPlans.byId("plan-id");

for (const week of active.payload.weeklyPrograms) {
  for (const workout of week.plannedWorkouts) {
    console.log(workout.trainingDate, workout.name, workout.duration);
  }
}

// Build a guide definition fluently — see "Guide builder" below
import { guide } from "suunto-api-wrapper";
const definition = guide()
  .name("Tempo intervals").owner("me").activities([2]).usage("workout")
  .warmUp(s => s.title("Warm up").duration(900).targetHr(130, 140))
  .repeat(5, r => r
    .interval(s => s.distance(1000).targetHr(150, 160))
    .rest(s => s.duration(60).targetHr(100, 110)))
  .coolDown(s => s.duration(900).targetHr(100, 110))
  .finished("Done!")
  .build();
await suunto.guides.create(definition);

// 247 wellness data — sleep, recovery, activity
const sleep   = await suunto.wellness.sleep({ since: 0 });        // since = epoch ms; 0 returns all
const stages  = await suunto.wellness.sleepStages({ since: 0 });
const recov   = await suunto.wellness.recovery();                 // omit `since` to fetch the default window
const daily   = await suunto.wellness.activity();
```

#### What is 247 service?

The Suunto app exposes a second service at `247.sports-tracker.com` (separate
from `api.sports-tracker.com`) for **always‑on, around‑the‑clock body data**
collected by the watch outside recorded workouts.

The 247 client lives at `suunto.http247` if you need a raw escape hatch (same
auth headers). Override the host with the `baseUrl247` client option.

The response payloads are fully typed. For example, workout `extensions` are a
discriminated union you can narrow on:

```ts
for (const w of own.payload) {
  for (const ext of w.extensions) {
    if (ext.type === "WeatherExtension") {
      console.log(ext.temperature, ext.humidity); // typed!
    }
  }
}
```

### Guide builder

`GuideDefinition` is a deep, polymorphic shape (discriminated unions for steps,
triggers, fields, ...). Writing it by hand is tedious and error-prone. The
package ships a **fluent builder** that hides the boilerplate. Auto-generated
UUIDs, mirrored alerts, manual-lap fallback triggers, countdown fields, and
phase extensions.

```ts
import { guide } from "suunto-api-wrapper";

const definition = guide()
  .name("5 x 1km @ Zone 3").description("Tempo session").shortDescription("Tempo")
  .owner("me").activities([2]).usage("workout")
  .notification("Warm up", "15 min @ 130-140 bpm")
  .warmUp(s => s.title("Warm up").duration(900).targetHr(130, 140))
  .notification("Set", "5 x 1km @ 150-160 bpm")
  .repeat(5, r => r
    .interval(s => s.title("Rep").distance(1000).targetHr(150, 160))
    .rest(s => s.title("Recovery").duration(60).targetHr(100, 110))
  )
  .coolDown(s => s.title("Cool down").duration(900).targetHr(100, 110))
  .finished("Done!")
  .build();

await suunto.guides.create(definition);
```

**Phase shortcuts** each take a callback receiving a `PhaseBuilder` for that
block. The step is committed when the callback returns.

| Phase | Method |
|---|---|
| `warmUp` | `.warmUp(s => ...)` |
| `interval` | `.interval(s => ...)` |
| `rest` | `.rest(s => ...)` |
| `coolDown` | `.coolDown(s => ...)` |
| `split` | `.split(s => ...)` |
| `finished` | `.finished(text?)` — terminal, no trigger / alerts |

**Configurators on `PhaseBuilder`:**

| Method | Effect |
|---|---|
| `.title(s)` | step title shown on the watch |
| `.duration(sec)` | ends step after N seconds (or manual lap); auto-adds countdown |
| `.distance(m)` | ends step after N meters (or manual lap); auto-adds countdown |
| `.location(lat, lon, withinM?)` | ends step when athlete reaches coords (or manual lap); no countdown |
| `.trigger(cond)` | arbitrary condition — used **verbatim**, no manualLap fallback, no countdown |
| `.targetHr(min, max, value?, title?)` | target HR range + live HR readout (value defaults to midpoint) |
| `.targetPace`, `.targetPower`, `.targetCadence`, `.targetSpeed` | same shape for other metrics |
| `.field(f)` | append any pre-built `GuideField` |
| `.noManualLap()` | skip the default manual-lap escape |
| `.noAlerts()` | skip the mirrored alert |
| `.uuid(s)` / `.id(s)` | override generated values |

**Other step starters:**

| Method | Effect |
|---|---|
| `.notification(title, text?)` | passive banner step |
| `.repeat(times, r => ...)` | loop block; the callback fills the inner steps |
| `.step(raw)` | append a pre-built `GuideStep` (escape hatch) |

**Auto-fill at commit:**

- `lap: { type: "manual", hidden: true }` (unless `.noManualLap()`)
- `trigger: or(stepDuration\|stepDistance, manualLap())` from `.duration` / `.distance`
- countdown field appended (`stepDurationCountdown` / `stepDistanceCountdown`)
- `alerts: [{ type: "default", condition: ..., countdown: { type: "standard" } }]` (unless `.noAlerts()`)
- `extensions["com.suunto"] = { phase, isCustomNameSet: false, uuid: <upper-case randomUUID> }`

**Helper functions** for raw field / condition construction (use with `.field()` /
`.step()`):

```ts
import {
  // conditions
  or, and, stepDuration, stepDistance, duration, distance, manualLap, location,
  // fields
  hr, pace, power, cadence, speed,
  targetHr, targetPace, targetPower, targetCadence, targetSpeed,
  targetHrZone, targetPaceZone, targetPowerZone, targetFromZone,
  stepDurationCountdown, stepDistanceCountdown, text, variable,
} from "suunto-api-wrapper";
```

#### Custom triggers

`.duration` / `.distance` / `.location` cover the common cases (each
auto-wraps with a `manualLap` fallback). For anything else — combined
triggers, geofences with extra cutoffs — use `.trigger(cond)` with composed
helpers:

```ts
import {
  guide, or, and, stepDuration, stepDistance, duration, location, manualLap,
  stepDurationCountdown,
} from "suunto-api-wrapper";

const definition = guide()
  .name("Long run").owner("me")
  .description("Easy long run").shortDescription("Long")
  .activities([SuuntoActivityType.RUNNING]).usage("workout")
  .interval(s => s
    .title("Easy")
    // step ends when 5 km covered OR 30 min elapsed OR athlete reaches marker
    .trigger(or(
      stepDistance(5000),
      stepDuration(1800),
      location(45.7640, 4.8357, 50),
      manualLap(),
    ))
    .targetHr(130, 140)
    .field(stepDurationCountdown(1800))
  )
  .finished("Done!")
  .build();
```

`.trigger(cond)` uses `cond` **verbatim** — no `manualLap` fallback is added,
no countdown is appended. Compose with `or`/`and` and include `manualLap()`
yourself if you want the user to be able to lap out.

Alerts have a stricter schema than triggers: Suunto only accepts `stepDuration`
or `stepDistance` for `alert.condition`. The builder auto-mirrors an alert by
recursively scanning the trigger for the first such condition. With the
example above the alert mirrors `stepDistance(5000)` — the first allowed cond
inside the `or(...)`. Triggers with no `stepDuration` / `stepDistance`
(e.g. `.location()` alone, or `.trigger(location(...))`) produce **no** alert.

Conditions nest: `and(stepDistance(1000), duration(3600))` fires only when the
step has covered 1 km **and** the workout has been running ≥ 1 h — useful for
tail-end intervals.

The builder is **mutable** — methods return `this`. Call `.build()` once.
Some properties are required by the backend; missing them throws at `.build()`.

### Unauthenticated access

Some endpoints (like fetching a public profile) don't require login. Use the
`unauthenticated()` factory to create a client that sends **no** credentials:

```ts
const guest = SuuntoClient.unauthenticated();
const profile = await guest.users.byName("someuser");
const stats   = await guest.workouts.stats("someuser");
```

### Escape hatch: the raw HTTP client

For endpoints not yet wrapped, reach the underlying HTTP client directly. It
already carries the auth headers, retries, and timeouts:

```ts
const res = await suunto.http.get("/apiserver/v1/some/other/endpoint", {
  query: { foo: "bar" },
});
console.log(res.status, res.data);
```

### Retries

The HTTP client retries failed requests with exponential backoff + jitter
(plus `Retry-After` when present). Defaults: **2 retries**, 300 ms base
backoff, applied only to idempotent methods (`GET`, `HEAD`, `OPTIONS`, `PUT`,
`DELETE`) on retryable statuses (408, 429, 500, 502, 503, 504) or transport
errors.

**`DELETE` is the exception.** It defaults to **0 retries**. A retried
`DELETE` whose first attempt actually succeeded will see a 404 on the second
attempt and surface as an error — even though the delete worked. Opt back in
per call when you want it:

```ts
await suunto.guides.delete("guide-id");                  // 0 retries (default)
await suunto.http.delete("/some/path", { retries: 3 });  // opt-in
```

---

## Development

```bash
npm run build       # bundle to dist/ (ESM + CJS + types) with tsup
npm run dev         # rebuild on change (tsup --watch)
npm run typecheck   # tsc --noEmit
npm test            # run the vitest suite once
npm run test:watch  # vitest in watch mode
```

---

## License

ISC.
