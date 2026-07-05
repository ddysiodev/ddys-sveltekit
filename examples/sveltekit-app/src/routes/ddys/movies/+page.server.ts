import { loadDdysView } from 'ddys-sveltekit/server';

export const load = (event) => loadDdysView(event, 'movies', { per_page: 24 });
