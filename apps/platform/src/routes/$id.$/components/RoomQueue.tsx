import { Link, useFetcher } from '@kasperrt/smolter/preact';
import { useRoomMessages } from '@vibes/api';
import { type PlaybackStateV2, type PlaylistItem } from '@vibes/models';
import {
  classNames,
  showToast,
  useChatTimeline,
  usePlaybackStore,
  useQueueStore,
  useRoomStore,
} from '@vibes/shared';
import { useChatPreferenceStore } from '@vibes/shared/chatPreferenceStore';
import { NowPlayingPlaylistItem, QueueList } from '@vibes/ui/web';
import { domMax, LazyMotion, m as motion } from 'framer-motion';
import React, {
  lazy,
  Suspense,
  useEffect,
  useRef,
  useState,
} from 'preact/compat';
import { useRoomPanel } from '../hooks/useRoomPanel';

import type { RoomActionData } from '../utils/actions/clientAction';
import { PlaybackProgress } from './PlaybackProgress';

const LazyChatConversation = lazy(async () => {
  const module = await import('@vibes/ui/web/components/ChatConversation');

  return {
    default: module.ChatConversation,
  };
});

interface RoomQueueProps {
  roomId: string;
  chatOpen: boolean;
  isSSR: boolean;
  addPlaylistItemHref: string;
  isAdmin?: boolean;
  initialPlayback?: PlaybackStateV2;
  initialPlaylistItems?: PlaylistItem[];
  initialQueuedPlaylistItemCount?: number;
}

