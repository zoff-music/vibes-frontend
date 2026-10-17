import type { LoaderFunctionArgs } from '@kasperrt/smolter/preact';
import { redirectToRoom } from './utils/redirectToRoom';

export function loader(args: LoaderFunctionArgs) {
  return redirectToRoom(args);
}
