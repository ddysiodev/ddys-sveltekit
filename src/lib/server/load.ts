import type { RequestEvent, ServerLoadEvent } from '@sveltejs/kit';
import type { DdysClient } from '../client/client.js';
import { publicDdysConfig } from '../config.js';
import type { DdysMovie, DdysQuery, DdysViewName } from '../types/ddys.js';
import { createDdysMovieJsonLd, createDdysMovieSeo, createDdysSeo } from './seo.js';
import { createDdysServerClient } from './client.js';
import { createRequestFormToken, identityFromEvent } from './request-service.js';

export type DdysLoadEvent = RequestEvent | ServerLoadEvent;
export interface DdysLoadOptions { params?: DdysQuery; view?: DdysViewName; }

export async function loadDdysView(event: DdysLoadEvent, view: DdysViewName = 'latest', params: DdysQuery = {}) {
  const client = clientFromEvent(event);
  const query = { ...queryFromUrl(event.url), ...params };
  return { view, params: query, payload: await dispatchView(client, view, query), config: publicDdysConfig(client.config), seo: createDdysSeo(client.config, { title: titleForView(view), path: pathForView(client.config.sveltekit.mountPath, view) }) };
}
export async function loadDdysMovie(event: DdysLoadEvent, slug = String(event.params.slug || '')) {
  const client = clientFromEvent(event);
  const movie = await client.movie(slug) as DdysMovie;
  return { slug, movie, config: publicDdysConfig(client.config), seo: createDdysMovieSeo(client.config, movie), jsonLd: createDdysMovieJsonLd(client.config, movie) };
}
export async function loadDdysSources(event: DdysLoadEvent, slug = String(event.params.slug || '')) {
  const client = clientFromEvent(event);
  return { slug, sources: await client.sources(slug), config: publicDdysConfig(client.config), seo: createDdysSeo(client.config, { title: 'DDYS Sources', path: `${client.config.sveltekit.mountPath}/movie/${slug}/sources` }) };
}
export async function loadDdysRequestForm(event: DdysLoadEvent) {
  const client = clientFromEvent(event);
  const token = await createRequestFormToken(client.config, identityFromEvent(event as RequestEvent));
  return { token, config: publicDdysConfig(client.config), seo: createDdysSeo(client.config, { title: 'DDYS Request', path: `${client.config.sveltekit.mountPath}/request` }) };
}
export async function loadDdysDiagnostics(event: DdysLoadEvent) {
  const client = clientFromEvent(event);
  return { config: publicDdysConfig(client.config), seo: createDdysSeo(client.config, { title: 'DDYS Diagnostics', path: `${client.config.sveltekit.mountPath}/diagnostics` }) };
}
export function clientFromEvent(event: DdysLoadEvent): DdysClient {
  const locals = event.locals as Record<string, unknown>;
  return locals.ddys instanceof Object && 'latest' in locals.ddys ? locals.ddys as DdysClient : createDdysServerClient(event);
}
export async function dispatchView(client: DdysClient, view: DdysViewName, params: DdysQuery = {}) {
  switch (view) {
    case 'movies': return client.movies(params);
    case 'latest': return client.latest(params);
    case 'hot': return client.hot(params);
    case 'search': return client.search(params);
    case 'suggest': return client.suggest(String(params.q || ''), params);
    case 'calendar': return client.calendar(params);
    case 'movie': return client.movie(String(params.slug || ''));
    case 'sources': return client.sources(String(params.slug || ''));
    case 'related': return client.related(String(params.slug || ''));
    case 'comments': return client.comments(String(params.slug || ''), params);
    case 'collections': return client.collections(params);
    case 'collection': return client.collection(String(params.slug || ''), params);
    case 'shares': return client.shares(params);
    case 'share': return client.share(String(params.id || ''));
    case 'requests': return client.requests(params);
    case 'activities': return client.activities(params);
    case 'user': return client.user(String(params.username || ''));
    case 'types': return client.types();
    case 'genres': return client.genres();
    case 'regions': return client.regions();
    default: return client.latest(params);
  }
}
function queryFromUrl(url: URL): DdysQuery { const out: DdysQuery = {}; for (const [key, value] of url.searchParams.entries()) out[key] = value; return out; }
function titleForView(view: DdysViewName) { return ({ movies: 'DDYS Movies', latest: 'DDYS Latest', hot: 'DDYS Hot', search: 'DDYS Search', calendar: 'DDYS Calendar', collections: 'DDYS Collections', shares: 'DDYS Shares', types: 'DDYS Types', genres: 'DDYS Genres', regions: 'DDYS Regions' } as Record<string, string>)[view] || 'DDYS'; }
function pathForView(mountPath: string, view: DdysViewName) { return view === 'latest' ? `${mountPath}/latest` : `${mountPath}/${view}`; }
