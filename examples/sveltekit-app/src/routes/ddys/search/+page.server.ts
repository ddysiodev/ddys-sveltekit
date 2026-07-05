import type { PageServerLoad } from './$types';
import { loadDdysView } from 'ddys-sveltekit/server';

export const load: PageServerLoad = (event) => loadDdysView(event, 'search', { q: event.url.searchParams.get('q') || 'movie', per_page: 12 });
