import type { ClientLoaderFunctionArgs } from '@kasperrt/smolter/preact';
import { clientLoader as loadRoom } from '../$id.$/clientLoader';

// A minimized session must refresh its own room, never the current page.
export async function clientLoader(args: ClientLoaderFunctionArgs) {
  const roomId = new URL(args.request.url).searchParams.get('room');
  if (!roomId) throw new Response('Room required', { status: 400 });
  const data = await loadRoom({
    ...args,
    params: { id: roomId },
    reason: 'revalidation',
  });
  if (data instanceof Response) {
    throw new Response('Room no longer available', { status: 404 });
  }
  return data;
}
