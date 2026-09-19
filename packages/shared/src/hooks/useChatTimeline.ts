import type { RoomMessage } from '@vibes/models';
import { useCallback, useEffect, useRef, useState } from 'react';

const retainedMessageLimit = 500;
const rememberedMessageLimit = 1000;

export function useChatTimeline(roomId: string, enabled: boolean) {
  const [messages, setMessages] = useState<RoomMessage[]>([]);
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const seen = useRef(new Set<string>());
  const joinedAt = useRef(Date.now());
  useEffect(() => {
    setMessages([]);
    setUnread(0);
    setOpen(false);
    seen.current.clear();
    joinedAt.current = enabled && roomId ? Date.now() : 0;
  }, [roomId, enabled]);
  const receive = useCallback(
    (message: RoomMessage) => {
      if (!enabled || seen.current.has(message.id)) return;
      seen.current.add(message.id);
      if (seen.current.size > rememberedMessageLimit) {
        const oldest = seen.current.values().next().value;
        if (oldest) seen.current.delete(oldest);
      }
      setMessages((current) =>
        [...current, message].slice(-retainedMessageLimit),
      );
      if (!open && message.createdAt > joinedAt.current)
        setUnread((count) => Math.min(count + 1, retainedMessageLimit));
    },
    [enabled, open],
  );
  const selectChat = useCallback((next: boolean) => {
    setOpen(next);
    if (next) setUnread(0);
  }, []);
  return { messages, open: open && enabled, unread, receive, selectChat };
}
