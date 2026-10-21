import type { RoomMessage } from '@vibes/models';
import { chatMessageMaxLength } from '@vibes/models/limits';
import { type FormEvent, useEffect, useRef, useState } from 'preact/compat';
import { ArrowRightIcon } from '../icons';
import { Button } from './Button';
import { ChatMessageLine } from './ChatMessageLine';

interface ChatConversationProps {
  messages: RoomMessage[];
  onSend: (text: string) => Promise<boolean>;
  error?: string;
  sending?: boolean;
  active: boolean;
  loading?: boolean;
}

export function ChatConversation({
  messages,
  onSend,
  active,
  error,
  sending = false,
  loading = false,
}: ChatConversationProps) {
  const [draft, setDraft] = useState('');
  const nearBottom = useRef(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const conversationRef = useRef<HTMLDivElement>(null);
  const latestMessageId = messages[messages.length - 1]?.id;

  useEffect(() => {
    if (
      !active ||
      !nearBottom.current ||
      !latestMessageId ||
      !conversationRef.current
    )
      return;

    conversationRef.current.scrollTop = conversationRef.current.scrollHeight;
  }, [latestMessageId, active]);

  useEffect(() => {
    if (active) inputRef.current?.focus({ preventScroll: true });
  }, [active]);

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
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-1 pt-1 pb-3 [scrollbar-gutter:stable]"
      >
        <div className="flex min-h-full flex-col justify-end [&>p]:shrink-0">
          {messages.length === 0 && loading && (
            <div className="space-y-3 py-3">
              <div aria-hidden="true" className="space-y-2">
                <div className="h-3 w-40 max-w-full rounded-full bg-theme-surface" />
                <div className="h-3 w-24 rounded-full bg-theme-surface" />
              </div>
              <p role="status" className="text-sm text-theme-muted">
                Connecting to chat…
              </p>
            </div>
          )}
          {messages.length === 0 && !loading && !error && (
            <p className="py-3 text-sm text-theme-muted">
              No recent messages. Say hi to the room!
            </p>
          )}
          {messages.map((message) => (
            <ChatMessageLine key={message.id} message={message} />
          ))}
        </div>
      </div>

      {error && (
        <p role="status" className="py-2 text-sm text-theme-muted">
          {error}
        </p>
      )}
      <form
        onSubmit={sendMessage}
        className="flex shrink-0 items-end gap-2 border-theme border-t bg-theme/90 pt-3 pb-1"
      >
        <label className="min-w-0 flex-1">
          <span className="sr-only">Room message</span>
          <input
            ref={inputRef}
            value={draft}
            onChange={(event) => setDraft(event.currentTarget.value)}
            placeholder="Send a message…"
            maxLength={chatMessageMaxLength}
            className="h-12 w-full rounded-full border border-theme bg-theme-surface px-4 text-base text-theme placeholder:text-theme-muted focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary"
          />
        </label>
        <Button
          type="submit"
          disabled={sending || !draft.trim()}
          size="icon"
          aria-label="Send message"
          className="h-12! w-12!"
        >
          <ArrowRightIcon className="h-5 w-5" />
        </Button>
      </form>
    </div>
  );
}
