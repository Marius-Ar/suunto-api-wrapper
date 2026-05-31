# suunto-api-wrapper

A small, typed TypeScript client for the **Suunto app API** (which is served by
the Sports Tracker backend at `api.sports-tracker.com`).

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

This package isn't published to npm yet. Install it from source:

```bash
git clone <this-repo> suunto-api-wrapper
cd suunto-api-wrapper
npm install
npm run build      # emits ESM + CJS + .d.ts into dist/
```

Then consume it from another project (e.g. via a local path or `npm link`):

```jsonc
// package.json
{
  "dependencies": {
    "suunto-api-wrapper": "file:../suunto-api-wrapper"
  }
}
```

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

| Namespace          | Method                         | Endpoint                                  |
| ------------------ | ------------------------------ | ----------------------------------------- |
| `suunto.workouts`  | `.own(params?)`                | your own workouts                         |
|                    | `.public(username, params?)`   | a user's public workouts                  |
| `suunto.users`     | `.byName(username)`            | a user's public profile                   |
|                    | `.search(terms)`               | search for users                          |
| `suunto.gear`      | `.latest(username, params?)`   | a user's latest gear                      |

```ts
// Workouts
const own         = await suunto.workouts.own({ limit: 20, offset: 0, since: 0 });
const publicItems = await suunto.workouts.public("someuser", { limit: 40 });

// Users
const profile = await suunto.users.byName("someuser");
const matches = await suunto.users.search("john");

// Gear
const gear = await suunto.gear.latest("someuser", { allTypes: true });
```

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

### Unauthenticated access

Some endpoints (like fetching a public profile) don't require login. Use the
`unauthenticated()` factory to create a client that sends **no** credentials:

```ts
const guest = SuuntoClient.unauthenticated();
const profile = await guest.users.byName("someuser");
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
