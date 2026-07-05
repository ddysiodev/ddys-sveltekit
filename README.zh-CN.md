# DDYS API SvelteKit 集成包

[English](README.md)

`ddys-sveltekit` 是低端影视 API 的官方 SvelteKit 集成包，提供 TypeScript API Client、用于 `hooks.server` 的 `createDdysHandle()`、`event.locals.ddys`、服务端 load helpers、Svelte 组件、route handlers、缓存、SEO 路由、诊断和安全求片表单。

## 安装

```bash
npm install ddys-sveltekit
```

```svelte
<script>
  import 'ddys-sveltekit/styles.css';
</script>
```

## 环境变量

```env
DDYS_API_BASE_URL=https://ddys.io/api/v1
DDYS_SITE_BASE_URL=https://ddys.io
DDYS_API_KEY=
DDYS_FORM_SECRET=
DDYS_REQUEST_FORM_ENABLED=false
DDYS_DIAGNOSTICS_ENABLED=false
DDYS_REVALIDATE_TOKEN=
```

`DDYS_API_KEY`、`DDYS_FORM_SECRET`、`DDYS_REVALIDATE_TOKEN` 必须只在服务端使用，不要放进 `PUBLIC_*`。

## hooks.server

```ts
import { createDdysHandle } from 'ddys-sveltekit/server';

export const handle = createDdysHandle();
```

补充 typed locals：

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

SEO：

```ts
export { ddysSitemapGET as GET } from 'ddys-sveltekit/routes';
export { ddysRobotsGET as GET } from 'ddys-sveltekit/routes';
export { ddysManifestGET as GET } from 'ddys-sveltekit/routes';
```

`/api/ddys/proxy` 会先做 allow-list 校验。浏览器只请求本地接口，低端影视 API Key 不会进入浏览器 bundle。
`/api/ddys/revalidate` 必须配置 `DDYS_REVALIDATE_TOKEN`；未配置时接口会返回 403，避免公开清缓存。

## Load Helpers

```ts
import { loadDdysView } from 'ddys-sveltekit/server';

export const load = (event) => loadDdysView(event, 'latest', { limit: 24 });
```

可用 helper：`loadDdysView`、`loadDdysMovie`、`loadDdysSources`、`loadDdysRequestForm`、`loadDdysDiagnostics`。

## 组件

```svelte
<script>
  import { DdysView, DdysSearch, DdysRequestForm } from 'ddys-sveltekit/components';
  export let data;
</script>

<DdysView view="latest" payload={data.payload} routePrefix={data.config.routePrefix} />
<DdysSearch />
<DdysRequestForm token={data.token} />
```

组件包括：`DdysView`、`DdysGrid`、`DdysList`、`DdysCard`、`DdysMovieDetail`、`DdysSources`、`DdysSearch`、`DdysRequestForm`、`DdysDiagnostics`。

示例项目包含 `/ddys`、`/ddys/latest`、`/ddys/hot`、`/ddys/movies`、`/ddys/search`、`/ddys/calendar`、`/ddys/movie/[slug]`、`/ddys/movie/[slug]/sources`、`/ddys/collections`、`/ddys/shares`、`/ddys/types`、`/ddys/genres`、`/ddys/regions`、`/ddys/request`、`/ddys/diagnostics`、`/sitemap.xml`、`/robots.txt`、`/manifest.webmanifest`。

## Clients

```ts
import { createDdysServerClient } from 'ddys-sveltekit/server';
import { DdysProxyClient } from 'ddys-sveltekit/client';
```

服务端 client 覆盖 `movies`、`latest`、`hot`、`search`、`suggest`、`calendar`、`movie`、`sources`、`related`、`comments`、`collections`、`collection`、`shares`、`share`、`requests`、`activities`、`user`、`types`、`genres`、`regions`、`me`、`createRequest`、`createComment`、`deleteComment`、`reportInvalidResource`、`follow`、`unfollow`。`DdysProxyClient` 只调用本地 route handlers。

## 求片表单

配置 `DDYS_API_KEY`、`DDYS_FORM_SECRET`、`DDYS_REQUEST_FORM_ENABLED=true` 后启用。服务端会校验标题、年份、类型、豆瓣 ID、IMDb ID、蜜罐字段、CSRF token 和限流。

```ts
import { createDdysRequestActions } from 'ddys-sveltekit/routes';
import { loadDdysRequestForm } from 'ddys-sveltekit/server';

export const load = loadDdysRequestForm;
export const actions = createDdysRequestActions();
```

## SEO、缓存和 adapter-static

可用 `createDdysSeo`、`createDdysMovieSeo`、`createDdysMovieJsonLd`、`createDdysSitemap`、`createDdysRobotsText`、`createDdysManifest`、`cachedDdys`、`revalidateDdysCache`。完整代理、诊断、求片表单、route handlers 和 `event.locals.ddys` 都需要 SvelteKit 服务端运行时。使用 `adapter-static` 时，请使用预加载数据、公开代理地址，或单独部署 Worker/API proxy。

## 检查

```bash
pnpm typecheck
node tools/check.mjs
node --test tests/structure.test.mjs
pnpm build
pnpm pack --dry-run
powershell -ExecutionPolicy Bypass -File tools/build-package.ps1 -Version 0.1.2
```
