<script lang="ts">
  import type { DdysMovie } from '../types/ddys.js';
  import { listFromPayload } from '../utils/display.js';
  import DdysCard from './DdysCard.svelte';
  export let items: unknown = [];
  export let basePath = '/ddys';
  export let emptyText = 'No DDYS movies found.';
  $: movies = listFromPayload<DdysMovie>(items);
</script>

{#if movies.length}
  <div class="ddys-grid">
    {#each movies as movie}
      <DdysCard {movie} {basePath} />
    {/each}
  </div>
{:else}
  <p class="ddys-empty">{emptyText}</p>
{/if}
