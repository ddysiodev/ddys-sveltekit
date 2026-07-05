import { loadDdysView } from 'ddys-sveltekit/server';

export const load = (event) => loadDdysView(event, 'types');
