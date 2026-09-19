import { useRoomMessages } from '@vibes/api';
import { type PlaybackState, type Song } from '@vibes/models';
import {
  classNames,
  showToast,
  useChatTimeline,
  usePlaybackStore,
  useQueueStore,
} from '@vibes/shared';
import {
  TerminalButton,
  TerminalFeedback,
  TerminalSection,
} from '@vibes/ui/konami';
import {
  ChatConversation,
  NowPlayingSong,
  QueueList,
  useProgressiveList,
} from '@vibes/ui/web';
import React, { useEffect, useRef, useState } from 'react';
import { useFetcher } from 'react-router';
import { useChatPreferenceStore } from '../../../stores/chatPreferenceStore';

import type { RoomActionData } from '../action';
import { PlaybackProgress } from './PlaybackProgress';

interface RoomQueueProps {
  roomId: string;
  isSSR: boolean;
  onAddSong?: () => void;
  onChatVisibilityChange?: (open: boolean) => void;
  isAdmin?: boolean;
  initialPlayback?: PlaybackState;
  initialSongs?: Song[];
  terminalMode?: boolean;
}

export const RoomQueue: React.FC<RoomQueueProps> = React.memo(
  ({
    roomId,
    isSSR,
    onAddSong,
    onChatVisibilityChange,
    isAdmin,
    initialPlayback,
    initialSongs,
    terminalMode = false,
  }: RoomQueueProps) => {
    const chatPreference = useChatPreferenceStore((state) => state.enabled);
    const chatEnabled = !isSSR && chatPreference;
    const chat = useChatTimeline(roomId, chatEnabled);
    useEffect(() => {
      onChatVisibilityChange?.(chat.open);
      return () => onChatVisibilityChange?.(false);
    }, [chat.open, onChatVisibilityChange]);
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
          { intent: 'sendMessage', text },
          { encType: 'application/json', method: 'post' },
        );
      });
    /* 1. Hooks */
    const voteFetcher = useFetcher<RoomActionData>();
    const removeFetcher = useFetcher<RoomActionData>();
    const songs = useQueueStore((state) => state.songs);
    const [votingSongId, setVotingSongId] = useState<string | null>(null);

    // Granular store subscriptions
    const isPlayingFromStore = usePlaybackStore((state) => state.isPlaying);

    /* 2. State & Computed */
    const isPlaying = isSSR
      ? (initialPlayback?.isPlaying ?? false)
      : isPlayingFromStore;
    const displaySongs =
      isSSR && initialSongs
        ? initialSongs
        : songs.length > 0
          ? songs
          : initialSongs || [];

    // Actually we need the full current song for the card
    const currentSongData =
      usePlaybackStore((state) => state.currentSong) ||
      initialPlayback?.currentSong;
    const queuedSongCount = displaySongs.reduce(
      (count, song) => count + Number(song.id !== currentSongData?.id),
      0,
    );
    const [terminalVisibleCount, terminalSentinelRef] =
      useProgressiveList(queuedSongCount);

    /* 3. Handlers */
    const handleVote = React.useCallback(
      (songId: string) => {
        if (votingSongId) {
          return;
        }
        setVotingSongId(songId);
        voteFetcher.submit(
          { intent: 'voteSong', songId },
          { encType: 'application/json', method: 'post' },
        );
      },
      [voteFetcher, votingSongId],
    );

    const handleRemove = React.useCallback(
      (songId: string) => {
        removeFetcher.submit(
          { intent: 'removeSong', songId },
          { encType: 'application/json', method: 'post' },
        );
      },
      [removeFetcher],
    );

    useEffect(() => {
      if (voteFetcher.state !== 'idle' || !voteFetcher.data || !votingSongId) {
        return;
      }

      if (voteFetcher.data.error) {
        showToast(voteFetcher.data.error, 'error');
        setVotingSongId(null);
        return;
      }

      showToast('Vote added. Queue updated.', 'success');
      setVotingSongId(null);
    }, [voteFetcher.data, voteFetcher.state, votingSongId]);

    const formatTime = (ms: number) => {
      const seconds = Math.floor(ms / 1000);
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      return `${m}:${s.toString().padStart(2, '0')}`;
    };

    if (terminalMode) {
      const queuedSongs = displaySongs.filter(
        (song) => song.id !== currentSongData?.id,
      );
      const visibleQueuedSongs = queuedSongs.slice(0, terminalVisibleCount);

      return (
        <div className="space-y-4 lg:col-span-3 lg:min-h-0 lg:overflow-y-auto">
          <TerminalSection
            label="SERVER SIGNAL"
            status={isPlaying ? 'PLAYING' : 'PAUSED'}
          >
            {!currentSongData && (
              <TerminalFeedback>
                NO TRACK MOUNTED. QUEUE A SIGNAL TO BEGIN.
              </TerminalFeedback>
            )}
            {currentSongData && (
              <>
                <div className="grid grid-cols-[auto_1fr_auto] gap-x-3 gap-y-1 text-xs uppercase">
                  <span className="text-[#71f5ad]/55">TRACK</span>
                  <strong className="min-w-0 truncate text-[#e0ffef]">
                    {currentSongData.title}
                  </strong>
                  <span className="text-[#71f5ad]">
                    {currentSongData.sourceType.toUpperCase()}
                  </span>
                  <span className="text-[#71f5ad]/55">ARTIST</span>
                  <span className="min-w-0 truncate text-[#a6ffd0]/70">
                    {currentSongData.artist || 'UNKNOWN'}
                  </span>
                  <span className="text-[#a6ffd0]/55 tabular-nums">
                    {formatTime(currentSongData.duration * 1000)}
                  </span>
                </div>
                <PlaybackProgress
                  durationMs={currentSongData.duration * 1000}
                  isSSR={isSSR}
                  terminalMode
                />
              </>
            )}
          </TerminalSection>

          <TerminalSection
            label="QUEUE DIRECTORY"
            status={`${queuedSongs.length.toString().padStart(2, '0')} WAITING`}
          >
            <div className="space-y-1.5">
              {queuedSongs.length === 0 && (
                <TerminalFeedback>END OF QUEUE.</TerminalFeedback>
              )}
              {visibleQueuedSongs.map((song, index) => (
                <article
                  className="grid grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-2 border border-[#71f5ad]/20 bg-black/15 px-2.5 py-2.5 text-xs"
                  key={song.id}
                >
                  <span className="text-[#71f5ad]/45 tabular-nums">
                    {(index + 1).toString().padStart(2, '0')}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[#dffff0] uppercase">
                      {song.title}
                    </p>
                    <p className="mt-1 truncate text-[#a6ffd0]/50 text-[0.6rem] uppercase">
                      {song.artist || 'UNKNOWN'} / {song.sourceType} /{' '}
                      {formatTime(song.duration * 1000)}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <TerminalButton
                      aria-label={`Vote for ${song.title}`}
                      className="px-2 py-1"
                      disabled={Boolean(votingSongId)}
                      onClick={() => handleVote(song.id)}
                    >
                      +{song.voteCount ?? 0}
                    </TerminalButton>
                    {isAdmin && (
                      <TerminalButton
                        aria-label={`Remove ${song.title}`}
                        className="px-2 py-1"
                        onClick={() => handleRemove(song.id)}
                        variant="danger"
                      >
                        DEL
                      </TerminalButton>
                    )}
                  </div>
                </article>
              ))}
              {terminalVisibleCount < queuedSongs.length && (
                <div
                  aria-hidden="true"
                  className="h-10"
                  ref={terminalSentinelRef}
                />
              )}
            </div>
          </TerminalSection>
        </div>
      );
    }

    return (
      <div className="mt-6 flex min-h-0 min-w-0 flex-col lg:col-span-2 lg:mt-0 lg:h-full">
        <div className="relative flex min-h-0 flex-1 flex-col">
          {/* Now Playing (Integrated into list style) */}
          {currentSongData && (
            <div className="mb-2 shrink-0">
              <NowPlayingSong song={currentSongData} isPlaying={isPlaying} />

              <PlaybackProgress
                durationMs={currentSongData.duration * 1000}
                isSSR={isSSR}
              />
            </div>
          )}

          {/* Up Next List */}
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="mb-3 flex shrink-0 items-center justify-between border-theme border-b">
              <button
                type="button"
                aria-pressed={!chat.open}
                onClick={() => chat.selectChat(false)}
                className={classNames(
                  'min-h-12 border-b-2 px-1 font-display text-2xs tracking-label focus-visible:outline-2 focus-visible:outline-secondary',
                  !chat.open
                    ? 'border-secondary text-theme'
                    : 'border-transparent text-theme-muted',
                )}
              >
                Up next ({queuedSongCount})
              </button>
              {chatEnabled && (
                <button
                  type="button"
                  aria-pressed={chat.open}
                  onClick={() => chat.selectChat(true)}
                  className={classNames(
                    'min-h-12 border-b-2 px-1 font-display text-2xs tracking-label focus-visible:outline-2 focus-visible:outline-secondary',
                    chat.open
                      ? 'border-secondary text-theme'
                      : 'border-transparent text-theme-muted',
                  )}
                >
                  {chat.unread > 0 ? `Chat (${chat.unread})` : 'Chat'}
                </button>
              )}
            </div>
            <div className="flex h-80 min-h-0 flex-col lg:h-auto lg:flex-1">
              {chat.open && (
                <div className="flex min-h-0 flex-1 flex-col">
                  <ChatConversation
                    messages={chat.messages}
                    active={chat.open}
                    onSend={sendMessage}
                    sending={chatFetcher.state !== 'idle'}
                    error={chatFetcher.data?.error || chatError}
                  />
                </div>
              )}
              {!chat.open && (
                <div className="min-h-0 flex-1 overflow-y-auto [scrollbar-gutter:stable]">
                  <QueueList
                    songs={displaySongs.filter(
                      (s) => s.id !== currentSongData?.id,
                    )}
                    roomId={roomId}
                    onVote={handleVote}
                    onRemove={handleRemove}
                    onEmptyClick={onAddSong}
                    isAdmin={isAdmin}
                    votingSongId={votingSongId}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  },
);
