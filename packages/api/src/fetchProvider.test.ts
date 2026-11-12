import assert from 'node:assert/strict';
import test from 'node:test';
import { createApiFetchProvider, headApiUrl } from './fetchProvider.ts';

for (const scenario of [
  { path: 'rooms/first-room', route: '/api/v2/rooms/{id}' },
  { path: 'rooms/second-room?search=private', route: '/api/v2/rooms/{id}' },
  { path: 'rooms/suggestions', route: '/api/v2/rooms/suggestions' },
  { path: 'unknown/private-id', route: undefined },
]) {
  test(`request telemetry uses route metadata for ${scenario.path}`, async () => {
    let observedRoute: string | undefined;
    const Provider = createApiFetchProvider(
      {
        beforeRequest(request, route) {
          observedRoute = route;
          return request;
        },
      },
      async () => Response.json({ ok: true }),
      ['/api/v2/rooms/{id}', '/api/v2/rooms/suggestions'],
    );
    const client = new Provider('https://example.test/api/v2', {});
    const [error, response] = await client.get(scenario.path, {});
    assert.equal(error, null);
    assert.equal(response?.status, 200);
    assert.equal(observedRoute, scenario.route);
  });
}

test('HEAD probes retain their operation template', async () => {
  let observedRoute: string | undefined;
  const [error, exists] = await headApiUrl(
    'https://example.test/api/v1/rooms/private-room',
    {},
    {
      beforeRequest(request, route) {
        observedRoute = route;
        return request;
      },
    },
    async () => new Response(null, { status: 200 }),
    '/api/v1/rooms/{id}',
  );
  assert.equal(error, null);
  assert.equal(exists, true);
  assert.equal(observedRoute, '/api/v1/rooms/{id}');
});
