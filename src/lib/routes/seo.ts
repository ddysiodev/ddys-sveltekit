import type { RequestHandler } from '@sveltejs/kit';
import type { DdysConfigInput } from '../config.js';
import { createDdysServerClient } from '../server/client.js';
import { endpointConfig } from '../server/config.js';
import { createDdysManifest, createDdysRobotsText, createDdysSitemap } from '../server/seo.js';

export interface DdysSeoRouteOptions { config?: DdysConfigInput; }
export function createDdysSitemapHandler(options: DdysSeoRouteOptions = {}): RequestHandler {
  return async (event) => new Response(await createDdysSitemap(createDdysServerClient(event, options.config), createDdysServerClient(event, options.config).config), { headers: { 'content-type': 'application/xml; charset=utf-8', 'cache-control': 'public, max-age=300' } });
}
export function createDdysRobotsHandler(options: DdysSeoRouteOptions = {}): RequestHandler {
  return async () => new Response(createDdysRobotsText(endpointConfig(options.config)), { headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'public, max-age=300' } });
}
export function createDdysManifestHandler(options: DdysSeoRouteOptions = {}): RequestHandler {
  return async () => Response.json(createDdysManifest(endpointConfig(options.config)), { headers: { 'cache-control': 'public, max-age=3600' } });
}
export const ddysSitemapGET = createDdysSitemapHandler();
export const ddysRobotsGET = createDdysRobotsHandler();
export const ddysManifestGET = createDdysManifestHandler();
