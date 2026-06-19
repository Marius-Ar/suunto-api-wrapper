import {unzip, zip} from "fflate";
import {Resource} from "../http/resource";
import {DEFAULT_GUIDE_ICON} from "./default-icon";
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

  async create(guideDefinition: GuideDefinition, icon: Uint8Array = DEFAULT_GUIDE_ICON): Promise<GuideUploadResponse> {
    GuidesResource.checkPngSize(icon);
    const zippedGuideArray = await GuidesResource.zipGuide(guideDefinition, icon);
    const res = await this.client.post<GuideUploadResponse>(`${GuidesResource.BASE_PATH}/files`, this.getGuideUploadOptions(zippedGuideArray));
    return res.data;
  }

  async update(guideId: string, guideDefinition: GuideDefinition, icon: Uint8Array = DEFAULT_GUIDE_ICON): Promise<GuideUploadResponse> {
    GuidesResource.checkPngSize(icon);
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

  private static readPngSize(bytes: Uint8Array): { width: number; height: number } {
    // PNG signature: 89 50 4E 47 0D 0A 1A 0A
    const sig = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
    if (bytes.length < 24 || sig.some((b, i) => bytes[i] !== b)) {
      throw new Error("icon: not a valid PNG");
    }
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    return { width: view.getUint32(16), height: view.getUint32(20) };
  }

  private static checkPngSize(bytes: Uint8Array): void {
    const { width, height } = GuidesResource.readPngSize(bytes);
    if (width !== 300 || height !== 300) {
      throw new Error(`icon must be 300x300, got ${width}x${height}`);
    }
  }
}
