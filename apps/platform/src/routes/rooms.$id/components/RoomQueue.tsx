import { type PlaybackState, type Song } from '@vibes/models';
import {
  getProviderTrackUrl,
  resolveSongThumbnail,
  showToast,
  usePlaybackStore,
  useQueueStore,
} from '@vibes/shared';
import { ProviderIcon, QueueList, Tooltip } from '@vibes/ui/web';
import React, { type ReactNode, useEffect, useState } from 'react';
import { useFetcher } from 'react-router';

interface TerminalQueueSectionProps {
  children: ReactNode;
  label: string;
  status: string;
}

function TerminalQueueSection({
  children,
  label,
  status,
}: TerminalQueueSectionProps) {
  return (
    <section className="border border-[#71f5ad]/30 bg-[#020e09]/80">
      <div className="flex items-center justify-between gap-3 border-[#71f5ad]/30 border-b bg-[#071b12] px-3 py-2 text-[#a6ffd0] text-[0.65rem] uppercase tracking-[0.14em]">
        <span>{label}</span>
        <span className="text-[#71f5ad]/65">[{status}]</span>
      </div>
      <div className="p-3 sm:p-4">{children}</div>
    </section>
  );
}

import type { RoomActionData } from '../action';
import { PlaybackProgress } from './PlaybackProgress';

interface RoomQueueProps {
  roomId: string;
  isSSR: boolean;
  isAdmin?: boolean;
  initialPlayback?: PlaybackState;
  initialSongs?: Song[];
  terminalMode?: boolean;
}

