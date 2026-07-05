import type { Actions, RequestEvent, RequestHandler } from '@sveltejs/kit';
import { fail } from '@sveltejs/kit';
import type { DdysConfigInput } from '../config.js';
import { endpointConfig } from '../server/config.js';
import { createRequestFormToken, identityFromEvent, submitDdysRequest } from '../server/request-service.js';
import { requestToObject } from '../utils/security.js';

export interface DdysRequestRouteOptions { config?: DdysConfigInput; identity?: (event: RequestEvent) => string; }
export function createDdysRequestGetHandler(options: DdysRequestRouteOptions = {}): RequestHandler {
  return async (event) => {
    const config = endpointConfig(options.config);
    const identity = options.identity?.(event) ?? identityFromEvent(event);
    try {
      const token = await createRequestFormToken(config, identity);
      return Response.json({ success: true, data: { enabled: config.requestForm.enabled, token, honeypotField: config.requestForm.honeypotField } });
    } catch (error) { return Response.json({ success: false, message: error instanceof Error ? error.message : 'DDYS request token failed.' }, { status: 500 }); }
  };
}
export function createDdysRequestPostHandler(options: DdysRequestRouteOptions = {}): RequestHandler {
  return async (event) => {
    const config = endpointConfig(options.config);
    const input = await requestToObject(event.request);
    const identity = options.identity?.(event) ?? identityFromEvent(event);
    try { return Response.json({ success: true, data: await submitDdysRequest(config, input, { identity, request: event.request }) }); }
    catch (error) { return Response.json({ success: false, message: error instanceof Error ? error.message : 'DDYS request submission failed.' }, { status: statusFor(error) }); }
  };
}
export function createDdysRequestActions(options: DdysRequestRouteOptions = {}): Actions {
  return { default: async (event) => {
    const config = endpointConfig(options.config);
    const identity = options.identity?.(event as RequestEvent) ?? identityFromEvent(event as RequestEvent);
    const input = Object.fromEntries((await event.request.formData()).entries());
    try { return { success: true, data: await submitDdysRequest(config, input, { identity, request: event.request }) }; }
    catch (error) { return fail(statusFor(error), { success: false, message: error instanceof Error ? error.message : 'DDYS request submission failed.', values: input }); }
  } };
}
export const ddysRequestGET = createDdysRequestGetHandler();
export const ddysRequestPOST = createDdysRequestPostHandler();
export const ddysRequestActions = createDdysRequestActions();
function statusFor(error: unknown): number { if (!(error instanceof Error)) return 500; if (/disabled|secret|key/i.test(error.message)) return 403; if (/wait|limit|too many/i.test(error.message)) return 429; if (/token|invalid|title|year|spam/i.test(error.message)) return 400; return 500; }
