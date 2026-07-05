import type { RequestHandler } from '@sveltejs/kit';
import type { DdysConfigInput } from '../config.js';
import { revalidateDdysCache } from '../server/cache.js';
import { endpointConfig } from '../server/config.js';

export interface DdysRevalidateHandlerOptions { config?: DdysConfigInput; }
export function createDdysRevalidateHandler(options: DdysRevalidateHandlerOptions = {}): RequestHandler {
  return async (event) => {
    const config = endpointConfig(options.config);
    const input = await event.request.json().catch(() => ({})) as { token?: string; route?: string; tag?: string; path?: string };
    const token = input.token || event.request.headers.get('x-ddys-revalidate-token') || event.url.searchParams.get('token') || '';
    if (!config.revalidateToken) return Response.json({ success: false, message: 'DDYS revalidate token is not configured.' }, { status: 403 });
    if (token !== config.revalidateToken) return Response.json({ success: false, message: 'Invalid DDYS revalidate token.' }, { status: 403 });
    return Response.json(revalidateDdysCache({ route: input.route, tag: input.tag, path: input.path }));
  };
}
export const ddysRevalidatePOST = createDdysRevalidateHandler();
