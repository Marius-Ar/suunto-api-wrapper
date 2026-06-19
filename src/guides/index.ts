import { unzip } from "fflate";
import { Resource } from "../http/resource";
import {
  GuideContent,
  GuideDefinition,
  GuideListResponse,
} from "./types";

export * from "./types.js";

export class GuidesResource extends Resource {
  private static readonly BASE_PATH = "/apiserver/v1/suuntoplus/guides";

  /**
   * Lists SuuntoPlus guides available to the authenticated user. Each entry
   * carries metadata (name, owner, activities, icon/background URLs, ...) but
   * not the guide steps themselves — fetch a specific guide with
   * {@link get} to get the parsed guide definition.
   */
  list(): Promise<GuideListResponse> {
    return this.call<GuideListResponse>({
      path: `${GuidesResource.BASE_PATH}/items`,
    });
  }

  /**
   * Fetch a single guide by id. Endpoint returns a zip containing
   * `guide.json` (parsed into {@link GuideDefinition}) and `icon.png`
   * (returned as raw bytes).
   */
  async get(guideId: string): Promise<GuideContent> {
    const res = await this.client.get<Uint8Array>(
      this.buildGuidePath(guideId),
      { responseType: "bytes" },
    );
    const {definition, icon} = await GuidesResource.unpackGuideZip(res.data);
    return {definition, icon, raw: res.data};
  }

  async delete(guideId: string): Promise<void> {
    await this.client.delete<void>(this.buildGuidePath(guideId));
  }

  private buildGuidePath(guideId: string) {
    return `${GuidesResource.BASE_PATH}/files/${encodeURIComponent(guideId)}`;
  }

  private static unpackGuideZip(bytes: Uint8Array): Promise<Omit<GuideContent, 'raw'>> {
    return new Promise((resolve, reject) => {
      unzip(bytes, (err, files) => {
        if (err) return reject(err);
        const guideEntry = files["guide.json"];
        const iconEntry = files["icon.png"];

        try {
          const definition = JSON.parse(
            new TextDecoder().decode(guideEntry),
          ) as GuideDefinition;
          resolve({ definition, icon: iconEntry });
        } catch (parseErr) {
          reject(parseErr);
        }
      });
    });
  }
}
