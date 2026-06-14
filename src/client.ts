import {HttpClient, type HttpClientOptions} from "./http";
import {AuthSession, DEFAULT_USER_AGENT, login, type LoginOptions, sessionTokenFrom, SPORTS_TRACKER_API,} from "./auth";
import {WorkoutsResource} from "./workouts";
import {UsersResource} from "./users";
import {GearResource} from "./gear";
import {SPORTS_TRACKER_247_API, WellnessResource} from "./wellness";

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
  /** Override host for the 247 service (sleep/recovery/activity). */
  baseUrl247?: string;
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

  /** Dedicated HTTP client for the 247 host (sleep/recovery/activity). */
  readonly http247: HttpClient;

  readonly workouts: WorkoutsResource;
  readonly users: UsersResource;
  readonly gear: GearResource;
  readonly wellness: WellnessResource;

  constructor(options: SuuntoClientOptions) {
    const {
      email,
      sessionKey,
      userAgent = DEFAULT_USER_AGENT,
      baseUrl,
      baseUrl247,
      headers,
      ...rest
    } = options;

    this.sessionKey = sessionKey;
    const auth = new AuthSession({ email, sessionKey });
    const sharedHeaders = { "user-agent": userAgent, ...headers };

    this.http = new HttpClient({
      baseUrl: baseUrl ?? SPORTS_TRACKER_API,
      headers: sharedHeaders,
      ...rest,
      beforeRequest: (ctx) => auth.applyTo(ctx),
    });

    this.http247 = new HttpClient({
      baseUrl: baseUrl247 ?? SPORTS_TRACKER_247_API,
      headers: sharedHeaders,
      ...rest,
      beforeRequest: async (ctx) => {
        await auth.applyTo(ctx);
        ctx.headers["accept"] = "*/*";
      },
    });

    this.workouts = new WorkoutsResource(this.http);
    this.users = new UsersResource(this.http);
    this.gear = new GearResource(this.http);
    this.wellness = new WellnessResource(this.http247);
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
