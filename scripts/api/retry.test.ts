import { emptyObjectSchema } from '@vibes/models';
import { afterEach, expect, test, vi } from 'vitest';
import {
  createRequestClient,
  getHttpError,
} from '../../packages/api/src/client';
import { getRateLimitResponse } from '../../packages/api/src/rateLimit';

const endpoints = {
  '/probe': { get: { response: emptyObjectSchema } },
};

afterEach(() => vi.useRealTimers());

test.each([400, 401, 403, 404, 408, 409, 422, 429, 500, 501, 503, 505])(
  'HTTP %i stops after one attempt and preserves the original response',
  async (status) => {
    const fetcher = vi.fn(async () =>
      Response.json(
        { error: 'failure' },
        {
          status,
          headers: { 'Retry-After': '30' },
        },
      ),
    );
    const client = createRequestClient(
      'https://example.test',
      '/api',
      endpoints,
      { fetcher },
    );
    const [error] = await client.get('/probe', {});
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(getHttpError(error)?.response.status).toBe(status);
    expect(getHttpError(error)?.response.headers.get('Retry-After')).toBe('30');
    const response = getRateLimitResponse([error]);
    if (status === 429) {
      expect(response?.status).toBe(429);
      expect(response?.headers.get('Retry-After')).toBe('30');
      expect(response?.headers.get('Cache-Control')).toBe('no-store');
    } else {
      expect(response).toBeNull();
    }
  },
);

test.each([502, 504])(
  'HTTP %i retries with delay and remains bounded',
  async (status) => {
    vi.useFakeTimers();
    const fetcher = vi.fn(async () => new Response(null, { status }));
    const client = createRequestClient(
      'https://example.test',
      '/api',
      endpoints,
      { fetcher },
    );
    const pending = client.get('/probe', {});
    await vi.advanceTimersByTimeAsync(999);
    expect(fetcher).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(1);
    expect(fetcher).toHaveBeenCalledTimes(2);
    await vi.advanceTimersByTimeAsync(1_000);
    const [error] = await pending;
    expect(fetcher).toHaveBeenCalledTimes(3);
    expect(getHttpError(error)?.response.status).toBe(status);
  },
);

test('a gateway retry stops immediately if the next response is rate-limited', async () => {
  vi.useFakeTimers();
  const fetcher = vi
    .fn()
    .mockResolvedValueOnce(new Response(null, { status: 502 }))
    .mockResolvedValue(
      Response.json(
        { error: 'rate_limit' },
        {
          status: 429,
          headers: { 'Retry-After': '12' },
        },
      ),
    );
  const client = createRequestClient(
    'https://example.test',
    '/api',
    endpoints,
    { fetcher },
  );
  const pending = client.get('/probe', {});
  await vi.advanceTimersByTimeAsync(1_000);
  const [error] = await pending;
  expect(fetcher).toHaveBeenCalledTimes(2);
  expect(getRateLimitResponse([error])?.headers.get('Retry-After')).toBe('12');
});

test('parallel loader failures preserve the longest rate-limit delay', async () => {
  const errors = await Promise.all(
    [5, 30, 10].map(async (delay) => {
      const client = createRequestClient(
        'https://example.test',
        '/api',
        endpoints,
        {
          fetcher: async () =>
            new Response(null, {
              status: 429,
              headers: { 'Retry-After': String(delay) },
            }),
        },
      );
      const [error] = await client.get('/probe', {});
      return error;
    }),
  );
  expect(
    getRateLimitResponse([null, ...errors])?.headers.get('Retry-After'),
  ).toBe('30');
  expect(getRateLimitResponse([null, new Error('network failure')])).toBeNull();
});

test('validation failures do not retry a successful HTTP request', async () => {
  const fetcher = vi.fn(async () => Response.json('invalid response'));
  const client = createRequestClient(
    'https://example.test',
    '/api',
    endpoints,
    { fetcher },
  );
  const [error] = await client.get('/probe', {});
  expect(error).not.toBeNull();
  expect(fetcher).toHaveBeenCalledTimes(1);
});
