<script lang="ts">
  import { DdysView } from 'ddys-sveltekit/components';
  export let data;
</script>

<svelte:head>
  <title>{data.seo?.title || 'DDYS'}</title>
  {#if data.seo?.description}<meta name="description" content={data.seo.description} />{/if}
</svelte:head>

<DdysView view={data.view} params={data.params} payload={data.payload} routePrefix={data.config.routePrefix} basePath={data.config.sveltekit.mountPath} />
