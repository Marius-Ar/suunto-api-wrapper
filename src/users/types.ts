export interface UserProfile {
  username: string;
  createdDate: number;
  lastModified: number;
  lastLogin: number;
  realName: string;
  /** ISO 3166-1 alpha-2 country code. */
  country: string;
  gender: string;
  uuid: string;
  blocked: boolean;
  showLocale: boolean;
  followersCount: number;
  followingCount: number;
  currentBlobStorageLocation: string;
  defaultBinaryStorageLocation: string;
}

export interface UserProfileResponse {
  error: string | null;
  payload: UserProfile;
  metadata: {
    ts: string;
  };
}

/** User shape returned by the search endpoint (differs slightly from {@link UserProfile}). */
export interface SearchUser {
  username: string;
  createdDate: number;
  lastModified: number;
  lastLogin: number;
  /** Absent on some legacy accounts. */
  realName?: string;
  /** Free-form profile bio. */
  description?: string;
  /** ISO 3166-1 country code. Mostly alpha-2, but legacy records may use alpha-3 (e.g. "FRA"). */
  country?: string;
  city?: string;
  gender: string;
  uuid: string;
  imageKey?: string;
  profileImageUrl?: string;
  coverImageKey?: string;
  coverImageUrl?: string;
  showLocale: boolean;
  defaultBinaryStorageLocation: string;
  currentBlobStorageLocation: string;
  key: string;
}

export interface UserSearchResult {
  /** Relationship to the searching user, e.g. "STRANGER". */
  connection: string;
  user: SearchUser;
  workout: unknown | null;
}

export interface UserSearchResponse {
  error: string | null;
  payload: UserSearchResult[];
  metadata: {
    ts: string;
  };
}
