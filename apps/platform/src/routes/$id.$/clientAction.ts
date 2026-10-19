import type { ClientActionFunctionArgs } from '@kasperrt/smolter/preact';
import { clientAction as submitRoomAction } from './utils/actions/clientAction';

export function clientAction(args: ClientActionFunctionArgs) {
  return submitRoomAction(args);
}
