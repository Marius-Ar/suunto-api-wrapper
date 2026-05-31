export interface LoginOptions {
  email: string;
  password: string;
  version?: string;
  userAgent?: string;
  baseUrl?: string;
  fetch?: typeof fetch;
  timeoutMs?: number;
}

export interface LoginResponse {
  sessionkey?: string;
  [key: string]: unknown;
}
