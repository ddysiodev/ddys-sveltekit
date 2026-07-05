<script lang="ts">
  import { DdysProxyClient } from '../client/proxy-client.js';
  import type { DdysMovie } from '../types/ddys.js';
  import { listFromPayload } from '../utils/display.js';
  import DdysGrid from './DdysGrid.svelte';
  export let routePrefix = '/api/ddys';
  export let basePath = '/ddys';
  export let initialQuery = '';
  export let placeholder = 'Search DDYS';
  let q = initialQuery;
  let loading = false;
  let error = '';
  let payload: unknown = [];
  async function submit() {
    const query = q.trim();
    if (!query) return;
    loading = true;
    error = '';
    try { payload = await new DdysProxyClient(routePrefix).search({ q: query, per_page: 12 }); }
    catch (cause) { error = cause instanceof Error ? cause.message : 'DDYS search failed.'; }
    finally { loading = false; }
  }
  $: results = listFromPayload<DdysMovie>(payload);
</script>

<div class="ddys-search">
  <form class="ddys-search__form" on:submit|preventDefault={submit}>
    <input bind:value={q} name="q" {placeholder} autocomplete="off" />
    <button type="submit" disabled={loading}>{loading ? 'Searching' : 'Search'}</button>
  </form>
  {#if error}<p class="ddys-error">{error}</p>
  {:else if results.length}<DdysGrid items={results} {basePath} />{/if}
</div>
