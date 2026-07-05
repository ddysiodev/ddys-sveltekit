import type { PageServerLoad } from './$types';
import { loadDdysView } from 'ddys-sveltekit/server';

export const load: PageServerLoad = (event) => loadDdysView(event, 'movies', { per_page: 24 });
