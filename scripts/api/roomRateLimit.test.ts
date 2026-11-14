import { emptyObjectSchema } from '@vibes/models';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { api, createRequestClient } from '../../packages/api/src/client';

const mocks = vi.hoisted(() => ({
  room: vi.fn(),
  items: vi.fn(),
  providers: vi.fn(),
}));

vi.mock('../../apps/platform/src/http.server', () => ({
  getServerApi: () => ({
    get: mocks.providers,
    v2: { get: mocks.room },
    v3: { get: mocks.items },
  }),
}));
vi.mock('../../apps/platform/src/routes/$id.$/utils/roomPanel', () => ({
  roomPanel: () => '',
  getRetainedRoomData: () => undefined,
  loadRoomPanel: async () => {},
}));
vi.mock('../../apps/platform/src/routes/$id.$/components/RoomView', () => ({}));

const { loader } = await import('../../apps/platform/src/routes/$id.$/loader');
const { clientLoader } = await import(
  '../../apps/platform/src/routes/$id.$/clientLoader'
);

afterEach(() => vi.restoreAllMocks());

beforeEach(() => {
  mocks.room
    .mockReset()
    .mockResolvedValue([null, { id: 'example', roomType: 'MUSIC' }]);
  mocks.items
    .mockReset()
    .mockResolvedValue([null, { data: [], total: 0, count: 0 }]);
  mocks.providers.mockReset().mockResolvedValue([null, ['youtube']]);
  vi.spyOn(api.v2, 'get').mockImplementation(mocks.room);
  vi.spyOn(api.v3, 'get').mockImplementation(mocks.items);
  vi.spyOn(api, 'get').mockImplementation(mocks.providers);
});

test.each(['navigation', 'revalidation'] as const)(
  'client %s reads the playlist only once',
  async (reason) => {
    await clientLoader({
      request: new Request('https://example.test/example'),
      params: { id: 'example' },
      reason,
    });
    expect(mocks.items).toHaveBeenCalledTimes(1);
  },
);

test.each(['room', 'playlist', 'playback', 'providers'])(
  '%s rate limiting returns 429 and Retry-After from the room loader',
  async (source) => {
    const client = createRequestClient(
      'https://example.test',
      '/api',
      {
        '/probe': { get: { response: emptyObjectSchema } },
      },
      {
        fetcher: async () =>
          new Response(null, { status: 429, headers: { 'Retry-After': '15' } }),
      },
    );
    const failure = await client.get('/probe', {});
    if (source === 'room') mocks.room.mockResolvedValueOnce(failure);
    if (source === 'playback')
      mocks.room
        .mockResolvedValueOnce([null, { id: 'example' }])
        .mockResolvedValueOnce(failure);
    if (source === 'providers') mocks.providers.mockResolvedValueOnce(failure);
    if (source === 'playlist') mocks.items.mockResolvedValueOnce(failure);

    const response = await loader({
      request: new Request('https://example.test/example'),
      params: { id: 'example' },
    }).then(
      () => null,
      (error: unknown) => error,
    );
    expect(response).toBeInstanceOf(Response);
    if (!(response instanceof Response)) return;
    expect(response.status).toBe(429);
    expect(response.headers.get('Retry-After')).toBe('15');
  },
);

test('a non-rate-limit playlist failure remains a 503', async () => {
  mocks.items.mockResolvedValueOnce([new Error('network failure'), null]);
  await expect(
    loader({
      request: new Request('https://example.test/example'),
      params: { id: 'example' },
    }),
  ).rejects.toMatchObject({ status: 503 });
});

test('room rendering reads the playlist only once', async () => {
  await loader({
    request: new Request('https://example.test/example'),
    params: { id: 'example' },
  });
  expect(mocks.items).toHaveBeenCalledTimes(1);
  expect(mocks.items).toHaveBeenCalledWith(
    '/rooms/{id}/items',
    {
      id: 'example',
      $search: { from: 1, to: 12, excludeCurrent: true },
    },
    expect.objectContaining({ signal: expect.any(AbortSignal) }),
  );
});
