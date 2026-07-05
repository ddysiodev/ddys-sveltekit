import { promises as fs } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const failures = [];
const requiredFiles = [
  'README.md','README.zh-CN.md','LICENSE','.gitignore','.env.example','svelte.config.example.js','svelte.config.js','package.json','tsconfig.json',
  'src/lib/index.ts','src/lib/config.ts','src/lib/types/ddys.ts','src/lib/utils/security.ts','src/lib/utils/display.ts',
  'src/lib/client/client.ts','src/lib/client/error.ts','src/lib/client/index.ts','src/lib/client/proxy-client.ts',
  'src/lib/server/index.ts','src/lib/server/cache.ts','src/lib/server/client.ts','src/lib/server/config.ts','src/lib/server/hooks.ts','src/lib/server/load.ts','src/lib/server/request-service.ts','src/lib/server/seo.ts',
  'src/lib/routes/index.ts','src/lib/routes/proxy.ts','src/lib/routes/request.ts','src/lib/routes/diagnostics.ts','src/lib/routes/revalidate.ts','src/lib/routes/seo.ts',
  'src/lib/components/DdysCard.svelte','src/lib/components/DdysGrid.svelte','src/lib/components/DdysList.svelte','src/lib/components/DdysMovieDetail.svelte','src/lib/components/DdysSources.svelte','src/lib/components/DdysView.svelte','src/lib/components/DdysSearch.svelte','src/lib/components/DdysRequestForm.svelte','src/lib/components/DdysDiagnostics.svelte','src/lib/components/index.ts','src/lib/styles/ddys.css',
  'examples/sveltekit-app/.npmignore','examples/sveltekit-app/src/app.html',
  'examples/sveltekit-app/src/routes/ddys/movies/+page.server.ts','examples/sveltekit-app/src/routes/ddys/calendar/+page.server.ts','examples/sveltekit-app/src/routes/ddys/collections/+page.server.ts','examples/sveltekit-app/src/routes/ddys/shares/+page.server.ts','examples/sveltekit-app/src/routes/ddys/types/+page.server.ts','examples/sveltekit-app/src/routes/ddys/genres/+page.server.ts','examples/sveltekit-app/src/routes/ddys/regions/+page.server.ts',
  'public/images/icon-16.png','public/images/icon-32.png','public/images/icon-192.png','public/images/icon-512.png','public/images/logo.png','tests/structure.test.mjs','tests/runtime.test.mjs','tools/build-package.ps1','tools/check.mjs'
];
const clientMethods = ['movies','latest','hot','search','suggest','calendar','movie','sources','related','comments','collections','collection','shares','share','requests','activities','user','types','genres','regions','me','createRequest','createComment','deleteComment','reportInvalidResource','follow','unfollow'];

for (const file of requiredFiles) await mustExist(file);
await checkEncoding();
await checkPackage();
await checkText();
await checkAssets();
await checkForbiddenFiles();
if (failures.length) { console.error(failures.map((x) => `- ${x}`).join('\n')); process.exit(1); }
console.log(JSON.stringify({ ok: true, files: (await listFiles(root)).length, clientMethods: clientMethods.length }, null, 2));

