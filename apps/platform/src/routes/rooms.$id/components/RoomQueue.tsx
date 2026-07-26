import { type PlaybackState, type Song } from '@vibes/models';
import {
  getProviderTrackUrl,
  resolveSongThumbnail,
  usePlaybackStore,
  useQueueStore,
} from '@vibes/shared';
import { QueueList, SoundCloudIcon, SpotifyIcon, YouTubeIcon } from '@vibes/ui';
import React from 'react';
import { useFetcher } from 'react-router';
import type { RoomActionData } from '../action';
import { PlaybackProgress } from './PlaybackProgress';

interface RoomQueueProps {
  roomId: string;
  isSSR: boolean;
  isAdmin?: boolean;
  initialPlayback?: PlaybackState;
  initialSongs?: Song[];
}

export const RoomQueue: React.FC<RoomQueueProps> = React.memo(
  ({
    roomId,
    isSSR,
    isAdmin,
    initialPlayback,
    initialSongs,
  }: RoomQueueProps) => {
    /* 1. Hooks */
    const songFetcher = useFetcher<RoomActionData>();
    const songs = useQueueStore((state) => state.songs);

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
        songFetcher.submit(
          { intent: 'voteSong', songId },
          { encType: 'application/json', method: 'post' },
        );
      },
      [songFetcher],
    );

    const handleRemove = React.useCallback(
      (songId: string) => {
        songFetcher.submit(
          { intent: 'removeSong', songId },
          { encType: 'application/json', method: 'post' },
        );
      },
      [songFetcher],
    );

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

    return (
      <div className="mt-8 space-y-8 lg:mt-0 lg:h-full lg:overflow-y-auto lg:pr-2">
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
                      <a
                        href={currentSongProviderUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="cursor-pointer rounded-md p-1 transition-opacity hover:opacity-100 focus:outline-hidden focus:ring-2 focus:ring-secondary/40"
                        aria-label={`Open ${currentSongData.title} on ${providerNames[currentSongData.sourceType]}`}
                        title={`Open on ${providerNames[currentSongData.sourceType]}`}
                      >
                        {currentSongData.sourceType === 'youtube' && (
                          <YouTubeIcon className="h-5 w-5" />
                        )}
                        {currentSongData.sourceType === 'spotify' && (
                          <SpotifyIcon className="h-5 w-5" />
                        )}
                        {currentSongData.sourceType === 'soundcloud' && (
                          <SoundCloudIcon className="h-5 w-5" />
                        )}
                      </a>
                    )}
                    {!currentSongProviderUrl &&
                      currentSongData.sourceType === 'soundcloud' && (
                        <SoundCloudIcon className="h-5 w-5" />
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
