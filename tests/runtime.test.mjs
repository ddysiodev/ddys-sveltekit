import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';

const root = process.cwd();

test('runtime version matches package version', async () => {
  const pkg = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));
  const { DDYS_SVELTEKIT_VERSION } = await import('../dist/config.js');
  assert.equal(DDYS_SVELTEKIT_VERSION, pkg.version);
});

test('request tokens support IPv6 identities and invalid local input does not consume rate limit', async () => {
  const { DEFAULT_DDYS_CONFIG } = await import('../dist/config.js');
  const { createRequestFormToken, submitDdysRequest, verifyRequestFormToken } = await import('../dist/server/request-service.js');
  const config = {
    ...DEFAULT_DDYS_CONFIG,
    apiKey: 'test-api-key',
    requestForm: {
      ...DEFAULT_DDYS_CONFIG.requestForm,
      enabled: true,
      secret: 'test-form-secret',
      rateLimitSeconds: 60
    }
  };
  const identity = `2001:db8::${Date.now()}`;
  const invalidToken = await createRequestFormToken(config, identity);
  assert.equal(await verifyRequestFormToken(config, invalidToken, identity), true);
  const legacyIdentity = `127.0.0.${Date.now() % 255}`;
  const legacyExpires = Math.floor(Date.now() / 1000) + config.requestForm.tokenTtlSeconds;
  const legacyPayload = `${legacyIdentity}:${legacyExpires}`;
  const key = await globalThis.crypto.subtle.importKey('raw', new TextEncoder().encode(config.requestForm.secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const legacySignature = Array.from(new Uint8Array(await globalThis.crypto.subtle.sign('HMAC', key, new TextEncoder().encode(legacyPayload)))).map((byte) => byte.toString(16).padStart(2, '0')).join('');
  assert.equal(await verifyRequestFormToken(config, `${legacyPayload}:${legacySignature}`, legacyIdentity), true);
  await assert.rejects(
    submitDdysRequest(config, { title: '', token: invalidToken }, { identity }),
    /Title must be between 1 and 120 characters/
  );

  let calls = 0;
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => {
    calls++;
    return new Response(JSON.stringify({ success: true, data: { id: 1 } }), { status: 200, headers: { 'content-type': 'application/json' } });
  };
  try {
    const validToken = await createRequestFormToken(config, identity);
    const result = await submitDdysRequest(config, { title: 'A real movie', year: '2024', token: validToken }, { identity });
    assert.deepEqual(result, { id: 1 });
    assert.equal(calls, 1);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('revalidate route requires a configured token', async () => {
  const { createDdysRevalidateHandler } = await import('../dist/routes/revalidate.js');
  const noTokenHandler = createDdysRevalidateHandler({ config: { revalidateToken: '' } });
  const missingConfig = await noTokenHandler(eventFor({}));
  assert.equal(missingConfig.status, 403);

  const handler = createDdysRevalidateHandler({ config: { revalidateToken: 'secret' } });
  const rejected = await handler(eventFor({ token: 'wrong' }));
  assert.equal(rejected.status, 403);

  const accepted = await handler(eventFor({ token: 'secret' }));
  assert.equal(accepted.status, 200);
  assert.equal((await accepted.json()).success, true);
});

function eventFor(body) {
  return {
    request: new Request('https://example.test/api/ddys/revalidate', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body)
    }),
    url: new URL('https://example.test/api/ddys/revalidate')
  };
}
