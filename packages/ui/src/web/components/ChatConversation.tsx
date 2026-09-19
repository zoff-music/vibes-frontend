import type { RoomMessage } from '@vibes/models';
import { classNames } from '@vibes/shared';
import { type FormEvent, useEffect, useRef, useState } from 'react';
import { chatNameColorIndex, formatChatMessage } from '../../shared/chat';
import { ArrowRightIcon, CrownIcon } from '../icons';
import { Button } from './Button';

const nameColors = [
  'text-sky-300 [.theme-light_&]:text-sky-700',
  'text-violet-300 [.theme-light_&]:text-violet-700',
  'text-amber-200 [.theme-light_&]:text-amber-800',
  'text-emerald-300 [.theme-light_&]:text-emerald-700',
  'text-pink-300 [.theme-light_&]:text-pink-700',
];

interface ChatConversationProps {
  messages: RoomMessage[];
  onSend: (text: string) => Promise<boolean>;
  error?: string;
  sending?: boolean;
  active: boolean;
}

export function ChatConversation({
  messages,
  onSend,
  active,
  error,
  sending = false,
}: ChatConversationProps) {
  const [draft, setDraft] = useState('');
  const nearBottom = useRef(true);
  const conversationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (
      !active ||
      !nearBottom.current ||
      messages.length === 0 ||
      !conversationRef.current
    )
      return;
    conversationRef.current.scrollTop = conversationRef.current.scrollHeight;
  }, [messages.length, active]);

  const sendMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (sending || !draft.trim()) return;
    const sent = await onSend(draft.trim());
    if (sent) setDraft('');
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div
        ref={conversationRef}
        onScroll={(event) => {
          const element = event.currentTarget;
          nearBottom.current =
            element.scrollHeight - element.scrollTop - element.clientHeight <
            80;
        }}
        role="log"
        aria-label="Room conversation"
        aria-live="polite"
        className="min-h-0 flex-1 overflow-y-auto px-1 pt-1 pb-3"
      >
        {messages.length === 0 && (
          <p className="py-3 text-sm text-theme-muted">
            Say hello to the room.
          </p>
        )}
        {messages.map((message) => (
          <p
            key={message.id}
            className="wrap-anywhere py-1 text-base text-theme leading-6"
          >
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
            <span className="text-theme-muted">
              {message.kind !== 'chat' ? ' ' : ': '}
            </span>
            <span
              className={classNames(
                message.kind !== 'chat' && 'text-theme-muted',
              )}
            >
              {formatChatMessage(message)}
            </span>
          </p>
        ))}
      </div>

      {error && (
        <p role="status" className="py-2 text-sm text-theme-muted">
          {error}
        </p>
      )}
      <form
        onSubmit={sendMessage}
        className="flex shrink-0 items-end gap-2 border-theme border-t bg-theme/90 pt-4 pb-1"
      >
        <label className="min-w-0 flex-1">
          <span className="sr-only">Room message</span>
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Send a message…"
            maxLength={500}
            className="h-12 w-full rounded-xl border border-theme bg-theme-surface px-4 text-sm text-theme placeholder:text-theme-muted focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary"
          />
        </label>
        <Button
          type="submit"
          disabled={sending || !draft.trim()}
          size="icon"
          aria-label="Send message"
          className="h-12! w-12! rounded-xl"
        >
          <ArrowRightIcon className="h-5 w-5" />
        </Button>
      </form>
    </div>
  );
}
