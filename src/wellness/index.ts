import { Resource } from "../http/resource";

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

const exportQuery = (params: ExportParams) =>
  params.since == null ? undefined : { since: params.since };

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
export class WellnessResource extends Resource {
  constructor(options: WellnessResourceOptions) {
    const { auth, baseUrl, ...rest } = options;
    const http = new HttpClient({
      ...rest,
      baseUrl: baseUrl ?? SPORTS_TRACKER_247_API,
      beforeRequest: async (ctx) => {
        await auth.applyTo(ctx);
        ctx.headers["accept"] = "*/*";
      },
    });

    super(http);
  }

  /** Sleep summaries from the 247 service. */
  sleep(params: ExportParams = {}): Promise<SleepExportResponse> {
    return this.call<SleepExportResponse>({
      path: "/v1/sleep/export",
      query: exportQuery(params),
    });
  }

  /** Per-stage sleep intervals from the 247 service. */
  sleepStages(params: ExportParams = {}): Promise<SleepStagesExportResponse> {
    return this.call<SleepStagesExportResponse>({
      path: "/v1/sleepstages/export",
      query: exportQuery(params),
    });
  }

  /** Recovery entries (balance + stress state) from the 247 service. */
  recovery(params: ExportParams = {}): Promise<RecoveryExportResponse> {
    return this.call<RecoveryExportResponse>({
      path: "/v1/recovery/export",
      query: exportQuery(params),
    });
  }

  /** Daily activity entries from the 247 service. */
  activity(params: ExportParams = {}): Promise<ActivityExportResponse> {
    return this.call<ActivityExportResponse>({
      path: "/v1/activity/export",
      query: exportQuery(params),
    });
  }
}
