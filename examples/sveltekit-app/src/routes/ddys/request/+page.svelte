<script lang="ts">
  import { DdysRequestForm } from 'ddys-sveltekit/components';
  export let data;
</script>

<DdysRequestForm token={data.token} enabled={data.config.requestForm.enabled} honeypotField={data.config.requestForm.honeypotField} action="/api/ddys/request" />
