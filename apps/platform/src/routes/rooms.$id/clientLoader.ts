import type { ClientLoaderFunctionArgs } from '@kasperrt/smolter/preact';
import { redirectToRoom } from './utils/redirectToRoom';

export function clientLoader(args: ClientLoaderFunctionArgs) {
  return redirectToRoom(args);
}
