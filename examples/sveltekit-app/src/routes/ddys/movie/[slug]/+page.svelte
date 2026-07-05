<script lang="ts">
  import { DdysMovieDetail } from 'ddys-sveltekit/components';
  export let data;
</script>

<svelte:head>
  <title>{data.seo?.title || 'DDYS Movie'}</title>
  {#if data.jsonLd}<script type="application/ld+json">{JSON.stringify(data.jsonLd)}</script>{/if}
</svelte:head>

<DdysMovieDetail movie={data.movie} />
<p><a href={`/ddys/movie/${encodeURIComponent(data.slug)}/sources`}>Sources</a></p>
