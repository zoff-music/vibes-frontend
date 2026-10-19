import assert from 'node:assert/strict';
import test from 'node:test';
import { createDataRouter } from '@kasperrt/smolter/preact';
import {
  recoverDeployment,
  watchDeployment,
} from '@kasperrt/smolter/preact/client';

for (const timing of [
  'fast',
  'delayed',
  'overlapping-errors',
  'navigation',
  'mutation',
  'history',
  'cleanup',
  'reinstall',
  'fetcher',
  'fetcher-fail',
]) {
  test(`redirect recovery after protected work: ${timing}`, async (t) => {
    let dispose = () => {};
    t.after(() => dispose());
    const events = new EventTarget();
    const markers = new Map<string, string>();
    const reloads: string[] = [];
    const globals = {
      window: events,
      location: new URL('http://localhost/admin'),
      sessionStorage: {
        getItem: (key: string) => markers.get(key) ?? null,
        setItem: (key: string, value: string) => markers.set(key, value),
      },
    };
    for (const [key, value] of Object.entries(globals)) {
      const previous = Object.getOwnPropertyDescriptor(globalThis, key);
      Object.defineProperty(globalThis, key, { configurable: true, value });
      t.after(() => {
        if (previous) Object.defineProperty(globalThis, key, previous);
        else Reflect.deleteProperty(globalThis, key);
      });
    }

    let releaseRoot = () => {};
    let releaseManifest = () => {};
    let releaseFetcher = () => {};
    const rootGate = new Promise<void>((resolve) => {
      releaseRoot = resolve;
    });
    const manifestGate = new Promise<void>((resolve) => {
      releaseManifest = resolve;
    });
    const fetcherGate = new Promise<void>((resolve) => {
      releaseFetcher = resolve;
    });
    let mutations = 0;
    let roots = 0;
    let failed = false;
    t.mock.method(globalThis, 'fetch', async () => {
      if (timing === 'delayed') await manifestGate;
      return Response.json({ version: 'new' });
    });
    const router = createDataRouter(
      [
        {
          path: '/admin',
          action: () => {
            mutations++;
            return new Response(null, {
              status: 303,
              headers: { Location: '/admin/users?created=1#user' },
            });
          },
        },
        {
          path: '/admin/users',
          loader: () => {
            // Isolate invalidation of the original failure, not a new failure
            // caused by the newer mutation's route revalidation.
            if (failed && timing === 'mutation') return { ready: true };
            failed = true;
            events.dispatchEvent(new Event('vite:preloadError'));
            if (timing === 'overlapping-errors')
              events.dispatchEvent(new Event('vite:preloadError'));
            return Promise.reject(new TypeError('Missing redirect chunk'));
          },
        },
        { path: '/other', action: () => ({ saved: true }) },
        {
          path: '/pending',
          action: () =>
            fetcherGate.then(() => {
              if (timing === 'fetcher-fail')
                throw new Error('Fixture mutation failure');
              return { saved: true };
            }),
        },
      ],
      { url: globals.location.href },
    );
    router.registerRevalidator('root', async () => {
      roots++;
      await rootGate;
    });
    const options = {
      version: 'old',
      manifestURL: '/smolter-manifest.json',
      reload: (url: URL) => reloads.push(url.href),
    };
    const cleanup = watchDeployment(router, options);
    dispose = () => {
      cleanup();
      router.dispose();
    };
    const pending = timing.startsWith('fetcher')
      ? router.createFetcher().submit('/pending', new FormData())
      : null;
    const submission = router.submit('/admin', new FormData());
    for (let attempt = 0; attempt < 20 && !failed; attempt++)
      await new Promise(setImmediate);
    assert.equal(failed, true);
    await new Promise(setImmediate);
    assert.equal(markers.size, 0);
    assert.deepEqual(reloads, []);

    if (timing === 'navigation') await router.navigate('/other?new=1#intent');
    if (timing === 'history') {
      globals.location.href = 'http://localhost/other?back=1#history';
      events.dispatchEvent(new Event('popstate'));
    }
    if (timing === 'cleanup') cleanup();
    if (timing === 'reinstall') {
      cleanup();
      watchDeployment(router, options);
    }
    const newerMutation =
      timing === 'mutation'
        ? router.createFetcher().submit('/other', new FormData())
        : null;
    releaseRoot();
    await submission;
    if (newerMutation) await newerMutation;
    if (timing === 'delayed') {
      assert.deepEqual(reloads, []);
      releaseManifest();
    }
    if (pending) {
      assert.equal(markers.size, 0);
      assert.deepEqual(reloads, []);
      releaseFetcher();
      await pending;
    }
    await new Promise(setImmediate);
    assert.equal(mutations, 1);
    if (
      timing === 'fast' ||
      timing === 'delayed' ||
      timing === 'overlapping-errors' ||
      timing.startsWith('fetcher')
    ) {
      assert.deepEqual(reloads, [
        'http://localhost/admin/users?created=1#user',
      ]);
      assert.equal(markers.size, 1);
      if (!timing.startsWith('fetcher')) assert.equal(roots, 1);
    } else {
      assert.deepEqual(reloads, []);
      assert.equal(markers.size, 0);
    }
  });
}

