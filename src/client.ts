import { HttpClient, type HttpClientOptions } from "./http/index.js";
import { generateXtotp } from "./otp/index.js";
import {
  login,
  sessionTokenFrom,
  SPORTS_TRACKER_API,
  DEFAULT_USER_AGENT,
  type LoginOptions,
} from "./auth/index.js";
import { WorkoutsResource } from "./workouts/index.js";
import { UsersResource } from "./users/index.js";
import { GearResource } from "./gear/index.js";

export interface SuuntoClientOptions
  extends Omit<HttpClientOptions, "beforeRequest"> {
  /**
   * Account email. Drives the `x-totp` header. Omit it (e.g. via
   * {@link SuuntoClient.unauthenticated}) to use only unauthenticated endpoints
   * such as `users.byName`.
   */
  email?: string;
  /** Session key from login — sent as the `Sttauthorization` header. */
  sessionKey?: string;
  userAgent?: string;
}

/**
 * The main entry point. Owns the authenticated {@link HttpClient} and exposes
 * the API grouped by resource.
 *
 * @example
 * ```ts
 * const suunto = await SuuntoClient.login({ email, password });
 * const workouts = await suunto.workouts.own({ limit: 5 });
 * ```
 */
export class SuuntoClient {
  /** The underlying HTTP client, for advanced or not-yet-wrapped endpoints. */
  readonly http: HttpClient;
  /** Session key in use, if the client was authenticated. */
  readonly sessionKey?: string;

  readonly workouts: WorkoutsResource;
  readonly users: UsersResource;
  readonly gear: GearResource;

  constructor(options: SuuntoClientOptions) {
    const {
      email,
      sessionKey,
      userAgent = DEFAULT_USER_AGENT,
      baseUrl,
      headers,
      ...rest
    } = options;

    this.sessionKey = sessionKey;
    this.http = new HttpClient({
      baseUrl: baseUrl ?? SPORTS_TRACKER_API,
      headers: { "user-agent": userAgent, ...headers },
      ...rest,
      beforeRequest: (ctx) => {
        if (email) ctx.headers["x-totp"] = generateXtotp(email);
        if (sessionKey) ctx.headers["sttauthorization"] = sessionKey;
      },
    });

    this.workouts = new WorkoutsResource(this.http);
    this.users = new UsersResource(this.http);
    this.gear = new GearResource(this.http);
  }

  /** Log in with email/password and return an authenticated client. */
  static async login(
    options: LoginOptions & Omit<SuuntoClientOptions, "email" | "sessionKey">,
  ): Promise<SuuntoClient> {
    const session = await login(options);
    const sessionKey = sessionTokenFrom(session);
    const { password: _password, version: _version, ...clientOptions } = options;
    return new SuuntoClient({ ...clientOptions, sessionKey });
  }

  /**
   * Create a client with no credentials, for unauthenticated endpoints only
   * (e.g. {@link UsersResource.byName}). No `x-totp` or session header is sent.
   */
  static unauthenticated(
    options: Omit<SuuntoClientOptions, "email" | "sessionKey"> = {},
  ): SuuntoClient {
    return new SuuntoClient(options);
  }
}
