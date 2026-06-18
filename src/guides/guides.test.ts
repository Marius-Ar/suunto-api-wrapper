import {describe, expect, it} from "vitest";
import {mockClient} from "../testing";
import {GuidesResource} from "./index";

function guides() {
    const client = mockClient(null);
    return {client, resource: new GuidesResource(client)};
}

describe("list", () => {
    it("calls the correct URL", async () => {
        const {client, resource} = guides();
        await resource.list();

        expect(client.get).toHaveBeenCalledWith("/apiserver/v1/suuntoplus/guides/items");
    });
});
