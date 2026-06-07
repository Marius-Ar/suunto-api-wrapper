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
  return params.since == null ? undefined : {since: params.since};
}

/** Sleep summaries from the 247 service. */
export async function getSleepExport(
  client: HttpClient,
  params: ExportParams = {},
): Promise<SleepExportResponse> {
  const res = await client.get<SleepExportResponse>("/v1/sleep/export", {
    query: exportQuery(params),
  });
  return res.data;
}

/** Per-stage sleep intervals from the 247 service. */
export async function getSleepStagesExport(
  client: HttpClient,
  params: ExportParams = {},
): Promise<SleepStagesExportResponse> {
  const res = await client.get<SleepStagesExportResponse>(
    "/v1/sleepstages/export",
    { query: exportQuery(params) },
  );
  return res.data;
}

/** Recovery entries (balance + stress state) from the 247 service. */
export async function getRecoveryExport(
  client: HttpClient,
  params: ExportParams = {},
): Promise<RecoveryExportResponse> {
  const res = await client.get<RecoveryExportResponse>("/v1/recovery/export", {
    query: exportQuery(params),
  });
  return res.data;
}

/** Daily activity entries from the 247 service. */
export async function getActivityExport(
  client: HttpClient,
  params: ExportParams = {},
): Promise<ActivityExportResponse> {
  const res = await client.get<ActivityExportResponse>("/v1/activity/export", {
    query: exportQuery(params),
  });
  return res.data;
}

/**
 * Endpoints served by `https://247.sports-tracker.com` (sleep, recovery,
 * activity). Bound to a dedicated {@link HttpClient} configured against that
 * host. Accessed via `suunto.wellness`.
 */
export class WellnessResource {
  constructor(private readonly client: HttpClient) {}

  sleep(params?: ExportParams): Promise<SleepExportResponse> {
    return getSleepExport(this.client, params);
  }

  sleepStages(params?: ExportParams): Promise<SleepStagesExportResponse> {
    return getSleepStagesExport(this.client, params);
  }

  recovery(params?: ExportParams): Promise<RecoveryExportResponse> {
    return getRecoveryExport(this.client, params);
  }

  activity(params?: ExportParams): Promise<ActivityExportResponse> {
    return getActivityExport(this.client, params);
  }
}
