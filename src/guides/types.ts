import {SuuntoActivityType} from "../common/types";

/** Unzipped guide payload: parsed `guide.json` + raw `icon.png` bytes. */
export interface GuideContent {
  definition: GuideDefinition;
  icon: Uint8Array;
}

/**
 * Content of `guide.json` inside the guide zip. Top-level metadata is fully
 * typed; `steps` is left as `unknown[]` because the step schema is
 * polymorphic (notification / fields / repeat / ...) and not yet modelled.
 */
export interface GuideDefinition {
  type: string;
  name: string;
  description: string;
  shortDescription: string;
  owner: string;
  activities: SuuntoActivityType[];
  usage: string;
  steps: unknown[];
}

export interface GuideListResponse {
    error: string | null;
    payload: Guide[];
    metadata: {
        ts: string;
    }
}

export interface Guide {
    id: string,
    username: string,
    type: string,
    modificationTime: number,
    fileModificationTime: number,
    name: string,
    description: string,
    shortDescription: string,
    owner: string,
    url: string,
    iconUrl: string,
    backgroundUrl: any,  // TODO: Replace with actual type
    richText: string,
    "activities": SuuntoActivityType[],
    /** YYYY-MM-DD format */
    "localDate": string,
    "usage": string,
    "pinned": boolean,
    "externalId": string,
    "ownerId": string,
    "catalogueId": any,  // TODO: Replace with actual type
    "extended": any  // TODO: Replace with actual type
}
