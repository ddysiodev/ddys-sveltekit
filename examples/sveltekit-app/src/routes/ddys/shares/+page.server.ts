import type { PageServerLoad } from './$types';
import { loadDdysView } from 'ddys-sveltekit/server';

export const load: PageServerLoad = (event) => loadDdysView(event, 'shares', { per_page: 24 });
