import type { PageServerLoad } from './$types';
import { loadDdysDiagnostics } from 'ddys-sveltekit/server';

export const load: PageServerLoad = loadDdysDiagnostics;
