import { createDdysRequestActions } from 'ddys-sveltekit/routes';
import { loadDdysRequestForm } from 'ddys-sveltekit/server';

export const load = loadDdysRequestForm;
export const actions = createDdysRequestActions();
