export * from "./types.js";

import type { HttpClient } from "../http";
import type {
  ActivityExportResponse,
  ExportParams,
  RecoveryExportResponse,
  SleepExportResponse,
  SleepStagesExportResponse,
} from "./types.js";

function exportQuery(params: ExportParams) {
  return params.since == null ? undefined : { since: params.since };
}

/**
 * Endpoints served by `https://247.sports-tracker.com` (sleep, recovery,
 * activity). Bound to a dedicated {@link HttpClient} configured against that
 * host. Accessed via `suunto.wellness`.
 */
export class WellnessResource {
  constructor(private readonly client: HttpClient) {}

  /** Sleep summaries from the 247 service. */
  async sleep(params: ExportParams = {}): Promise<SleepExportResponse> {
    const res = await this.client.get<SleepExportResponse>("/v1/sleep/export", {
      query: exportQuery(params),
    });
    return res.data;
  }

  /** Per-stage sleep intervals from the 247 service. */
  async sleepStages(
    params: ExportParams = {},
  ): Promise<SleepStagesExportResponse> {
    const res = await this.client.get<SleepStagesExportResponse>(
      "/v1/sleepstages/export",
      { query: exportQuery(params) },
    );
    return res.data;
  }

  /** Recovery entries (balance + stress state) from the 247 service. */
  async recovery(params: ExportParams = {}): Promise<RecoveryExportResponse> {
    const res = await this.client.get<RecoveryExportResponse>(
      "/v1/recovery/export",
      { query: exportQuery(params) },
    );
    return res.data;
  }

  /** Daily activity entries from the 247 service. */
  async activity(params: ExportParams = {}): Promise<ActivityExportResponse> {
    const res = await this.client.get<ActivityExportResponse>(
      "/v1/activity/export",
      { query: exportQuery(params) },
    );
    return res.data;
  }
}
