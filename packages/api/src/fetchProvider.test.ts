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

for (const failure of [false, true]) {
  test(`SSE setup skips all lifecycle callbacks (failure=${failure})`, async () => {
    let lifecycleCalls = 0;
    const Provider = createApiFetchProvider(
      {
        beforeRequest(request) {
          lifecycleCalls += 1;
          return request;
        },
        afterResponse() {
          lifecycleCalls += 1;
        },
        afterError() {
          lifecycleCalls += 1;
        },
        afterRequest() {
          lifecycleCalls += 1;
        },
      },
      () =>
        failure
          ? Promise.reject(new Error('connection failed'))
          : Promise.resolve(
              new Response(null, {
                headers: { 'Content-Type': 'text/event-stream' },
              }),
            ),
      ['/api/v3/rooms/{id}/events'],
    );
    const client = new Provider('https://example.test/api/v3', {});
    // The same fetch provider is called again for every reconnect.
    for (let attempt = 0; attempt < 2; attempt += 1) {
      const [error] = await client.get('rooms/example/events', {
        headers: { Accept: 'text/event-stream' },
      });
      assert.equal(error !== null, failure);
    }
    assert.equal(lifecycleCalls, 0);
  });
}
