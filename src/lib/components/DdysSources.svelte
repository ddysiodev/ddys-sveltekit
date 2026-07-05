<script lang="ts">
  import type { DdysSource } from '../types/ddys.js';
  import { sourceLabel } from '../utils/display.js';
  import { isAllowedResourceUrl } from '../utils/security.js';
  export let sources: unknown = [];
  export let emptyText = 'No sources found.';
  export let allowedProtocols = ['http:', 'https:', 'magnet:', 'ed2k:', 'thunder:'];
  $: list = Array.isArray(sources) ? sources as DdysSource[] : sources && typeof sources === 'object' && Array.isArray((sources as { data?: unknown }).data) ? (sources as { data: DdysSource[] }).data : [];
</script>

{#if list.length}
  <div class="ddys-sources">
    {#each list as source}
      {@const label = sourceLabel(source)}
      {@const url = String(source.url || '')}
      <div class="ddys-source">
        <span>{label}</span>
        {#if isAllowedResourceUrl(url, allowedProtocols)}<a href={url} target="_blank" rel="noreferrer">Open</a>{/if}
      </div>
    {/each}
  </div>
{:else}
  <p class="ddys-empty">{emptyText}</p>
{/if}
