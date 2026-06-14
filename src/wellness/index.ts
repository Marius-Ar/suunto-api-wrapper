export * from "./types.js";

import { HttpClient, type HttpClientOptions } from "../http";
import { AuthSession } from "../auth";
import {
  SPORTS_TRACKER_247_API,
  type ActivityExportResponse,
  type ExportParams,
  type RecoveryExportResponse,
  type SleepExportResponse,
  type SleepStagesExportResponse,
} from "./types.js";

function exportQuery(params: ExportParams) {
  return params.since == null ? undefined : { since: params.since };
}

export interface WellnessResourceOptions
  extends Omit<HttpClientOptions, "beforeRequest" | "baseUrl"> {
  auth: AuthSession;
  baseUrl?: string;
}

/**
 * Endpoints served by `https://247.sports-tracker.com` (sleep, recovery,
 * activity). Owns its own {@link HttpClient} configured against that host,
 * including the wellness-specific wildcard accept header. Accessed via
 * `suunto.wellness`.
 */
export class WellnessResource {
  readonly http: HttpClient;

  constructor(options: WellnessResourceOptions) {
    const { auth, baseUrl, ...rest } = options;
    this.http = new HttpClient({
      ...rest,
      baseUrl: baseUrl ?? SPORTS_TRACKER_247_API,
      beforeRequest: async (ctx) => {
        await auth.applyTo(ctx);
        ctx.headers["accept"] = "*/*";
      },
    });
  }

  /** Sleep summaries from the 247 service. */
  async sleep(params: ExportParams = {}): Promise<SleepExportResponse> {
    const res = await this.http.get<SleepExportResponse>("/v1/sleep/export", {
      query: exportQuery(params),
    });
    return res.data;
  }

  /** Per-stage sleep intervals from the 247 service. */
  async sleepStages(
    params: ExportParams = {},
  ): Promise<SleepStagesExportResponse> {
    const res = await this.http.get<SleepStagesExportResponse>(
      "/v1/sleepstages/export",
      { query: exportQuery(params) },
    );
    return res.data;
  }

  /** Recovery entries (balance + stress state) from the 247 service. */
  async recovery(params: ExportParams = {}): Promise<RecoveryExportResponse> {
    const res = await this.http.get<RecoveryExportResponse>(
      "/v1/recovery/export",
      { query: exportQuery(params) },
    );
    return res.data;
  }

  /** Daily activity entries from the 247 service. */
  async activity(params: ExportParams = {}): Promise<ActivityExportResponse> {
    const res = await this.http.get<ActivityExportResponse>(
      "/v1/activity/export",
      { query: exportQuery(params) },
    );
    return res.data;
  }
}
