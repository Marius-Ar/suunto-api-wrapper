import type {RequestContext} from "../http";
import {generateXtotp} from "../otp";

export interface AuthSessionInit {
    email?: string;
    sessionKey?: string;
}

export class AuthSession {
    private readonly XTOTP_HEADER = 'x-totp';
    private readonly AUTH_HEADER = 'sttauthorization';

    readonly email?: string;
    readonly sessionKey?: string;

    constructor(init: AuthSessionInit = {}) {
        this.email = init.email;
        this.sessionKey = init.sessionKey;
    }

    async applyTo(ctx: Pick<RequestContext, "headers">): Promise<void> {
        if (this.email) ctx.headers[this.XTOTP_HEADER] = await generateXtotp(this.email);
        if (this.sessionKey) ctx.headers[this.AUTH_HEADER] = this.sessionKey;
    }
}