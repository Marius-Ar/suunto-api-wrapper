import { Resource } from "../http/resource";
import { GuideListResponse } from "./types";

export * from "./types.js";

export class GuidesResource extends Resource {
  private static readonly BASE_PATH = "/apiserver/v1/suuntoplus/guides";

  list(): Promise<GuideListResponse> {
    return this.call<GuideListResponse>({ path: `${GuidesResource.BASE_PATH}/items` });
  }
}
