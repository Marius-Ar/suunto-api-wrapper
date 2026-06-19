import {zipSync, strToU8} from "fflate";
import {describe, expect, it} from "vitest";
import {mockClient} from "../testing";
import {GuidesResource} from "./index";
import type {GuideDefinition} from "./types";

function guides(data: unknown = null) {
    const client = mockClient(data);
    return {client, resource: new GuidesResource(client)};
}

const sampleDefinition: GuideDefinition = {
    type: "guide",
    name: "Test Guide",
    description: "desc",
    shortDescription: "short",
    owner: "owner",
    activities: [],
    usage: "usage",
    steps: [],
};

function buildGuideZip(
    definition: GuideDefinition = sampleDefinition,
    icon?: Uint8Array,
): Uint8Array {
    const entries: Record<string, Uint8Array> = {
        "guide.json": strToU8(JSON.stringify(definition)),
    };
    if (icon) entries["icon.png"] = icon;
    return zipSync(entries);
}

describe("list", () => {
    it("calls the correct URL", async () => {
        const {client, resource} = guides();
        await resource.list();

        expect(client.get).toHaveBeenCalledWith("/apiserver/v1/suuntoplus/guides/items");
    });
});

describe("get", () => {
    it("requests the guide file as bytes with an encoded id", async () => {
        const {client, resource} = guides(buildGuideZip());
        await resource.get("guide/with spaces");

        expect(client.get).toHaveBeenCalledWith(
            "/apiserver/v1/suuntoplus/guides/files/guide%2Fwith%20spaces",
            {responseType: "bytes"},
        );
    });

    it("unpacks the guide zip into definition + icon", async () => {
        const icon = new Uint8Array([1, 2, 3, 4]);
        const {resource} = guides(buildGuideZip(sampleDefinition, icon));

        const content = await resource.get("abc");

        expect(content.definition).toEqual(sampleDefinition);
        expect(content.icon).toEqual(icon);
    });

    it("defaults icon to empty bytes when missing", async () => {
        const {resource} = guides(buildGuideZip(sampleDefinition));

        const content = await resource.get("abc");

        expect(content.icon).toEqual(undefined);
    });

    it("rejects when guide.json is invalid JSON", async () => {
        const bad = zipSync({"guide.json": strToU8("not-json")});
        const {resource} = guides(bad);

        await expect(resource.get("abc")).rejects.toThrow();
    });

    it("rejects when bytes are not a valid zip", async () => {
        const {resource} = guides(new Uint8Array([0, 1, 2, 3]));

        await expect(resource.get("abc")).rejects.toThrow();
    });
});
