import {SuuntoActivityType} from "../common/types";

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
    "localDate": "2026-07-04",
    "usage": string,
    "pinned": false,
    "externalId": string,
    "ownerId": string,
    "catalogueId": any,  // TODO: Replace with actual type
    "extended": any  // TODO: Replace with actual type
}
