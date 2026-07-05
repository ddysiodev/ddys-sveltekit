<script lang="ts">
  import { onMount } from 'svelte';
  export let endpoint = '/api/ddys/diagnostics';
  export let autoload = true;
  let loading = false;
  let error = '';
  let data: unknown = null;
  async function load() {
    loading = true; error = '';
    try {
      const response = await fetch(endpoint, { headers: { Accept: 'application/json' } });
      const json = await response.json().catch(() => ({}));
      if (!response.ok || json.success === false) throw new Error(json.message || 'DDYS diagnostics failed.');
      data = json.data ?? json;
    } catch (cause) { error = cause instanceof Error ? cause.message : 'DDYS diagnostics failed.'; }
    finally { loading = false; }
  }
  onMount(() => { if (autoload) void load(); });
</script>

<section class="ddys-diagnostics">
  <button type="button" on:click={load} disabled={loading}>{loading ? 'Checking' : 'Run diagnostics'}</button>
  {#if error}<p class="ddys-error">{error}</p>
  {:else if data}<pre>{JSON.stringify(data, null, 2)}</pre>{/if}
</section>
