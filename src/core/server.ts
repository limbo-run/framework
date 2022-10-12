import {ServerResponse} from "microrouter";
import {RequestHandler, send} from "micro";
import {IncomingMessage} from "http";

import {error, LoadLock, setting} from "./";

const redirect = require("micro-redirect");
const query = require('micro-query')

export interface HandlerResponse {
    status: string;
    code: number;
    data: string;
}

export type HandlerTask = (context: HandlerContext) => any | Partial<HandlerContext> | object | undefined;

export function toResponseFormat(response: any, status?: string, code: number = 200): HandlerResponse {
    return {
        status: status || (code === 200 ? 'ok' : 'err'),
        data: response,
        code
    }
}

export async function reply(context: HandlerContext) {
    const data = toResponseFormat(context.payload, context.status, context.code);

    return await send(context.response, context.code, data);
}
type Request = IncomingMessage & ({ session?: any})

export interface HandlerContext {
    code: number;
    status: string;
    payload: object | null | undefined;
    request: Request;
    response: ServerResponse;
    query: any;
    redirect: (url: string) => any;
    session: ({
        user: any,
        auth: any
    })
}

function mixinHandlerContext(payload: any, code = 200, status = 'ok') {

    if (typeof payload === 'object') {
        const contextModel = (payload as any);

        if (contextModel.status) {
            status = contextModel.status;
        }
        if (contextModel.code) {
            code = contextModel.code;
        }
        if (contextModel.payload !== undefined) {
            payload = contextModel.payload;
        }
    }

    return {
        status,
        payload,
        code
    };
}

const session = require('micro-cookie-session');

let sessionHandler;

export const handler = (task: HandlerTask | any, ...middleware): RequestHandler => {
    const handlerTask = async (req: IncomingMessage, res: ServerResponse) => {
        const queryParams = query(req);

        let redirected = false;

        const context = {
            status: '',
            code: 200,
            request: req,
            response: res,
            query: queryParams,
            payload: undefined,
            session: undefined,
            redirect(url) {
                redirected = true;
                redirect(res, 302, url);
            }
        };

        try {
            if (!sessionHandler) {
                sessionHandler = session({
                    name: 'session',
                    keys: [setting('SESSION_SECRET')],
                    maxAge: 24 * 60 * 60 * 1000
                });
            }

            sessionHandler(req, res);

            for (let beforeTask of middleware) {
                await Promise.resolve(beforeTask(req, res, context));
            }

            if (typeof task === 'function') {
                await LoadLock;

                const taskExecution = await task(context);
                const payload = await Promise.resolve(taskExecution);

                if (payload !== undefined) {
                    context.payload = payload;
                }
            } else {
                Object.assign(context, mixinHandlerContext(await Promise.resolve(task)));
            }

        } catch (e) {
            error(e);

            Object.assign(context, mixinHandlerContext(e, 500, 'err'));
        }

        if (redirected) {
            return;
        }

        return await reply(context);
    }

    return handlerTask;
}