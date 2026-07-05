import type { PageServerLoad } from './$types';
import { loadDdysSources } from 'ddys-sveltekit/server';

export const load: PageServerLoad = (event) => loadDdysSources(event);