async function checkPackage() {
  const pkg = JSON.parse(await read('package.json'));
  assert(pkg.name === 'ddys-sveltekit', 'package name mismatch.');
  assert(pkg.exports?.['./styles.css'] === './dist/styles/ddys.css', 'styles export mismatch.');
  assert(pkg.peerDependencies?.['@sveltejs/kit'] && pkg.peerDependencies?.svelte, 'missing peer dependencies.');
  assert(pkg.scripts?.build === 'svelte-package', 'build script must use svelte-package.');
  assert((await read('src/lib/config.ts')).includes(`DDYS_SVELTEKIT_VERSION = '${pkg.version}'`), 'runtime version must match package.json.');
  assert((await read('tools/build-package.ps1')).includes(`$Version = "${pkg.version}"`), 'release package script default version must match package.json.');
  const exampleIgnore = await read('examples/sveltekit-app/.npmignore');
  for (const fragment of ['node_modules', '.svelte-kit', 'pnpm-lock.yaml', '*.tgz', '*.zip']) assert(exampleIgnore.includes(fragment), `example npmignore missing ${fragment}.`);
}
async function checkText() {
  const client = await read('src/lib/client/client.ts');
  for (const method of clientMethods) assert(client.includes(`${method}(`), `DdysClient missing ${method}.`);
  const exampleServerLoads = (await listFiles(path.join(root, 'examples/sveltekit-app/src/routes')))
    .filter((file) => slash(path.relative(root, file)).endsWith('+page.server.ts'));
  for (const file of exampleServerLoads) {
    const rel = slash(path.relative(root, file));
    const text = await fs.readFile(file, 'utf8');
    assert(text.includes("import type {") && text.includes("from './$types'"), `${rel} must import generated SvelteKit route types.`);
    assert(text.includes('PageServerLoad'), `${rel} must annotate load with PageServerLoad.`);
  }
  for (const fragment of ['createDdysHandle','event.locals','loadDdysView','createDdysRequestActions','ddysProxyGET','ddysDiagnosticsGET','ddysRevalidatePOST','createDdysSitemap','DDYS_API_KEY','adapter-static','DdysList','/ddys/calendar','/ddys/collections','/ddys/regions']) {
    const found = (await Promise.all((await listFiles(root)).filter((f) => isTextFile(slash(path.relative(root, f)))).map((f) => fs.readFile(f, 'utf8')))).some((text) => text.includes(fragment));
    assert(found, `missing required fragment ${fragment}.`);
  }
}
async function checkAssets() {
  for (const [rel, size] of Object.entries({'public/images/icon-16.png':[16,16],'public/images/icon-32.png':[32,32],'public/images/icon-192.png':[192,192],'public/images/icon-512.png':[512,512],'public/images/logo.png':[512,512]})) {
    const actual = await pngSize(rel);
    assert(actual[0] === size[0] && actual[1] === size[1], `${rel} must be ${size[0]}x${size[1]}.`);
  }
}
async function checkEncoding() {
  for (const full of await listFiles(root)) {
    const rel = slash(path.relative(root, full));
    if (!isTextFile(rel)) continue;
    const buffer = await fs.readFile(full);
    assert(!(buffer[0] === 0xef && buffer[1] === 0xbb && buffer[2] === 0xbf), `${rel} has BOM.`);
    assert(!buffer.toString('utf8').includes('\uFFFD'), `${rel} has replacement char.`);
  }
}
async function checkForbiddenFiles() {
  for (const full of await listFiles(root)) {
    const rel = slash(path.relative(root, full));
    assert(rel === '.env.example' || !/(^|\/)(\.env|\.env\..*|node_modules|\.svelte-kit|\.vercel|\.netlify|coverage|dist|package)(\/|$)/.test(rel), `forbidden path: ${rel}`);
    assert(rel !== 'pnpm-lock.yaml', 'pnpm-lock.yaml must not remain.');
    assert(!/\.(log|bak|tmp|cache|tgz)$/i.test(rel), `forbidden file: ${rel}`);
  }
}
async function mustExist(rel) { try { await fs.stat(path.join(root, rel)); } catch { failures.push(`Missing required file: ${rel}`); } }
async function read(rel) { return fs.readFile(path.join(root, rel), 'utf8'); }
async function listFiles(dir) { const entries = await fs.readdir(dir, { withFileTypes: true }); const out = []; for (const entry of entries) { if (['.git','dist','node_modules','.svelte-kit','.vercel','.netlify','coverage','package'].includes(entry.name) || entry.name === 'pnpm-lock.yaml') continue; const full = path.join(dir, entry.name); if (entry.isDirectory()) out.push(...await listFiles(full)); else out.push(full); } return out; }
async function pngSize(rel) { const buffer = await fs.readFile(path.join(root, rel)); assert(buffer.readUInt32BE(0) === 0x89504e47, `${rel} is not PNG.`); return [buffer.readUInt32BE(16), buffer.readUInt32BE(20)]; }
function isTextFile(rel) { return /\.(ts|svelte|js|mjs|json|css|md|txt|ps1)$/i.test(rel) || rel === '.gitignore' || rel === 'LICENSE' || rel === '.env.example'; }
function slash(value) { return value.replace(/\\/g, '/'); }
function assert(condition, message) { if (!condition) failures.push(message); }
