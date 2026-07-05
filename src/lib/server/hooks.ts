import type { Handle, RequestEvent, ResolveOptions } from '@sveltejs/kit';
import type { DdysClient } from '../client/client.js';
import type { DdysConfig, DdysConfigInput } from '../config.js';
import { createDdysServerClient } from './client.js';
import { getDdysConfig } from './config.js';

export interface DdysLocals { ddys: DdysClient; ddysConfig: DdysConfig; }
export interface DdysHandleOptions { config?: DdysConfigInput; resolveOptions?: ResolveOptions; beforeResolve?: (event: RequestEvent, locals: DdysLocals) => void | Promise<void>; }

export function createDdysHandle(options: DdysHandleOptions = {}): Handle {
  return async ({ event, resolve }) => {
    const config = getDdysConfig(options.config);
    const ddys = createDdysServerClient(event, config);
    const locals = event.locals as Record<string, unknown>;
    locals.ddys = ddys;
    locals.ddysConfig = config;
    await options.beforeResolve?.(event, { ddys, ddysConfig: config });
    return resolve(event, options.resolveOptions);
  };
}
