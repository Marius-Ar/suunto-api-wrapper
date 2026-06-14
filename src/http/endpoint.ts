import type { HttpClient } from "./index.js";
import type { Query } from "./types.js";

export interface EndpointSpec {
  path: string;
  query?: Query;
}

/**
 * Calls `GET path` on `client` and returns the parsed response body. Lets
 * resource methods skip the `const res = await ...; return res.data;`
 * boilerplate while keeping the path + query inline at the call site.
 */
export async function endpoint<T>(
  client: HttpClient,
  spec: EndpointSpec,
): Promise<T> {
  const res =
    spec.query === undefined
      ? await client.get<T>(spec.path)
      : await client.get<T>(spec.path, { query: spec.query });
  return res.data;
}
