import assert from 'node:assert/strict';
import test from 'node:test';
import { createDataRouter } from '@kasperrt/smolter/preact';
import { lazyRoute } from '@kasperrt/smolter/preact/lazy-route';

for (const failure of ['synchronous', 'asynchronous']) {
  for (const submission of ['page', 'fetcher']) {
    test(`${submission} ${failure} failure releases prefetch protection`, async (t) => {
      let reads = 0;
      let actions = 0;
      const router = createDataRouter(
        [
          { path: '/target', loader: () => ++reads },
          {
            path: '/save',
            action: () => {
              actions++;
              const error = new Error('Fixture submission failure');
              if (failure === 'synchronous') throw error;
              return Promise.reject(error);
            },
          },
        ],
        { url: 'http://localhost/' },
      );
      t.after(() => router.dispose());
      const submitter = submission === 'page' ? router : router.createFetcher();
      await submitter.submit('/save', new FormData());
      await router.prefetch('/target');
      assert.equal(reads, 1);
      await router.navigate('/target');
      assert.equal(reads, 1);
      assert.equal(actions, 1);
    });
  }
}

test('a failed lazy import can retry on a later navigation', async (t) => {
  let imports = 0;
  const route = lazyRoute({ path: '/target' }, async () => {
    imports++;
    if (imports === 1) throw new TypeError('Fixture missing dynamic import');
    return { clientLoader: () => 'ready' };
  });
  const router = createDataRouter([route], { url: 'http://localhost/' });
  t.after(() => router.dispose());
  await router.navigate('/target');
  assert.equal(imports, 1);
  await router.navigate('/target');
  assert.equal(imports, 2);
  assert.equal(router.getSnapshot().data, 'ready');
  assert.equal(router.getSnapshot().error, undefined);
  assert.equal(router.getSnapshot().url, 'http://localhost/target');
});

test('lazy module preparation failure does not poison later retries', async (t) => {
  let imports = 0;
  const route = lazyRoute({ path: '/target' }, async () => {
    imports++;
    return {
      get clientLoader() {
        if (imports === 1)
          throw new Error('Fixture module preparation failure');
        return () => 'ready';
      },
    };
  });
  const router = createDataRouter([route], { url: 'http://localhost/' });
  t.after(() => router.dispose());
  await router.navigate('/target');
  assert.equal(imports, 1);
  await router.navigate('/target');
  assert.equal(imports, 2);
  assert.equal(router.getSnapshot().data, 'ready');
  assert.equal(router.getSnapshot().error, undefined);
  assert.equal(router.getSnapshot().url, 'http://localhost/target');
});

test('prefetch reads once, preserves query keys, and is consumed once', async () => {
  const reads: string[] = [];
  let roots = 0;
  let actions = 0;
  const router = createDataRouter(
    [
      {
        path: '/rooms/:id',
        loader: ({ request, reason }) => {
          reads.push(`${reason}:${new URL(request.url).search}`);
          return { count: reads.length };
        },
        action: () => {
          actions++;
          return null;
        },
      },
    ],
    { url: 'http://localhost/' },
  );
  router.registerRevalidator('root', () => {
    roots++;
  });
  await Promise.all([
    router.prefetch('/rooms/audit?tag=a&tag=b#first'),
    router.prefetch('/rooms/audit?tag=a&tag=b#second'),
  ]);
  assert.deepEqual(reads, ['prefetch:?tag=a&tag=b']);
  assert.equal(router.getSnapshot().url, 'http://localhost/');
  assert.equal(roots, 0);
  assert.equal(actions, 0);
  await router.navigate('/rooms/audit?tag=a&tag=b#second');
  assert.equal(reads.length, 1);
  assert.equal(
    router.getSnapshot().url,
    'http://localhost/rooms/audit?tag=a&tag=b#second',
  );
  await router.navigate('/rooms/audit?tag=a&tag=b');
  assert.equal(reads.length, 2);
  router.dispose();
});

for (const operation of ['mutation', 'fetcher', 'revalidation']) {
  test(`${operation} invalidates prefetched route data`, async () => {
    let reads = 0;
    let actions = 0;
    const router = createDataRouter(
      [
        { path: '/target', loader: () => ++reads },
        { path: '/save', action: () => ++actions },
      ],
      { url: 'http://localhost/' },
    );
    await router.prefetch('/target');
    if (operation === 'mutation') await router.submit('/save', new FormData());
    if (operation === 'fetcher')
      await router.createFetcher().submit('/save', new FormData());
    if (operation === 'revalidation') await router.revalidate();
    await router.navigate('/target');
    assert.equal(reads, 2);
    assert.equal(actions, operation === 'revalidation' ? 0 : 1);
    router.dispose();
  });
}

for (const outcome of ['error', 'redirect']) {
  test(`speculative ${outcome} does not navigate and retries on click`, async () => {
    let reads = 0;
    const router = createDataRouter(
      [
        {
          path: '/target',
          loader: () => {
            reads++;
            if (reads > 1) return 'ready';
            if (outcome === 'error') throw new Error('Fixture failure');
            return new Response(null, {
              status: 302,
              headers: { Location: '/login' },
            });
          },
        },
        { path: '/login' },
      ],
      { url: 'http://localhost/' },
    );
    await router.prefetch('/target');
    assert.equal(router.getSnapshot().url, 'http://localhost/');
    await router.navigate('/target');
    assert.equal(reads, 2);
    assert.equal(router.getSnapshot().url, 'http://localhost/target');
    router.dispose();
  });
}

test('prefetch is bounded to sixteen URLs and expires after thirty seconds', async (t) => {
  let now = 1_000;
  t.mock.method(Date, 'now', () => now);
  let reads = 0;
  const router = createDataRouter(
    [{ path: '/rooms/:id', loader: () => ++reads }],
    { url: 'http://localhost/' },
  );
  for (let index = 0; index < 17; index++)
    await router.prefetch(`/rooms/${index}`);
  await router.navigate('/rooms/0');
  assert.equal(reads, 18);
  await router.navigate('/rooms/16');
  assert.equal(reads, 18);
  now += 30_001;
  await router.navigate('/rooms/15');
  assert.equal(reads, 19);
  router.dispose();
});

test('disposing the router aborts a pending speculative read', async () => {
  let signal: AbortSignal | undefined;
  const router = createDataRouter(
    [
      {
        path: '/target',
        loader: (args) => {
          signal = args.request.signal;
          return new Promise(() => {});
        },
      },
    ],
    { url: 'http://localhost/' },
  );
  const pending = router.prefetch('/target');
  await new Promise(setImmediate);
  router.dispose();
  await pending;
  assert.equal(signal?.aborted, true);
});