for (const change of [
  'unrelated',
  'destination',
  'shared',
  'missing',
  'legacy',
  'chunk',
]) {
  test(`granular manifest recovery: ${change}`, async (t) => {
    let dispose = () => {};
    t.after(() => dispose());
    const events = new EventTarget();
    const storage = new Map<string, string>();
    const reloads: string[] = [];
    const globals = {
      window: events,
      location: new URL('http://localhost/privacy-policy'),
      sessionStorage: {
        getItem: (key: string) => storage.get(key) ?? null,
        setItem: (key: string, value: string) => storage.set(key, value),
      },
    };
    for (const [key, value] of Object.entries(globals)) {
      const descriptor = Object.getOwnPropertyDescriptor(globalThis, key);
      Object.defineProperty(globalThis, key, { configurable: true, value });
      t.after(() => {
        if (descriptor) Object.defineProperty(globalThis, key, descriptor);
        else Reflect.deleteProperty(globalThis, key);
      });
    }
    const fetch = t.mock.method(globalThis, 'fetch', async () =>
      Response.json({
        version: 'new',
        ...(change !== 'legacy' && {
          shared: change === 'shared' ? 'changed' : 'same',
          routes:
            change === 'missing'
              ? []
              : [
                  {
                    path: '/security',
                    fingerprint:
                      change === 'destination' ? 'changed' : 'security',
                  },
                  { path: '/terms-of-service', fingerprint: 'new-terms' },
                ],
        }),
      }),
    );
    const router = createDataRouter(
      [
        {
          path: '/security',
          loader: () => {
            if (change === 'chunk') {
              events.dispatchEvent(new Event('vite:preloadError'));
              return Promise.reject(new TypeError('Fixture missing chunk'));
            }
            return 'ready';
          },
        },
      ],
      { url: globals.location.href },
    );
    watchDeployment(router, {
      version: 'old',
      shared: 'same',
      routes: [
        { path: '/security', fingerprint: 'security' },
        { path: '/terms-of-service', fingerprint: 'old-terms' },
      ],
      manifestURL: '/smolter-manifest.json',
      reload: (destination) => {
        reloads.push(destination.href);
      },
    });
    dispose = () => router.dispose();
    await router.navigate('/security?test=first#scope');
    await new Promise(setImmediate);
    if (change === 'unrelated') {
      assert.deepEqual(reloads, []);
      assert.equal(storage.size, 0);
      await router.navigate('/security?test=second#scope');
      assert.equal(fetch.mock.callCount(), 1);
      assert.equal(
        router.getSnapshot().url,
        'http://localhost/security?test=second#scope',
      );
      return;
    }
    if (change !== 'chunk') {
      assert.deepEqual(reloads, []);
      assert.equal(storage.size, 0);
      await router.navigate('/security?test=next#scope');
    }
    assert.deepEqual(reloads, [
      `http://localhost/security?test=${change === 'chunk' ? 'first' : 'next'}#scope`,
    ]);
    assert.equal(storage.size, 1);
    assert.equal(fetch.mock.callCount(), 1);
  });
}

