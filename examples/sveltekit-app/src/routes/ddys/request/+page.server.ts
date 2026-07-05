import type { Actions, PageServerLoad } from './$types';
import { createDdysRequestActions } from 'ddys-sveltekit/routes';
import { loadDdysRequestForm } from 'ddys-sveltekit/server';

export const load: PageServerLoad = loadDdysRequestForm;
export const actions: Actions = createDdysRequestActions();