export const RoomQueue: React.FC<RoomQueueProps> = React.memo(
  ({
    roomId,
    chatOpen,
    isSSR,
    addPlaylistItemHref,
    isAdmin,
    initialPlayback,
    initialPlaylistItems,
    initialQueuedPlaylistItemCount,
  }: RoomQueueProps) => {
    const { href } = useRoomPanel();
    const chatPreference = useChatPreferenceStore((state) => state.enabled);
    // An explicit chat URL selects its surface during SSR and the first render.
    // The stored preference controls discovery, not an already-selected route.
    const chatEnabled = chatOpen || chatPreference;
    const chat = useChatTimeline(roomId, chatEnabled);
    useEffect(() => {
      chat.selectChat(chatOpen && chatEnabled);
    }, [chatOpen, chat.selectChat, chatEnabled]);
    const [chatError, setChatError] = useState('');
    const chatFetcher = useFetcher<RoomActionData>();
    const pendingSend = useRef<((sent: boolean) => void) | null>(null);
    useRoomMessages(!isSSR && chatEnabled ? roomId : undefined, {
      onMessage: chat.receive,
      onError: (error) => setChatError(error ? 'Chat is reconnecting…' : ''),
    });
    useEffect(() => {
      if (chatFetcher.state !== 'idle' || !chatFetcher.data) return;

      pendingSend.current?.(!chatFetcher.data.error);
      pendingSend.current = null;
    }, [chatFetcher.state, chatFetcher.data]);
    useEffect(() => () => pendingSend.current?.(false), []);
    const sendMessage = (text: string) =>
      new Promise<boolean>((resolve) => {
        pendingSend.current = resolve;
        void chatFetcher.submit(
          {
            intent: 'sendMessage',
            text,
          },
          {
            encType: 'application/json',
            method: 'post',
          },
        );
      });
    /* 1. Hooks */
    const voteFetcher = useFetcher<RoomActionData>();
    const removeFetcher = useFetcher<RoomActionData>();
    const playlistItems = useQueueStore((state) => state.playlistItems);
    const isHost = useRoomStore((state) =>
      Boolean(
        state.room?.mode === 'host' &&
          state.room.userId &&
          state.room.hostId === state.room.userId,
      ),
    );
    const [votingPlaylistItemId, setVotingPlaylistItemId] = useState<
      string | null
    >(null);

    // Granular store subscriptions
    const isPlayingFromStore = usePlaybackStore((state) => state.isPlaying);

    /* 2. State & Computed */
    const isPlaying = isSSR
      ? (initialPlayback?.isPlaying ?? false)
      : isPlayingFromStore;
    const displayPlaylistItems = isSSR
      ? (initialPlaylistItems ?? [])
      : playlistItems;

    const currentPlaylistItemFromStore = usePlaybackStore(
      (state) => state.currentPlaylistItem,
    );
    const currentPlaylistItemData = isSSR
      ? initialPlayback?.currentPlaylistItem
      : currentPlaylistItemFromStore;
    const visibleQueuedPlaylistItemCount = displayPlaylistItems.reduce(
      (count, playlistItem) =>
        count + Number(playlistItem.id !== currentPlaylistItemData?.id),
      0,
    );
    const queuedPlaylistItemCount =
      initialQueuedPlaylistItemCount ?? visibleQueuedPlaylistItemCount;

    /* 3. Handlers */
    const handleVote = React.useCallback(
      (playlistItemId: string) => {
        if (votingPlaylistItemId) {
          return;
        }

        setVotingPlaylistItemId(playlistItemId);
        voteFetcher.submit(
          {
            intent: 'votePlaylistItem',
            playlistItemId,
          },
          {
            encType: 'application/json',
            method: 'post',
          },
        );
      },
      [voteFetcher, votingPlaylistItemId],
    );

    const handleRemove = React.useCallback(
      (playlistItemId: string) => {
        removeFetcher.submit(
          {
            intent: 'removePlaylistItem',
            playlistItemId,
          },
          {
            encType: 'application/json',
            method: 'post',
          },
        );
      },
      [removeFetcher],
    );

    useEffect(() => {
      if (
        voteFetcher.state !== 'idle' ||
        !voteFetcher.data ||
        !votingPlaylistItemId
      ) {
        return;
      }

      if (voteFetcher.data.error) {
        showToast(voteFetcher.data.error, 'error');
        setVotingPlaylistItemId(null);

        return;
      }

      showToast('Vote added. Queue updated.', 'success');
      setVotingPlaylistItemId(null);
    }, [voteFetcher.data, voteFetcher.state, votingPlaylistItemId]);

    return (
      <LazyMotion features={domMax}>
        <div className="mt-6 flex min-h-0 min-w-0 flex-col lg:col-span-2 lg:mt-0 lg:h-full">
          <div className="relative flex min-h-0 flex-1 flex-col">
            {/* Now Playing (Integrated into list style) */}
            {currentPlaylistItemData && (
              <div className="mb-2 shrink-0">
                <NowPlayingPlaylistItem
                  isHost={isHost}
                  playlistItem={currentPlaylistItemData}
                  isPlaying={isPlaying}
                />

                <PlaybackProgress
                  durationMs={currentPlaylistItemData.duration * 1000}
                  isSSR={isSSR}
                />
              </div>
            )}

            {/* Up Next List */}
            <div className="flex min-h-0 flex-1 flex-col">
              <div className="mb-3 flex shrink-0 items-center justify-between border-theme border-b">
                {!chatEnabled && (
                  <h2 className="py-4 font-display text-2xs text-theme-muted tracking-label">
                    Up next ({queuedPlaylistItemCount})
                  </h2>
                )}
                {chatEnabled && <h2 className="sr-only">Queue and chat</h2>}
                {chatEnabled && (
                  <Link
                    {...(!chatOpen && { 'aria-current': 'page' })}
                    to={href('', false)}
                    replace
                    preventScrollReset
                    viewTransition={false}
                    prefetch="intent"
                    prefetchData
                    className={classNames(
                      'inline-flex min-h-12 cursor-pointer items-center border-b-2 px-1 font-display text-2xs tracking-label focus-visible:outline-2 focus-visible:outline-secondary',
                      !chatOpen
                        ? 'border-secondary text-theme'
                        : 'border-transparent text-theme-muted',
                    )}
                  >
                    Up next ({queuedPlaylistItemCount})
                  </Link>
                )}
                {chatEnabled && (
                  <Link
                    {...(chatOpen && { 'aria-current': 'page' })}
                    to={href('chat')}
                    replace
                    preventScrollReset
                    viewTransition={false}
                    prefetch="intent"
                    prefetchData
                    className={classNames(
                      'inline-flex min-h-12 cursor-pointer items-center border-b-2 px-1 font-display text-2xs tracking-label focus-visible:outline-2 focus-visible:outline-secondary',
                      chatOpen
                        ? 'border-secondary text-theme'
                        : 'border-transparent text-theme-muted',
                    )}
                  >
                    {chat.unread > 0 ? `Chat (${chat.unread})` : 'Chat'}
                  </Link>
                )}
              </div>
              <div
                className={classNames(
                  'min-h-0 lg:flex lg:flex-1 lg:flex-col',
                  chatOpen && 'flex h-96 flex-col lg:h-auto lg:flex-1',
                )}
              >
                {chatOpen && (
                  <div className="flex min-h-0 flex-1 flex-col">
                    <Suspense
                      fallback={
                        <div
                          className="panel-surface flex flex-1 items-center justify-center rounded-2xl p-4 text-theme-muted"
                          role="status"
                        >
                          Loading chat...
                        </div>
                      }
                    >
                      <LazyChatConversation
                        messages={chat.messages}
                        active={chatOpen && !isSSR}
                        onSend={sendMessage}
                        sending={chatFetcher.state !== 'idle'}
                        error={chatFetcher.data?.error || chatError}
                      />
                    </Suspense>
                  </div>
                )}
                {!chatOpen && (
                  <motion.div
                    layoutScroll
                    className="lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:[scrollbar-gutter:stable]"
                  >
                    <QueueList
                      playlistItems={displayPlaylistItems.filter(
                        (s) => s.id !== currentPlaylistItemData?.id,
                      )}
                      roomId={roomId}
                      onVote={handleVote}
                      onRemove={handleRemove}
                      emptyHref={addPlaylistItemHref}
                      isAdmin={isAdmin}
                      votingPlaylistItemId={votingPlaylistItemId}
                    />

                    {queuedPlaylistItemCount >
                      visibleQueuedPlaylistItemCount && (
                      <p
                        className="py-4 text-center text-sm text-theme-muted"
                        role="status"
                      >
                        Connecting to load the rest of the queue…
                      </p>
                    )}
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>
      </LazyMotion>
    );
  },
);
