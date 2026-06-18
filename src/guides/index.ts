import { Resource } from "../http/resource";
import { GuideListResponse } from "./types";

export * from "./types.js";

export class GuidesResource extends Resource {
  private static readonly BASE_PATH = "/apiserver/v1/suuntoplus/guides";

  /**
   * Lists SuuntoPlus guides available to the authenticated user. Each entry
   * carries metadata (name, owner, activities, icon/background URLs, ...) but
   * not the guide steps themselves — fetch a specific guide with
   * {@link byId} to get the parsed guide definition.
   */
  list(): Promise<GuideListResponse> {
    return this.call<GuideListResponse>({ path: `${GuidesResource.BASE_PATH}/items` });
  }
}