export const RoomQueue: React.FC<RoomQueueProps> = React.memo(
  ({
    roomId,
    isSSR,
    isAdmin,
    initialPlayback,
    initialSongs,
    terminalMode = false,
  }: RoomQueueProps) => {
    /* 1. Hooks */
    const voteFetcher = useFetcher<RoomActionData>();
    const removeFetcher = useFetcher<RoomActionData>();
    const songs = useQueueStore((state) => state.songs);
    const [votingSongId, setVotingSongId] = useState<string | null>(null);

    // Granular store subscriptions
    const isPlayingFromStore = usePlaybackStore((state) => state.isPlaying);

    /* 2. State & Computed */
    const isPlaying =
      isPlayingFromStore !== undefined
        ? isPlayingFromStore
        : initialPlayback?.isPlaying || false;
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

      showToast('Vote added — queue updated', 'success');
      setVotingSongId(null);
    }, [voteFetcher.data, voteFetcher.state, votingSongId]);

    const formatTime = (ms: number) => {
      const seconds = Math.floor(ms / 1000);
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const currentSongProviderUrl = currentSongData
      ? getProviderTrackUrl(
          currentSongData.sourceType,
          currentSongData.sourceId,
          currentSongData.providerUrl,
        )
      : null;

    if (terminalMode) {
      const queuedSongs = displaySongs.filter(
        (song) => song.id !== currentSongData?.id,
      );

      return (
        <div className="space-y-4 lg:col-span-3 lg:min-h-0 lg:overflow-y-auto">
          <TerminalQueueSection
            label="SERVER SIGNAL"
            status={isPlaying ? 'PLAYING' : 'PAUSED'}
          >
            {!currentSongData && (
              <p className="border border-[#71f5ad]/25 border-dashed p-4 text-[#a6ffd0]/55 text-xs">
                NO TRACK MOUNTED. QUEUE A SIGNAL TO BEGIN.
              </p>
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
          </TerminalQueueSection>

          <TerminalQueueSection
            label="QUEUE DIRECTORY"
            status={`${queuedSongs.length.toString().padStart(2, '0')} WAITING`}
          >
            <div className="space-y-1.5">
              {queuedSongs.length === 0 && (
                <p className="border border-[#71f5ad]/25 border-dashed p-4 text-[#a6ffd0]/55 text-xs">
                  END OF QUEUE.
                </p>
              )}
              {queuedSongs.map((song, index) => (
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
                    <button
                      aria-label={`Vote for ${song.title}`}
                      className="cursor-pointer border border-[#71f5ad]/35 px-2 py-1 text-[#a6ffd0]/70 hover:border-[#71f5ad] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                      disabled={Boolean(votingSongId)}
                      onClick={() => handleVote(song.id)}
                      type="button"
                    >
                      +{song.voteCount ?? 0}
                    </button>
                    {isAdmin && (
                      <button
                        aria-label={`Remove ${song.title}`}
                        className="cursor-pointer border border-[#ff8e8e]/35 px-2 py-1 text-[#ff8e8e]/75 hover:border-[#ff8e8e] hover:text-white"
                        onClick={() => handleRemove(song.id)}
                        type="button"
                      >
                        DEL
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </TerminalQueueSection>
        </div>
      );
    }

    return (
      <div className="mt-8 space-y-8 lg:col-span-2 lg:mt-0 lg:h-full lg:overflow-y-auto">
        <div className="relative lg:pb-6">
          {/* Now Playing (Integrated into list style) */}
          {currentSongData && (
            <div className="mb-8">
              <div className="mb-3 flex items-center gap-2">
                <div
                  className={`h-2 w-2 rounded-full ${
                    isPlaying
                      ? 'animate-pulse bg-secondary shadow-secondary-strong'
                      : 'bg-white/30'
                  }`}
                />
                <span className="font-display text-2xs text-theme-muted tracking-label">
                  {isPlaying ? 'Now Playing' : 'Paused'}
                </span>
              </div>

              <div
                key={currentSongData.id}
                className="animate-slide-up overflow-hidden"
              >
                <div className="group/card panel-surface no-box relative flex min-w-0 items-center gap-4 overflow-hidden rounded-2xl p-4">
                  <div className="vhs-scanlines pointer-events-none absolute inset-0" />

                  {/* Thumbnail */}
                  <div className="relative z-10 shrink-0">
                    <img
                      src={resolveSongThumbnail(currentSongData.thumbnailUrl)}
                      alt=""
                      className="h-16 w-16 rounded-xl border border-theme object-cover shadow-xs transition-transform group-hover/card:scale-105"
                    />
                  </div>

                  {/* Song info */}
                  <div className="relative z-10 min-w-0 flex-1 overflow-hidden">
                    <h3 className="mb-1 block max-w-full truncate font-display text-theme text-xs">
                      {currentSongData.title}
                    </h3>
                    <div className="flex min-w-0 items-center gap-2 overflow-hidden text-theme-muted text-xs">
                      <span className="min-w-0 truncate">
                        {currentSongData.artist || 'Unknown Artist'}
                      </span>
                      <span className="text-theme-subtle">•</span>
                      <span className="shrink-0 font-mono text-theme-subtle text-xs">
                        {formatTime(currentSongData.duration * 1000)}
                      </span>
                    </div>
                  </div>

                  {/* Source Icon */}
                  <div className="relative z-10 flex shrink-0 items-center justify-center opacity-70">
                    {currentSongProviderUrl && (
                      <Tooltip
                        align="end"
                        className="inline-flex"
                        content={`Open on ${providerNames[currentSongData.sourceType]}`}
                      >
                        <a
                          href={currentSongProviderUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="cursor-pointer rounded-md p-1 transition-opacity hover:opacity-100 focus:outline-hidden focus:ring-2 focus:ring-secondary/40"
                          aria-label={`Open ${currentSongData.title} on ${providerNames[currentSongData.sourceType]}`}
                        >
                          <ProviderIcon
                            className="h-5 w-5 text-white"
                            provider={currentSongData.sourceType}
                          />
                        </a>
                      </Tooltip>
                    )}
                    {!currentSongProviderUrl &&
                      currentSongData.sourceType === 'soundcloud' && (
                        <ProviderIcon
                          className="h-5 w-5 text-white"
                          provider="soundcloud"
                        />
                      )}
                  </div>
                </div>
              </div>

              <PlaybackProgress
                durationMs={currentSongData.duration * 1000}
                isSSR={isSSR}
              />

              <div className="mt-8 mb-4 h-px bg-theme-surface" />
            </div>
          )}

          {/* Up Next List */}
          <div>
            <h3 className="mb-4 font-display text-2xs text-theme-muted tracking-label">
              Up Next (
              {displaySongs.filter((s) => s.id !== currentSongData?.id).length})
            </h3>
            <QueueList
              songs={displaySongs.filter((s) => s.id !== currentSongData?.id)}
              roomId={roomId}
              onVote={handleVote}
              onRemove={handleRemove}
              isAdmin={isAdmin}
              votingSongId={votingSongId}
            />
          </div>
        </div>
      </div>
    );
  },
);

const providerNames: Record<Song['sourceType'], string> = {
  soundcloud: 'SoundCloud',
  spotify: 'Spotify',
  youtube: 'YouTube',
};
