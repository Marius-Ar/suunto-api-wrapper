export * from "./types.js";

import { HttpClient } from "../http/index.js";
import { generateXtotp } from "../otp/index.js";
import type { LoginOptions, LoginResponse } from "./types.js";

export const SPORTS_TRACKER_API = "https://api.sports-tracker.com";

export const DEFAULT_USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36";

export async function login(options: LoginOptions): Promise<LoginResponse> {
  const {
    email,
    password,
    version = "2",
    userAgent = DEFAULT_USER_AGENT,
    baseUrl = SPORTS_TRACKER_API,
    fetch: fetchImpl,
    timeoutMs,
  } = options;

  const http = new HttpClient({ baseUrl, fetch: fetchImpl, timeoutMs });
  const body = new URLSearchParams({ l: email, p: password, version });

  const response = await http.post<LoginResponse>("/apiserver/v1/login2", {
    body,
    headers: {
      "user-agent": userAgent,
      "x-totp": generateXtotp(email),
      "content-type": "application/x-www-form-urlencoded",
    },
  });

  return response.data;
}

export function sessionTokenFrom(response: LoginResponse): string | undefined {
  return response.sessionkey;
}
