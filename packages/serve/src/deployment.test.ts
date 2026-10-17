import assert from 'node:assert/strict';
import test from 'node:test';
import { createDataRouter } from '@kasperrt/smolter/preact';
import {
  recoverDeployment,
  watchDeployment,
} from '@kasperrt/smolter/preact/client';

test('published deployment recovery preserves committed intent without replaying actions', async (t) => {
  const events = new EventTarget();
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
      completeManifest(Response.json({ version: 'next-build' }));
      await Promise.all([first, second]);

      assert.deepEqual(reloads, [
        'http://localhost/terms-of-service?audit=latest#terms',
      ]);
      assert.equal(fetch.mock.callCount(), 1);
      await router.navigate('/security');
      assert.equal(reloads.length, 1);
      router.dispose();
    },
  );

  for (const mode of ['unchanged', 'unavailable', 'offline']) {
    await t.test(`${mode} checks leave recovery available`, async (t) => {
      storage.clear();
      reloads.length = 0;
      let restored = false;
      t.mock.method(globalThis, 'fetch', () => {
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
      assert.deepEqual(reloads, [
        'http://localhost/security?restored=true#reporting',
      ]);
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
