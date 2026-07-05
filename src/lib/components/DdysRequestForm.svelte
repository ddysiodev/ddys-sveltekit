<script lang="ts">
  export let action = '/api/ddys/request';
  export let token = '';
  export let honeypotField = 'ddys_website';
  export let enabled = true;
  let loading = false;
  let message = '';
  let success = false;
  async function submit(event: SubmitEvent) {
    const form = event.currentTarget as HTMLFormElement;
    event.preventDefault();
    loading = true; message = ''; success = false;
    try {
      const response = await fetch(action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
      const json = await response.json().catch(() => ({}));
      if (!response.ok || json.success === false) throw new Error(json.message || 'DDYS request failed.');
      success = true; message = 'Request submitted.'; form.reset();
    } catch (cause) { message = cause instanceof Error ? cause.message : 'DDYS request failed.'; }
    finally { loading = false; }
  }
</script>

{#if enabled}
  <form class="ddys-request" method="post" action={action} on:submit={submit}>
    <input type="hidden" name="token" value={token} />
    <input type="hidden" name="ddys_token" value={token} />
    <label><span>Title</span><input name="title" required maxlength="120" /></label>
    <label><span>Year</span><input name="year" inputmode="numeric" maxlength="4" /></label>
    <label><span>Type</span><select name="type"><option value="">Any</option><option value="movie">Movie</option><option value="series">Series</option><option value="anime">Anime</option><option value="variety">Variety</option></select></label>
    <label><span>Douban ID</span><input name="douban_id" maxlength="40" /></label>
    <label><span>IMDb ID</span><input name="imdb_id" maxlength="40" /></label>
    <label class="ddys-request__full"><span>Note</span><textarea name="note" rows="4" maxlength="1000"></textarea></label>
    <label class="ddys-request__full"><span>Contact</span><input name="contact" maxlength="200" /></label>
    <input class="ddys-honeypot" name={honeypotField} tabindex="-1" autocomplete="off" />
    <button type="submit" disabled={loading}>{loading ? 'Submitting' : 'Submit request'}</button>
    {#if message}<p class:ddys-success={success} class:ddys-error={!success}>{message}</p>{/if}
  </form>
{:else}
  <p class="ddys-empty">DDYS request form is disabled.</p>
{/if}
