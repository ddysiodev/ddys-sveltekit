# DDYS API SvelteKit Integration

[中文](README.zh-CN.md)

`ddys-sveltekit` is the official SvelteKit integration for the DDYS API. It provides a TypeScript API client, `createDdysHandle()` for `hooks.server`, `event.locals.ddys`, server load helpers, Svelte components, route handlers, cache helpers, SEO routes, diagnostics, and a secure request form.

## Install

```bash
npm install ddys-sveltekit
```

```svelte
<script>
  import 'ddys-sveltekit/styles.css';
</script>
```

## Environment Variables

```env
DDYS_API_BASE_URL=https://ddys.io/api/v1
DDYS_SITE_BASE_URL=https://ddys.io
DDYS_API_KEY=
DDYS_FORM_SECRET=
DDYS_REQUEST_FORM_ENABLED=false
DDYS_DIAGNOSTICS_ENABLED=false
DDYS_REVALIDATE_TOKEN=
```

Keep `DDYS_API_KEY`, `DDYS_FORM_SECRET`, and `DDYS_REVALIDATE_TOKEN` server-side. Do not expose them through `PUBLIC_*`.

## hooks.server

```ts
import { createDdysHandle } from 'ddys-sveltekit/server';

export const handle = createDdysHandle();
```

Add typed locals:

```ts
import type { DdysLocals } from 'ddys-sveltekit/server';

declare global {
  namespace App {
    interface Locals extends DdysLocals {}
  }
}

export {};
```

## Route Handlers

```ts
// src/routes/api/ddys/proxy/+server.ts
export { ddysProxyGET as GET } from 'ddys-sveltekit/routes';

// src/routes/api/ddys/request/+server.ts
export { ddysRequestGET as GET, ddysRequestPOST as POST } from 'ddys-sveltekit/routes';

// src/routes/api/ddys/diagnostics/+server.ts
export { ddysDiagnosticsGET as GET, ddysDiagnosticsPOST as POST } from 'ddys-sveltekit/routes';

// src/routes/api/ddys/revalidate/+server.ts
export { ddysRevalidatePOST as POST } from 'ddys-sveltekit/routes';
```

SEO:

```ts
export { ddysSitemapGET as GET } from 'ddys-sveltekit/routes';
export { ddysRobotsGET as GET } from 'ddys-sveltekit/routes';
export { ddysManifestGET as GET } from 'ddys-sveltekit/routes';
```

`/api/ddys/proxy` validates an allow-list before forwarding. Browser code only talks to local endpoints, so the DDYS API key never enters the browser bundle.
`/api/ddys/revalidate` requires `DDYS_REVALIDATE_TOKEN`; without it the endpoint returns 403 instead of exposing public cache invalidation.

## Load Helpers

```ts
import { loadDdysView } from 'ddys-sveltekit/server';

export const load = (event) => loadDdysView(event, 'latest', { limit: 24 });
```

Available helpers: `loadDdysView`, `loadDdysMovie`, `loadDdysSources`, `loadDdysRequestForm`, `loadDdysDiagnostics`.

## Components

```svelte
<script>
  import { DdysView, DdysSearch, DdysRequestForm } from 'ddys-sveltekit/components';
  export let data;
</script>

<DdysView view="latest" payload={data.payload} routePrefix={data.config.routePrefix} />
<DdysSearch />
<DdysRequestForm token={data.token} />
```

Components: `DdysView`, `DdysGrid`, `DdysList`, `DdysCard`, `DdysMovieDetail`, `DdysSources`, `DdysSearch`, `DdysRequestForm`, `DdysDiagnostics`.

The example app includes `/ddys`, `/ddys/latest`, `/ddys/hot`, `/ddys/movies`, `/ddys/search`, `/ddys/calendar`, `/ddys/movie/[slug]`, `/ddys/movie/[slug]/sources`, `/ddys/collections`, `/ddys/shares`, `/ddys/types`, `/ddys/genres`, `/ddys/regions`, `/ddys/request`, `/ddys/diagnostics`, `/sitemap.xml`, `/robots.txt`, and `/manifest.webmanifest`.

## Clients

```ts
import { createDdysServerClient } from 'ddys-sveltekit/server';
import { DdysProxyClient } from 'ddys-sveltekit/client';
```

The server client covers `movies`, `latest`, `hot`, `search`, `suggest`, `calendar`, `movie`, `sources`, `related`, `comments`, `collections`, `collection`, `shares`, `share`, `requests`, `activities`, `user`, `types`, `genres`, `regions`, `me`, `createRequest`, `createComment`, `deleteComment`, `reportInvalidResource`, `follow`, and `unfollow`. `DdysProxyClient` calls local route handlers.

## Request Form

Set `DDYS_API_KEY`, `DDYS_FORM_SECRET`, and `DDYS_REQUEST_FORM_ENABLED=true`. The server validates title, year, type, Douban ID, IMDb ID, honeypot, CSRF token, and rate limit before calling DDYS.

```ts
import { createDdysRequestActions } from 'ddys-sveltekit/routes';
import { loadDdysRequestForm } from 'ddys-sveltekit/server';

export const load = loadDdysRequestForm;
export const actions = createDdysRequestActions();
```

## SEO, Cache, and adapter-static

Use `createDdysSeo`, `createDdysMovieSeo`, `createDdysMovieJsonLd`, `createDdysSitemap`, `createDdysRobotsText`, `createDdysManifest`, `cachedDdys`, and `revalidateDdysCache`. Full proxy, diagnostics, request form, route handlers, and `event.locals.ddys` require a SvelteKit server runtime. With `adapter-static`, use preloaded data, public proxy URLs, or a separately deployed Worker/API proxy.

## Checks

```bash
pnpm typecheck
node tools/check.mjs
node --test tests/structure.test.mjs
pnpm build
pnpm pack --dry-run
powershell -ExecutionPolicy Bypass -File tools/build-package.ps1 -Version 0.1.3
```
