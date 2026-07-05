import type { DdysClient } from '../client/client.js';
import type { DdysConfig } from '../config.js';
import type { DdysMovie } from '../types/ddys.js';
import { listFromPayload, movieDescription, moviePoster, movieSlug, movieTitle } from '../utils/display.js';

export interface DdysSeoInput { title?: string; description?: string; path?: string; image?: string; type?: string; }
export interface DdysSitemapOptions { limit?: number; includeDictionaries?: boolean; }

export function createDdysSeo(config: DdysConfig, input: DdysSeoInput = {}) {
  const url = new URL(input.path || config.sveltekit.mountPath, config.siteBaseUrl).toString();
  const title = input.title || 'DDYS';
  const description = input.description || 'DDYS movies and video resources.';
  const image = input.image || new URL(`${config.iconBasePath}/logo.png`, config.siteBaseUrl).toString();
  return { title, description, canonical: url, openGraph: { title, description, url, image, type: input.type || 'website' }, twitter: { card: 'summary_large_image', title, description, image } };
}

export function createDdysMovieSeo(config: DdysConfig, movie: DdysMovie) {
  return createDdysSeo(config, { title: `${movieTitle(movie)} - DDYS`, description: movieDescription(movie), path: `${config.sveltekit.mountPath}/movie/${movieSlug(movie)}`, image: moviePoster(movie, new URL(`${config.iconBasePath}/logo.png`, config.siteBaseUrl).toString()), type: 'video.movie' });
}

export function createDdysMovieJsonLd(config: DdysConfig, movie: DdysMovie) {
  return stripEmpty({ '@context': 'https://schema.org', '@type': 'Movie', name: movieTitle(movie), description: movieDescription(movie), image: moviePoster(movie, new URL(`${config.iconBasePath}/logo.png`, config.siteBaseUrl).toString()), url: new URL(`${config.sveltekit.mountPath}/movie/${movieSlug(movie)}`, config.siteBaseUrl).toString(), datePublished: movie.year ? String(movie.year) : undefined, genre: Array.isArray(movie.genre) ? movie.genre.join(', ') : movie.genre, countryOfOrigin: Array.isArray(movie.region) ? movie.region.join(', ') : movie.region, aggregateRating: movie.rating ? { '@type': 'AggregateRating', ratingValue: String(movie.rating), bestRating: '10' } : undefined });
}

export async function createDdysSitemap(client: DdysClient, config: DdysConfig, options: DdysSitemapOptions = {}) {
  const urls = new Set<string>([config.sveltekit.mountPath, `${config.sveltekit.mountPath}/latest`, `${config.sveltekit.mountPath}/hot`, `${config.sveltekit.mountPath}/movies`, `${config.sveltekit.mountPath}/search`, `${config.sveltekit.mountPath}/calendar`, `${config.sveltekit.mountPath}/collections`, `${config.sveltekit.mountPath}/shares`, `${config.sveltekit.mountPath}/request`]);
  if (options.includeDictionaries !== false) for (const path of ['types', 'genres', 'regions']) urls.add(`${config.sveltekit.mountPath}/${path}`);
  try {
    const latest = await client.latest({ limit: options.limit || 50 });
    for (const movie of listFromPayload<DdysMovie>(latest)) { const slug = movieSlug(movie); if (slug) urls.add(`${config.sveltekit.mountPath}/movie/${slug}`); }
  } catch {}
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${Array.from(urls).map((path) => `  <url><loc>${escapeXml(new URL(path, config.siteBaseUrl).toString())}</loc></url>`).join('\n')}\n</urlset>\n`;
}

export function createDdysRobotsText(config: DdysConfig) { return `User-agent: *\nAllow: ${config.sveltekit.mountPath}/\nDisallow: ${config.routePrefix}/\nSitemap: ${new URL('/sitemap.xml', config.siteBaseUrl).toString()}\n`; }
export function createDdysManifest(config: DdysConfig) { return { name: 'DDYS', short_name: 'DDYS', start_url: config.sveltekit.mountPath, scope: config.sveltekit.mountPath, display: 'standalone', theme_color: '#121827', background_color: '#ffffff', icons: [{ src: `${config.iconBasePath}/icon-192.png`, sizes: '192x192', type: 'image/png' }, { src: `${config.iconBasePath}/icon-512.png`, sizes: '512x512', type: 'image/png' }] }; }
function escapeXml(value: string) { return value.replace(/[<>&'"]/g, (char) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[char] || char)); }
function stripEmpty(input: Record<string, unknown>) { return Object.fromEntries(Object.entries(input).filter(([, value]) => value !== undefined && value !== null && value !== '')); }
