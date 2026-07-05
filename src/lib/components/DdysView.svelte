<script lang="ts">
  import { onMount } from 'svelte';
  import { DdysProxyClient } from '../client/proxy-client.js';
  import type { DdysQuery, DdysViewName } from '../types/ddys.js';
  import DdysGrid from './DdysGrid.svelte';
  import DdysList from './DdysList.svelte';
  import DdysMovieDetail from './DdysMovieDetail.svelte';
  import DdysSources from './DdysSources.svelte';
  export let view: DdysViewName = 'latest';
  export let params: DdysQuery = {};
  export let payload: unknown = undefined;
  export let routePrefix = '/api/ddys';
  export let basePath = '/ddys';
  export let autoload = true;
  let loading = false;
  let error = '';
  let data = payload;
  $: data = payload ?? data;
  onMount(async () => {
    if (!autoload || payload !== undefined) return;
    loading = true;
    error = '';
    try { data = await new DdysProxyClient(routePrefix).data(view, params); }
    catch (cause) { error = cause instanceof Error ? cause.message : 'DDYS request failed.'; }
    finally { loading = false; }
  });
</script>

<section class="ddys-view" data-view={view}>
  {#if loading}<p class="ddys-state">Loading DDYS data...</p>
  {:else if error}<p class="ddys-error">{error}</p>
  {:else if view === 'movie'}<DdysMovieDetail movie={data as never} />
  {:else if view === 'sources'}<DdysSources sources={data} />
  {:else if ['calendar', 'collections', 'collection', 'shares', 'share', 'requests', 'activities', 'user', 'types', 'genres', 'regions'].includes(view)}<DdysList items={data} />
  {:else}<DdysGrid items={data} {basePath} />{/if}
</section>
