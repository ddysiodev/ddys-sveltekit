import { configFromEnv, safeDdysConfig, type DdysConfig, type DdysConfigInput } from '../config.js';

let overrideOptions: DdysConfigInput = {};

export function setDdysSvelteKitOptions(options: DdysConfigInput = {}) { overrideOptions = options; }
export function getDdysConfig(input: DdysConfigInput = {}): DdysConfig {
  return configFromEnv({ ...overrideOptions, ...input, cache: { ...overrideOptions.cache, ...input.cache }, proxy: { ...overrideOptions.proxy, ...input.proxy }, requestForm: { ...overrideOptions.requestForm, ...input.requestForm }, diagnostics: { ...overrideOptions.diagnostics, ...input.diagnostics }, security: { ...overrideOptions.security, ...input.security }, sveltekit: { ...overrideOptions.sveltekit, ...input.sveltekit } });
}
export function endpointConfig(options?: DdysConfigInput): DdysConfig { return getDdysConfig(options); }
export { safeDdysConfig };
