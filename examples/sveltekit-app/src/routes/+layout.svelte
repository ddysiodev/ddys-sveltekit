<script lang="ts">
  import 'ddys-sveltekit/styles.css';
</script>

<nav>
  <a href="/ddys">DDYS</a>
  <a href="/ddys/latest">Latest</a>
  <a href="/ddys/hot">Hot</a>
  <a href="/ddys/search">Search</a>
  <a href="/ddys/request">Request</a>
</nav>

<main><slot /></main>

<style>
  nav{display:flex;gap:12px;flex-wrap:wrap;padding:16px;border-bottom:1px solid #e2e8f0;font-family:system-ui,sans-serif}
  nav a{color:#0f766e;font-weight:700;text-decoration:none}
  main{max-width:1120px;margin:0 auto;padding:24px 16px}
</style>
