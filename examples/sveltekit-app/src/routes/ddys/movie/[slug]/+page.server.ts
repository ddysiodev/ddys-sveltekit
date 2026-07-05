import type { PageServerLoad } from './$types';
import { loadDdysMovie } from 'ddys-sveltekit/server';

export const load: PageServerLoad = (event) => loadDdysMovie(event);
