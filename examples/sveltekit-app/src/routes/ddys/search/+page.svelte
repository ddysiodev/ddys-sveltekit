<script lang="ts">
  import { DdysSearch, DdysView } from 'ddys-sveltekit/components';
  export let data;
</script>

<DdysSearch routePrefix={data.config.routePrefix} basePath={data.config.sveltekit.mountPath} initialQuery={data.params.q} />
<DdysView view="search" params={data.params} payload={data.payload} routePrefix={data.config.routePrefix} basePath={data.config.sveltekit.mountPath} />
