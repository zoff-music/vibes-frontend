import type { ClientActionFunctionArgs } from '@kasperrt/smolter/preact';
import { submitRoomAction } from '../../utils/room-actions/submitRoomAction';

export function clientAction(args: ClientActionFunctionArgs) {
  return submitRoomAction(args);
}
