import type { RequestHandler } from '@sveltejs/kit';
import { DDYS_SVELTEKIT_VERSION, type DdysConfigInput } from '../config.js';
import { DdysError } from '../client/error.js';
import { ddysCacheStats } from '../server/cache.js';
import { createDdysServerClient } from '../server/client.js';
import { endpointConfig, safeDdysConfig } from '../server/config.js';

export interface DdysDiagnosticsHandlerOptions { config?: DdysConfigInput; }
export function createDdysDiagnosticsHandler(options: DdysDiagnosticsHandlerOptions = {}): RequestHandler {
  return async () => {
    const config = endpointConfig(options.config);
    if (!config.diagnostics.enabled) return Response.json({ success: false, message: 'DDYS diagnostics is disabled.' }, { status: 403 });
    return Response.json({ success: true, data: { version: DDYS_SVELTEKIT_VERSION, runtime: typeof process === 'object' ? 'node' : 'web', sveltekit: 'route-handlers', config: safeDdysConfig(config), cache: ddysCacheStats(), views: config.proxy.allowRoutes, routeHandlers: ['/api/ddys/proxy', '/api/ddys/request', '/api/ddys/diagnostics', '/api/ddys/revalidate', '/sitemap.xml', '/robots.txt', '/manifest.webmanifest'] } });
  };
}
export function createDdysDiagnosticsTestHandler(options: DdysDiagnosticsHandlerOptions = {}): RequestHandler {
  return async (event) => {
    const config = endpointConfig(options.config);
    if (!config.diagnostics.enabled) return Response.json({ success: false, message: 'DDYS diagnostics is disabled.' }, { status: 403 });
    try { return Response.json({ success: true, data: await createDdysServerClient(event, options.config).get('/latest', { limit: 1 }, { noCache: true }) }); }
    catch (error) { return Response.json({ success: false, message: error instanceof DdysError ? error.message : 'DDYS diagnostics test failed.' }, { status: 500 }); }
  };
}
export const ddysDiagnosticsGET = createDdysDiagnosticsHandler();
export const ddysDiagnosticsPOST = createDdysDiagnosticsTestHandler();
