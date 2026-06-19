import {unzip, zip} from "fflate";
import {Resource} from "../http/resource";
import {GuideContent, GuideDefinition, GuideListResponse, GuideUploadResponse,} from "./types";

export * from "./types.js";

export class GuidesResource extends Resource {
  private static readonly BASE_PATH = "/apiserver/v1/suuntoplus/guides";

  private static readonly GUIDE_ENTRY = 'guide.json';
  private static readonly ICON_ENTRY = 'icon.png';

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

  async create(guideDefinition: GuideDefinition, icon: Uint8Array): Promise<GuideUploadResponse> {
    const zippedGuideArray = await GuidesResource.zipGuide(guideDefinition, icon);
    const res = await this.client.post<GuideUploadResponse>(`${GuidesResource.BASE_PATH}/files`, this.getGuideUploadOptions(zippedGuideArray));
    return res.data;
  }

  async edit(guideId: string, guideDefinition: GuideDefinition, icon: Uint8Array): Promise<GuideUploadResponse> {
    const zippedGuideArray = await GuidesResource.zipGuide(guideDefinition, icon);
    const res = await this.client.put<GuideUploadResponse>(this.buildGuidePath(guideId), this.getGuideUploadOptions(zippedGuideArray));
    return res.data;
  }

  private buildGuidePath(guideId: string) {
    return `${GuidesResource.BASE_PATH}/files/${encodeURIComponent(guideId)}`;
  }

  private getGuideUploadOptions(zippedGuideArray: Uint8Array<ArrayBuffer>) {
    return {
      body: zippedGuideArray,
      headers: {
        'content-type': 'application/zip'
      }
    };
  }

  private static zipGuide(guideDefinition: GuideDefinition, icon: Uint8Array): Promise<Uint8Array<ArrayBuffer>> {
    return new Promise((resolve, reject) => {

      let files;
      try {
        const stringifiedGuide = JSON.stringify(guideDefinition);
        files = {
          [this.GUIDE_ENTRY]: new TextEncoder().encode(stringifiedGuide),
          [this.ICON_ENTRY]: icon
        }
      } catch (stringifyErr) {
        return reject(stringifyErr);
      }

      zip(files, (err, data) => {
        if (err) return reject(err);
        return resolve(data);
      });
    });
  }

  private static unpackGuideZip(bytes: Uint8Array): Promise<Omit<GuideContent, 'raw'>> {
    return new Promise((resolve, reject) => {
      unzip(bytes, (err, files) => {
        if (err) return reject(err);
        const guideEntry = files[this.GUIDE_ENTRY];
        const iconEntry = files[this.ICON_ENTRY];

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
