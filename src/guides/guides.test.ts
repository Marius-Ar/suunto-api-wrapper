import {unzipSync, zipSync, strToU8, strFromU8} from "fflate";
import {describe, expect, it, vi} from "vitest";
import {mockClient} from "../testing";
import {DEFAULT_GUIDE_ICON} from "./default-icon";
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
        const zip = buildGuideZip(sampleDefinition, icon);
        const {resource} = guides(zip);

        const content = await resource.get("abc");

        expect(content.definition).toEqual(sampleDefinition);
        expect(content.icon).toEqual(icon);
        expect(content.raw).toEqual(zip)
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

describe("delete", () => {
    it("requests the delete guide file endpoint as bytes with an encoded id", async () => {
        const {client, resource} = guides();
        await resource.delete("guide/with spaces");

        expect(client.delete).toHaveBeenCalledWith(
            "/apiserver/v1/suuntoplus/guides/files/guide%2Fwith%20spaces"
        );
    });
});

function valid300Png(): Uint8Array {
    return new Uint8Array(DEFAULT_GUIDE_ICON);
}

function lastCallOptions(mock: ReturnType<typeof vi.fn>) {
    const calls = mock.mock.calls;
    return calls[calls.length - 1][1] as { body: Uint8Array; headers: Record<string, string> };
}

describe("create", () => {
    it("POSTs zipped guide + icon to /files with application/zip header", async () => {
        const {client, resource} = guides({id: "new-id"});
        const icon = valid300Png();

        await resource.create(sampleDefinition, icon);

        expect(client.post).toHaveBeenCalledTimes(1);
        const [url, opts] = (client.post as ReturnType<typeof vi.fn>).mock.calls[0];
        expect(url).toBe("/apiserver/v1/suuntoplus/guides/files");
        expect(opts.headers["content-type"]).toBe("application/zip");

        const entries = unzipSync(opts.body);
        expect(JSON.parse(strFromU8(entries["guide.json"]))).toEqual(sampleDefinition);
        expect(entries["icon.png"]).toEqual(icon);
    });

    it("uses the default transparent icon when icon arg omitted", async () => {
        const {client, resource} = guides({id: "new-id"});

        await resource.create(sampleDefinition);

        const entries = unzipSync(lastCallOptions(client.post as ReturnType<typeof vi.fn>).body);
        expect(entries["icon.png"]).toEqual(DEFAULT_GUIDE_ICON);
    });

    it("returns the server response body", async () => {
        const {resource} = guides({id: "srv-id"});

        const res = await resource.create(sampleDefinition);

        expect(res).toEqual({id: "srv-id"});
    });

    it("rejects when icon is not 300x300", async () => {
        const {resource} = guides();
        const wrongSize = new Uint8Array(24);
        wrongSize.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], 0);
        new DataView(wrongSize.buffer).setUint32(16, 1);
        new DataView(wrongSize.buffer).setUint32(20, 1);

        await expect(resource.create(sampleDefinition, wrongSize)).rejects.toThrow(/300x300/);
    });

    it("rejects when icon is not a valid PNG", async () => {
        const {resource} = guides();

        await expect(
            resource.create(sampleDefinition, new Uint8Array([1, 2, 3, 4])),
        ).rejects.toThrow(/valid PNG/);
    });
});

describe("update", () => {
    it("PUTs zipped guide + icon to the encoded guide path", async () => {
        const {client, resource} = guides({id: "abc"});
        const icon = valid300Png();

        await resource.update("guide/with spaces", sampleDefinition, icon);

        expect(client.put).toHaveBeenCalledTimes(1);
        const [url, opts] = (client.put as ReturnType<typeof vi.fn>).mock.calls[0];
        expect(url).toBe("/apiserver/v1/suuntoplus/guides/files/guide%2Fwith%20spaces");
        expect(opts.headers["content-type"]).toBe("application/zip");

        const entries = unzipSync(opts.body);
        expect(JSON.parse(strFromU8(entries["guide.json"]))).toEqual(sampleDefinition);
        expect(entries["icon.png"]).toEqual(icon);
    });

    it("uses the default transparent icon when icon arg omitted", async () => {
        const {client, resource} = guides({id: "abc"});

        await resource.update("abc", sampleDefinition);

        const entries = unzipSync(lastCallOptions(client.put as ReturnType<typeof vi.fn>).body);
        expect(entries["icon.png"]).toEqual(DEFAULT_GUIDE_ICON);
    });

    it("returns the server response body", async () => {
        const {resource} = guides({id: "srv-id"});

        const res = await resource.update("abc", sampleDefinition);

        expect(res).toEqual({id: "srv-id"});
    });

    it("rejects when icon is not 300x300", async () => {
        const {resource} = guides();
        const wrongSize = new Uint8Array(24);
        wrongSize.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], 0);
        new DataView(wrongSize.buffer).setUint32(16, 500);
        new DataView(wrongSize.buffer).setUint32(20, 500);

        await expect(resource.update("abc", sampleDefinition, wrongSize)).rejects.toThrow(/300x300/);
    });
});
