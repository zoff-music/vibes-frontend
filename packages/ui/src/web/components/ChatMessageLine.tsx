import type { RoomMessage } from '@vibes/models';
import { classNames } from '@vibes/shared';
import { formatChatMessage, formatChatTime } from '../../shared/chat';
import { chatNameColor } from '../chat';
import { CrownIcon, RemoteIcon } from '../icons';
import { Tooltip } from './Tooltip';

interface ChatMessageLineProps {
  message: RoomMessage;
}

export function ChatMessageLine({ message }: ChatMessageLineProps) {
  const activity = message.kind !== 'chat' || message.activity === true;
  const separator = activity ? ' ' : ': ';
  const crownLabel = message.isModerator ? 'Moderator' : 'Room admin';

  return (
    <p className="text-theme py-1 text-base leading-6 wrap-anywhere">
      <time
        dateTime={new Date(message.createdAt).toISOString()}
        className="text-theme-subtle mr-2 text-xs tabular-nums"
      >
        {formatChatTime(message.createdAt)}
      </time>
      {(message.isAdmin || message.isModerator) && (
        <Tooltip
          content={crownLabel}
          className={classNames(
            'mr-1 inline-block align-middle',
            message.isModerator
              ? 'text-amber-300 [.theme-light_&]:text-amber-700'
              : 'text-primary',
          )}
        >
          <button
            type="button"
            aria-label={crownLabel}
            className="block rounded-sm focus-visible:outline-2 focus-visible:outline-current"
          >
            <CrownIcon aria-hidden="true" className="h-4 w-4" />
          </button>
        </Tooltip>
      )}
      {message.isHost && (
        <span
          title="Room host"
          className="text-secondary mr-1 inline-block align-middle"
        >
          <span className="sr-only">Room host </span>
          <RemoteIcon aria-hidden="true" className="h-4 w-4" />
        </span>
      )}
      <span className={classNames('font-bold', chatNameColor(message.userId))}>
        {message.name}
      </span>
      <span className="text-theme-muted">{separator}</span>
      <span className={classNames(activity && 'text-theme-muted')}>
        {formatChatMessage(message)}
      </span>
    </p>
  );
}
