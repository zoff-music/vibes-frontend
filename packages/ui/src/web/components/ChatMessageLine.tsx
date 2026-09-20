import type { RoomMessage } from '@vibes/models';
import { classNames } from '@vibes/shared';
import {
  chatNameColorIndex,
  formatChatMessage,
  formatChatTime,
} from '../../shared/chat';
import { CrownIcon } from '../icons';

const nameColors = [
  'text-sky-300 [.theme-light_&]:text-sky-700',
  'text-violet-300 [.theme-light_&]:text-violet-700',
  'text-amber-200 [.theme-light_&]:text-amber-800',
  'text-emerald-300 [.theme-light_&]:text-emerald-700',
  'text-pink-300 [.theme-light_&]:text-pink-700',
];

interface ChatMessageLineProps {
  message: RoomMessage;
}

export function ChatMessageLine({ message }: ChatMessageLineProps) {
  const activity = message.kind !== 'chat' || message.activity === true;
  const separator = activity ? ' ' : ': ';

  return (
    <p className="wrap-anywhere py-1 text-base text-theme leading-6">
      <time
        dateTime={new Date(message.createdAt).toISOString()}
        className="mr-2 text-theme-subtle text-xs tabular-nums"
      >
        {formatChatTime(message.createdAt)}
      </time>
      {message.isAdmin && (
        <span
          title="Room admin"
          className="mr-1 inline-block align-middle text-primary"
        >
          <span className="sr-only">Room admin </span>
          <CrownIcon aria-hidden="true" className="h-4 w-4" />
        </span>
      )}
      <span
        className={classNames(
          'font-bold',
          nameColors[chatNameColorIndex(message.userId)],
        )}
      >
        {message.name}
      </span>
      <span className="text-theme-muted">{separator}</span>
      <span className={classNames(activity && 'text-theme-muted')}>
        {formatChatMessage(message)}
      </span>
    </p>
  );
}
