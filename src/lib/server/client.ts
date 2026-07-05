import type { RequestEvent, ServerLoadEvent } from '@sveltejs/kit';
import { DdysClient } from '../client/client.js';
import type { DdysConfigInput } from '../config.js';
import { getDdysConfig } from './config.js';

export function createDdysServerClient(event?: RequestEvent | ServerLoadEvent | DdysConfigInput, input?: DdysConfigInput): DdysClient {
  const configInput = isSvelteKitEvent(event) ? input : event;
  const fetcher = isSvelteKitEvent(event) ? event.fetch : fetch;
  return new DdysClient(getDdysConfig(configInput), fetcher);
}

function isSvelteKitEvent(value: unknown): value is RequestEvent | ServerLoadEvent {
  return Boolean(value && typeof value === 'object' && 'fetch' in value && 'url' in value);
}
