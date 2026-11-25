import { api } from '@vibes/api';
import { expect, it, vi } from 'vitest';
import { clientAction } from './clientAction';

it.each([
  { report: {}, expected: {} },
  {
    report: { errorCode: '101', playlistItemId: 'failed-video' },
    expected: { errorCode: '101', playlistItemId: 'failed-video' },
  },
  {
    report: { errorCode: 'soundcloud_error', playlistItemId: 'failed-track' },
    expected: { errorCode: 'soundcloud_error', playlistItemId: 'failed-track' },
  },
  { report: { errorCode: '101' }, expected: {} },
])('forwards a scoped skip error $report', async ({ report, expected }) => {
  const post = vi
    .spyOn(api.v2, 'post')
    .mockResolvedValue([new Error('Request failed'), null]);
  const request = new Request('https://example.test/room', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ intent: 'skip', ...report }),
  });
  await clientAction({
    request,
    params: { id: 'room' },
    signal: request.signal,
    serverAction: async () => {
      throw new Error('Unexpected server action');
    },
  });
  expect(post).toHaveBeenCalledWith(
    '/rooms/{id}/skips',
    { id: 'room' },
    expected,
  );
});
