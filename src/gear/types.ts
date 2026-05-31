export interface GetLatestGearParams {
  /** Include all gear types, not just the default. Default: true. */
  allTypes?: boolean;
}

export interface GearSummary {
  serialNumber: string;
  displayName: string;
  productType: string;
}

export interface GearResponse {
  error: string | null;
  payload: GearSummary[];
  metadata: {
    ts: string;
  };
}
