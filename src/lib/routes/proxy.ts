import type { RequestHandler } from '@sveltejs/kit';
import { DdysError } from '../client/error.js';
import type { DdysConfigInput } from '../config.js';
import { cleanRuntimeQuery } from '../config.js';
import { cachedDdys } from '../server/cache.js';
import { createDdysServerClient } from '../server/client.js';

export interface DdysProxyHandlerOptions { config?: DdysConfigInput; cache?: boolean; }
export function createDdysProxyHandler(options: DdysProxyHandlerOptions = {}): RequestHandler {
  return async (event) => {
    const route = String(event.params.route || event.url.searchParams.get('route') || '');
    const query = { ...cleanRuntimeQuery(event.url.searchParams), slug: event.url.searchParams.get('slug') || undefined, id: event.url.searchParams.get('id') || undefined, username: event.url.searchParams.get('username') || undefined };
    const noCache = event.url.searchParams.get('noCache') === '1' || event.url.searchParams.get('noCache') === 'true';
    try {
      const client = createDdysServerClient(event, options.config);
      if (!client.config.proxy.enabled) return json({ success: false, message: 'DDYS proxy is disabled.' }, 404);
      const payload = options.cache === false ? await client.proxy(route, query, { noCache }) : await cachedDdys(client, route, query, noCache);
      return json(payload, 200, noCache ? 'private, no-store' : `public, max-age=${Math.min(60, client.config.cache.defaultTtl)}`);
    } catch (error) { return errorJson(error); }
  };
}
export const ddysProxyGET = createDdysProxyHandler();
function json(payload: unknown, status = 200, cacheControl = 'private, no-store') { return Response.json(payload, { status, headers: { 'Cache-Control': cacheControl } }); }
function errorJson(error: unknown) { return error instanceof DdysError ? json({ success: false, message: error.message, status: error.status }, error.status >= 400 ? error.status : 500) : json({ success: false, message: error instanceof Error ? error.message : 'DDYS proxy failed.' }, 500); }
