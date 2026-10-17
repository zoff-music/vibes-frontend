import assert from 'node:assert/strict';
import test from 'node:test';
import { createDataRouter } from '@kasperrt/smolter/preact';

test('redirecting fetcher mutations refresh session data without replaying the mutation', async () => {
  let mutations = 0;
  let refreshed = 0;
  let loads = 0;
  const router = createDataRouter(
    [
      {
        path: '/admin',
        loader: () => {
          loads++;

          return { authorized: mutations > 0 };
        },
        action: () => {
          mutations++;

          return new Response(null, {
            status: 303,
            headers: { Location: '/admin' },
          });
        },
      },
    ],
    { url: 'http://localhost/admin' },
  );

  await router.navigate('/admin');
  router.registerRevalidator('root', async () => {
    refreshed++;
  });
  const fetcher = router.createFetcher();
  const initialLoads = loads;

  await fetcher.submit('/admin', new FormData());

  assert.equal(mutations, 1);
  assert.equal(refreshed, 1);
  assert.equal(loads - initialLoads, 1);
  assert.equal(router.getSnapshot().state, 'idle');
  router.dispose();
});