test('published deployment recovery preserves committed intent without replaying actions', async (t) => {
  let events = new EventTarget();
  const storage = new Map<string, string>();
  const reloads: string[] = [];
  const location = new URL('http://localhost/privacy-policy');
  const options = {
    version: 'consumer-build',
    manifestURL: '/smolter-manifest.json',
    reload: (destination: URL) => reloads.push(destination.href),
  };
  const globals = {
    window: events,
    location,
    sessionStorage: {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value),
    },
  };

  for (const [key, value] of Object.entries(globals)) {
    const previous = Object.getOwnPropertyDescriptor(globalThis, key);
    Object.defineProperty(globalThis, key, { configurable: true, value });
    t.after(() => {
      if (previous) Object.defineProperty(globalThis, key, previous);
      if (!previous) Reflect.deleteProperty(globalThis, key);
    });
  }

  t.beforeEach(() => {
    events = new EventTarget();
    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: events,
    });
  });

  await t.test(
    'idle prefetch leaves marker unused; overlapping navigation keeps newest query and hash',
    async (t) => {
      let completeManifest: (response: Response) => void = () =>
        assert.fail('Manifest promise was not initialized');
      const manifest = new Promise<Response>((resolve) => {
        completeManifest = resolve;
      });
      const fetch = t.mock.method(globalThis, 'fetch', () => manifest);
      const router = createDataRouter(
        [{ path: '/security' }, { path: '/terms-of-service' }],
        { url: location.href },
      );
      watchDeployment(router, options);

      events.dispatchEvent(new Event('vite:preloadError'));
      await new Promise(setImmediate);
      assert.equal(fetch.mock.callCount(), 0);
      assert.equal(storage.size, 0);
      assert.deepEqual(reloads, []);

      const first = router.navigate('/security?audit=first#reporting');
      const second = router.navigate('/terms-of-service?audit=latest#terms');
      await Promise.all([first, second]);
      assert.equal(
        router.getSnapshot().url,
        'http://localhost/terms-of-service?audit=latest#terms',
      );
      assert.deepEqual(reloads, []);
      completeManifest(Response.json({ version: 'next-build' }));
      await new Promise(setImmediate);
      assert.deepEqual(reloads, []);
      await router.navigate('/terms-of-service?audit=recover#terms');
      assert.deepEqual(reloads, [
        'http://localhost/terms-of-service?audit=recover#terms',
      ]);
      assert.equal(fetch.mock.callCount(), 1);
      await router.navigate('/security');
      await new Promise(setImmediate);
      assert.equal(reloads.length, 1);
      router.dispose();
    },
  );

  for (const mode of ['unchanged', 'unavailable', 'offline']) {
    await t.test(`${mode} checks leave recovery available`, async (t) => {
      storage.clear();
      reloads.length = 0;
      let restored = false;
      const fetch = t.mock.method(globalThis, 'fetch', () => {
        if (restored) return Promise.resolve(Response.json({ version: 'new' }));
        if (mode === 'offline') return Promise.reject(new TypeError('offline'));
        if (mode === 'unavailable') {
          return Promise.resolve(new Response(null, { status: 503 }));
        }

        return Promise.resolve(Response.json({ version: options.version }));
      });
      const router = createDataRouter([{ path: '/security' }], {
        url: location.href,
      });
      watchDeployment(router, options);
      events.dispatchEvent(new Event('vite:preloadError'));
      await router.navigate('/security');

      assert.equal(storage.size, 0);
      assert.equal(reloads.length, 0);
      assert.equal(router.getSnapshot().url, 'http://localhost/security');
      restored = true;
      await router.navigate('/security?restored=true#reporting');
      await new Promise(setImmediate);
      assert.deepEqual(reloads, []);
      assert.equal(storage.size, 0);
      assert.equal(fetch.mock.callCount(), 1);
      router.dispose();
    });
  }

  await t.test(
    'active-navigation chunk failure recovers the intended destination',
    async (t) => {
      storage.clear();
      reloads.length = 0;
      let checks = 0;
      t.mock.method(globalThis, 'fetch', async () => {
        checks++;

        return Response.json({
          version: checks === 1 ? options.version : 'new',
        });
      });
      const router = createDataRouter(
        [
          {
            path: '/security',
            loader: () => {
              events.dispatchEvent(new Event('vite:preloadError'));

              return Promise.reject(new TypeError('Missing route chunk'));
            },
          },
        ],
        { url: location.href },
      );
      watchDeployment(router, options);
      await router.navigate('/security?during=true#scope');
      await new Promise(setImmediate);

      assert.equal(checks, 2);
      assert.deepEqual(reloads, [
        'http://localhost/security?during=true#scope',
      ]);
      router.dispose();
    },
  );

  await t.test(
    'initial chunk recovery preserves the full destination and reloads once',
    async (t) => {
      storage.clear();
      reloads.length = 0;
      t.mock.method(globalThis, 'fetch', async () =>
        Response.json({ version: 'new' }),
      );
      const destination = new URL(
        'http://localhost/security?initial=true#report',
      );

      assert.equal(await recoverDeployment(options, destination), true);
      assert.equal(await recoverDeployment(options, destination), false);
      assert.deepEqual(reloads, [destination.href]);
    },
  );

  await t.test(
    'a chunk error during a redirecting mutation never replays that mutation',
    async (t) => {
      storage.clear();
      reloads.length = 0;
      let mutations = 0;
      const fetch = t.mock.method(globalThis, 'fetch', async () =>
        Response.json({ version: 'new' }),
      );
      const router = createDataRouter(
        [
          {
            path: '/admin',
            action: () => {
              mutations++;
              events.dispatchEvent(new Event('vite:preloadError'));

              return new Response(null, {
                status: 303,
                headers: { Location: '/admin/users' },
              });
            },
          },
          { path: '/admin/users', loader: () => ({ authorized: true }) },
        ],
        { url: 'http://localhost/admin' },
      );
      watchDeployment(router, options);
      await router.submit('/admin', new FormData());

      assert.equal(mutations, 1);
      assert.equal(fetch.mock.callCount(), 0);
      assert.equal(reloads.length, 0);
      assert.equal(router.getSnapshot().url, 'http://localhost/admin/users');
      router.dispose();
    },
  );

  await t.test(
    'Forward to the current route cancels a pending Back check',
    async (t) => {
      storage.clear();
      reloads.length = 0;
      let completeManifest: (response: Response) => void = () =>
        assert.fail('Manifest promise was not initialized');
      const manifest = new Promise<Response>((resolve) => {
        completeManifest = resolve;
      });
      t.mock.method(globalThis, 'fetch', () => manifest);
      const router = createDataRouter([{ path: '/privacy-policy' }], {
        url: location.href,
      });
      watchDeployment(router, options);

      location.href = 'http://localhost/security';
      events.dispatchEvent(new Event('popstate'));
      location.href = 'http://localhost/privacy-policy#current';
      events.dispatchEvent(new Event('popstate'));
      completeManifest(Response.json({ version: 'new' }));
      await new Promise(setImmediate);

      assert.equal(reloads.length, 0);
      assert.equal(storage.size, 0);
      router.dispose();
      location.href = 'http://localhost/privacy-policy';
    },
  );

  await t.test(
    'a completed mutation invalidates older pending chunk recovery',
    async (t) => {
      storage.clear();
      reloads.length = 0;
      let checks = 0;
      let mutations = 0;
      let completeManifest: (response: Response) => void = () =>
        assert.fail('Manifest promise was not initialized');
      const manifest = new Promise<Response>((resolve) => {
        completeManifest = resolve;
      });
      t.mock.method(globalThis, 'fetch', () => {
        checks++;
        if (checks === 1)
          return Promise.resolve(Response.json({ version: options.version }));

        return manifest;
      });
      const router = createDataRouter(
        [
          {
            path: '/security',
            loader: () => {
              events.dispatchEvent(new Event('vite:preloadError'));

              return Promise.reject(new TypeError('Missing route chunk'));
            },
          },
          {
            path: '/privacy-policy',
            action: () => {
              mutations++;

              return { saved: true };
            },
          },
        ],
        { url: location.href },
      );
      watchDeployment(router, options);
      await router.navigate('/security');
      await router.submit('/privacy-policy', new FormData());
      completeManifest(Response.json({ version: 'new' }));
      await new Promise(setImmediate);

      assert.equal(mutations, 1);
      assert.equal(reloads.length, 0);
      assert.equal(storage.size, 0);
      router.dispose();
    },
  );

  await t.test(
    'completed independent fetchers invalidate an older chunk recovery check',
    async (t) => {
      storage.clear();
      reloads.length = 0;
      let checks = 0;
      const mutations = [{ count: 0 }, { count: 0 }];
      let completeManifest: (response: Response) => void = () =>
        assert.fail('Manifest promise was not initialized');
      const manifest = new Promise<Response>((resolve) => {
        completeManifest = resolve;
      });
      t.mock.method(globalThis, 'fetch', () => {
        checks++;
        if (checks === 1)
          return Promise.resolve(Response.json({ version: options.version }));

        return manifest;
      });
      const router = createDataRouter(
        [
          {
            path: '/security',
            loader: () => {
              events.dispatchEvent(new Event('vite:preloadError'));

              return Promise.reject(new TypeError('Missing route chunk'));
            },
            shouldRevalidate: () => false,
          },
          ...mutations.map((mutation, index) => ({
            path: `/mutation-${index}`,
            action: () => {
              mutation.count++;

              return { saved: true };
            },
          })),
        ],
        { url: location.href },
      );
      watchDeployment(router, options);
      t.after(() => router.dispose());
      const first = router.createFetcher();
      const second = router.createFetcher();

      await router.navigate('/security');
      await Promise.all([
        first.submit('/mutation-0', new FormData()),
        second.submit('/mutation-1', new FormData()),
      ]);
      completeManifest(Response.json({ version: 'new' }));
      await new Promise(setImmediate);

      assert.deepEqual(
        mutations.map((mutation) => mutation.count),
        [1, 1],
      );
      assert.equal(reloads.length, 0);
      assert.equal(storage.size, 0);
    },
  );

  await t.test(
    'one pending fetcher protects recovery while navigation remains available',
    async (t) => {
      storage.clear();
      reloads.length = 0;
      const mutations: [number, number] = [0, 0];
      let finishSecond: (value: { saved: boolean }) => void = () =>
        assert.fail('Mutation promise was not initialized');
      const pending = new Promise<{ saved: boolean }>((resolve) => {
        finishSecond = resolve;
      });
      t.mock.method(globalThis, 'fetch', async () =>
        Response.json({ version: 'new' }),
      );
      const router = createDataRouter(
        [
          { path: '/security' },
          { path: '/terms-of-service' },
          {
            path: '/mutation-0',
            action: () => {
              mutations[0]++;

              return { saved: true };
            },
          },
          {
            path: '/mutation-1',
            action: () => {
              mutations[1]++;

              return pending;
            },
          },
        ],
        { url: location.href },
      );
      watchDeployment(router, options);
      t.after(() => router.dispose());
      const first = router.createFetcher();
      const second = router.createFetcher();
      const firstSubmission = first.submit('/mutation-0', new FormData());
      const secondSubmission = second.submit('/mutation-1', new FormData());
      await firstSubmission;

      await router.navigate('/security?pending=true#scope');

      assert.equal(
        router.getSnapshot().url,
        'http://localhost/security?pending=true#scope',
      );
      assert.equal(reloads.length, 0);
      assert.equal(storage.size, 0);

      finishSecond({ saved: true });
      await secondSubmission;
      await router.navigate('/terms-of-service?settled=true#terms');

      assert.deepEqual(mutations, [1, 1]);
      assert.deepEqual(reloads, [
        'http://localhost/terms-of-service?settled=true#terms',
      ]);
      assert.equal(storage.size, 1);
    },
  );

  for (const outcome of ['complete', 'fail', 'dispose', 'replace']) {
    await t.test(
      `overlapping submissions retain protection after ${outcome}`,
      async (t) => {
        storage.clear();
        reloads.length = 0;
        const mutations: [number, number, number] = [0, 0, 0];
        let completeFirst: (value: { saved: boolean }) => void = () =>
          assert.fail('Missing first submission');
        let failFirst: (error: Error) => void = () =>
          assert.fail('Missing first submission');
        let completeSecond: (value: { saved: boolean }) => void = () =>
          assert.fail('Missing second submission');
        const firstResult = new Promise<{ saved: boolean }>(
          (resolve, reject) => {
            completeFirst = resolve;
            failFirst = reject;
          },
        );
        const secondResult = new Promise<{ saved: boolean }>((resolve) => {
          completeSecond = resolve;
        });
        t.mock.method(globalThis, 'fetch', async () =>
          Response.json({ version: 'new' }),
        );
        const router = createDataRouter(
          [
            { path: '/security' },
            { path: '/terms-of-service' },
            {
              path: '/page',
              action: () => {
                mutations[2]++;
                return { saved: true };
              },
            },
            {
              path: '/first',
              action: () => {
                mutations[0]++;
                return firstResult;
              },
            },
            {
              path: '/second',
              action: () => {
                mutations[1]++;
                return secondResult;
              },
            },
          ],
          { url: location.href },
        );
        const cleanup = watchDeployment(router, options);
        t.after(() => router.dispose());
        const first = router.createFetcher();
        const second = router.createFetcher();
        const firstSubmission = first.submit('/first', new FormData());
        const secondSubmission = second.submit('/second', new FormData());
        await router.submit('/page', new FormData());

        if (outcome === 'dispose') first.dispose();
        if (outcome === 'replace') {
          watchDeployment(router, options);
          cleanup();
        }

        if (outcome === 'fail')
          failFirst(new Error('Fixture mutation failure'));
        else completeFirst({ saved: true });
        await firstSubmission;
        await router.navigate('/security?pending=true#scope');

        assert.equal(
          router.getSnapshot().url,
          'http://localhost/security?pending=true#scope',
        );
        assert.equal(reloads.length, 0);
        assert.equal(storage.size, 0);

        completeSecond({ saved: true });
        await secondSubmission;
        await router.navigate('/terms-of-service?settled=true#terms');

        assert.deepEqual(mutations, [1, 1, 1]);
        assert.deepEqual(reloads, [
          'http://localhost/terms-of-service?settled=true#terms',
        ]);
        assert.equal(storage.size, 1);
      },
    );
  }

  await t.test(
    'routine navigation finishes before a gated manifest and only later navigation recovers',
    { timeout: 1000 },
    async (t) => {
      storage.clear();
      reloads.length = 0;
      let release: (response: Response) => void = () =>
        assert.fail('Gate not initialized');
      const gate = new Promise<Response>((resolve) => {
        release = resolve;
      });
      let loads = 0;
      const fetch = t.mock.method(globalThis, 'fetch', () => gate);
      const router = createDataRouter(
        [{ path: '/security', loader: () => ++loads }],
        { url: location.href },
      );
      watchDeployment(router, { ...options, timeout: 60000 });
      t.after(() => router.dispose());

      await router.navigate('/security?pending=1#scope');
      assert.equal(loads, 1);
      assert.equal(router.getSnapshot().state, 'idle');
      assert.equal(fetch.mock.callCount(), 1);
      assert.equal(storage.size, 0);
      release(Response.json({ version: 'new' }));
      await new Promise(setImmediate);
      assert.deepEqual(reloads, []);
      await router.navigate('/security?next=1#scope');
      assert.deepEqual(reloads, ['http://localhost/security?next=1#scope']);
      assert.equal(loads, 1);
    },
  );

  await t.test(
    'redirect chunk recovery uses the committed action destination',
    async (t) => {
      storage.clear();
      reloads.length = 0;
      let mutations = 0;
      let roots = 0;
      t.mock.method(globalThis, 'fetch', async () =>
        Response.json({ version: 'new' }),
      );
      const router = createDataRouter(
        [
          {
            path: '/admin',
            action: () => {
              mutations++;

              return new Response(null, {
                status: 303,
                headers: { Location: '/admin/users?created=1#user' },
              });
            },
          },
          {
            path: '/admin/users',
            loader: () => {
              events.dispatchEvent(new Event('vite:preloadError'));

              return Promise.reject(new TypeError('Missing redirect chunk'));
            },
          },
        ],
        { url: 'http://localhost/admin' },
      );
      router.registerRevalidator('root', async () => {
        roots++;
      });
      watchDeployment(router, options);
      await router.submit('/admin', new FormData());
      await new Promise(setImmediate);

      assert.equal(mutations, 1);
      assert.equal(roots, 1);
      assert.deepEqual(reloads, [
        'http://localhost/admin/users?created=1#user',
      ]);
      router.dispose();
    },
  );
});
