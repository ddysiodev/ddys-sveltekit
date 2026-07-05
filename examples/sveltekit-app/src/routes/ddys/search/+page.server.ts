import { loadDdysView } from 'ddys-sveltekit/server';

export const load = (event) => loadDdysView(event, 'search', { q: event.url.searchParams.get('q') || 'movie', per_page: 12 });
