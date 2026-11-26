import { once } from 'node:events';
import { createServer, type ServerResponse } from 'node:http';
import { expect, test } from 'vitest';
import { createApiClientWithBaseUrl, getHttpError } from '../src/client';
import { getRequestErrorMessage } from '../src/rateLimit';
import { createProviderSearchRequest } from '../src/requests/providerRequests';

test('provider search preserves a streamed quota response through wiretyped', async ({
  onTestFinished,
}) => {
  const message = 'Zoff has reached its daily YouTube search limit.';
  let finishBody: ServerResponse | undefined;
  const server = createServer((_request, response) => {
    response.writeHead(503, { 'Content-Type': 'application/json' });
    response.flushHeaders();
    finishBody = response;
  });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  onTestFinished(() => {
    server.closeAllConnections();
    server.close();
  });
  const address = server.address();
  if (!address || typeof address === 'string')
    throw new Error('Expected TCP address');
  const client = createApiClientWithBaseUrl(`http://127.0.0.1:${address.port}`);
  const search = createProviderSearchRequest(client);
  const [error] = await search('room', 'youtube', 'disco');
  expect(error).toBeInstanceOf(Error);
  finishBody?.end(
    JSON.stringify({
      namespace: 'vibes-backend',
      error: 'youtube_search_quota_exhausted',
      message,
      propagate: true,
    }),
  );
  expect(getHttpError(error)?.response.status).toBe(503);
  expect(await getRequestErrorMessage(error, 'Something went wrong')).toBe(
    message,
  );
});

test.each(['youtube', 'soundcloud'] as const)(
  'every %s search reaches the backend',
  async (provider) => {
    let requests = 0;
    const client = createApiClientWithBaseUrl('https://example.test', {
      fetcher: async () => {
        requests += 1;
        return Response.json([]);
      },
    });
    const search = createProviderSearchRequest(client);
    await Promise.all([
      search('room', provider, 'disco'),
      search('room', provider, 'disco'),
    ]);
    await search('room', provider, 'disco');
    expect(requests).toBe(3);
  },
);
