<script lang="ts">
  import { DdysSources } from 'ddys-sveltekit/components';
  export let data;
</script>

<DdysSources sources={data.sources} />
