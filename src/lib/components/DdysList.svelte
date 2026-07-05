<script lang="ts">
  import { listFromPayload } from '../utils/display.js';

  export let items: unknown = [];
  export let emptyText = 'No DDYS items found.';

  $: list = listFromPayload<Record<string, unknown>>(items);

  function titleFor(item: Record<string, unknown>): string {
    return String(item.title || item.name || item.label || item.slug || item.id || 'Untitled');
  }

  function descriptionFor(item: Record<string, unknown>): string {
    return String(item.description || item.summary || item.content || item.note || '').replace(/\s+/g, ' ').trim();
  }

  function metaFor(item: Record<string, unknown>): string[] {
    return ['type', 'genre', 'region', 'year', 'count', 'updated_at']
      .flatMap((key) => item[key] === undefined || item[key] === null || item[key] === '' ? [] : [Array.isArray(item[key]) ? (item[key] as unknown[]).join(', ') : String(item[key])])
      .slice(0, 4);
  }
</script>

{#if list.length}
  <div class="ddys-list">
    {#each list as item}
      {@const title = titleFor(item)}
      {@const description = descriptionFor(item)}
      {@const meta = metaFor(item)}
      <article class="ddys-list__item">
        <h2>{title}</h2>
        {#if meta.length}
          <div class="ddys-list__meta">
            {#each meta as value}<span>{value}</span>{/each}
          </div>
        {/if}
        {#if description}<p>{description}</p>{/if}
      </article>
    {/each}
  </div>
{:else}
  <p class="ddys-empty">{emptyText}</p>
{/if}
