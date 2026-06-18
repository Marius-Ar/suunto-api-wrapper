import {endpoint, EndpointSpec, HttpClient} from "./index";

export abstract class Resource {
    constructor(protected readonly client: HttpClient) {}

    protected call<T>(spec: EndpointSpec): Promise<T> {
        return endpoint<T>(this.client, spec)
    }
}