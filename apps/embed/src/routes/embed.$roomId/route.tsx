import {
  usePlayback,
  usePlaybackPosition,
  useQueue,
  useRoom,
} from '@vibes/api';
import type { Song } from '@vibes/models';
import { usePlaybackStore, useQueueStore, useRoomStore } from '@vibes/shared';
import {
  Button,
  SoundCloudIcon,
  SoundCloudPlayer,
  SpotifyIcon,
  SpotifyPlayer,
  VideoPlayer,
  VoteIcon,
  YouTubeIcon,
} from '@vibes/ui';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useLoaderData } from 'react-router';
import type { EmbedLoaderData } from './loader';
import { loader } from './loader';

export { loader };

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes}:${remainder.toString().padStart(2, '0')}`;
}

interface QueueSongProps {
  song: Song;
  votingEnabled: boolean;
  onVote: (songId: string) => void;
}

function QueueSong({ song, votingEnabled, onVote }: QueueSongProps) {
  const content = (
    <>
      <img
        src={song.thumbnailUrl}
        alt=""
        className="h-11 w-11 shrink-0 rounded-lg object-cover"
        loading="lazy"
      />
      <span className="min-w-0 flex-1 text-left">
        <span className="block truncate text-theme text-xs">{song.title}</span>
        <span className="mt-0.5 block truncate text-[10px] text-theme-muted">
          {song.artist || 'Unknown artist'} · {formatDuration(song.duration)}
        </span>
      </span>
      <span className="flex shrink-0 items-center gap-1 text-[10px] text-secondary">
        <VoteIcon className="h-3.5 w-3.5" />
        {song.voteCount ?? 0}
      </span>
    </>
  );

  if (!votingEnabled) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-theme bg-theme-surface p-3">
        {content}
      </div>
    );
  }

  return (
    <Button
      variant="embed-queue"
      onClick={() => onVote(song.id)}
      title={`Vote for ${song.title}`}
    >
      {content}
    </Button>
  );
}

export default function EmbedRoom() {
  const loaderData = useLoaderData() as EmbedLoaderData;
  const { roomId, options } = loaderData;
  const fetchStartedRef = useRef(false);
  const { fetchRoom } = useRoom(roomId);
  const { fetchQueue, voteSong } = useQueue(roomId);
  const { fetchPlayback } = usePlayback(roomId);
  const [message, setMessage] = useState<string | null>(null);
  const setRoom = useRoomStore((state) => state.setRoom);
  const setSongs = useQueueStore((state) => state.setSongs);
  const setPlaybackState = usePlaybackStore((state) => state.setPlaybackState);
  const room = useRoomStore((state) => state.room) ?? loaderData.room;
  const songs = useQueueStore((state) => state.songs);
  const currentSong = usePlaybackStore((state) => state.currentSong);
  const isPlaying = usePlaybackStore((state) => state.isPlaying);
  const positionMs = usePlaybackPosition();

  useEffect(() => {
    setRoom(loaderData.room);
    setSongs(loaderData.songs);
    if (loaderData.playback) {
      setPlaybackState(loaderData.playback, loaderData.room.mode);
    }
  }, [loaderData, setPlaybackState, setRoom, setSongs]);

  useEffect(() => {
    if (fetchStartedRef.current) return;
    fetchStartedRef.current = true;

    const refresh = async () => {
      await fetchRoom();
      await Promise.all([fetchQueue(), fetchPlayback()]);
    };
    void refresh();
  }, [fetchPlayback, fetchQueue, fetchRoom]);

  const handleVote = useCallback(
    async (songId: string) => {
      const result = await voteSong(songId);
      if (result === 'success') {
        setMessage('Vote added');
        return;
      }
      if (result === 'already_voted') {
        setMessage('Vote already counted');
        return;
      }
      setMessage('Could not add vote');
    },
    [voteSong],
  );

  useEffect(() => {
    if (!message) return;
    const timeout = window.setTimeout(() => setMessage(null), 2500);
    return () => window.clearTimeout(timeout);
  }, [message]);

  const durationMs = (currentSong?.duration ?? 0) * 1000;
  const progress =
    durationMs > 0 ? Math.min(100, (positionMs / durationMs) * 100) : 0;
  const queuedSongs = songs.filter((song) => song.id !== currentSong?.id);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,46,151,0.18),_transparent_45%),var(--theme-bg)] p-3 text-theme sm:p-5">
      <section className="panel-strong mx-auto max-w-3xl overflow-hidden rounded-2xl border border-theme shadow-2xl">
        <header className="flex items-center justify-between border-theme border-b px-4 py-3">
          <div className="min-w-0">
            <a
              href={`https://zoff.me/rooms/${encodeURIComponent(roomId)}`}
              target="_blank"
              rel="noreferrer"
              className="block truncate font-pixel text-sm text-theme hover:text-primary"
            >
              {room.name}
            </a>
            <p className="mt-0.5 text-[10px] text-theme-muted">
              {isPlaying ? 'Now playing' : 'Paused'} on Zoff
            </p>
          </div>
          <span className="font-pixel text-[10px] text-primary tracking-[0.2em]">
            ZOFF
          </span>
        </header>

        <div
          className={
            options.playlist
              ? 'grid gap-4 p-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]'
              : 'mx-auto max-w-md p-4'
          }
        >
          <div className="min-w-0">
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-black">
              {currentSong ? (
                <img
                  src={currentSong.thumbnailUrl}
                  alt=""
                  className="h-full w-full object-cover opacity-75"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-theme-muted text-xs">
                  Nothing playing
                </div>
              )}
              {options.autoplay && currentSong?.sourceType === 'youtube' && (
                <div className="absolute inset-0">
                  <VideoPlayer isVisible fill appContext="platform" />
                </div>
              )}
              {options.autoplay && currentSong?.sourceType === 'spotify' && (
                <div className="absolute inset-0">
                  <SpotifyPlayer isVisible fill />
                </div>
              )}
              {options.autoplay && currentSong?.sourceType === 'soundcloud' && (
                <div className="absolute inset-0">
                  <SoundCloudPlayer isVisible fill />
                </div>
              )}
            </div>

            <div className="mt-3 min-w-0">
              <div className="flex items-start gap-2">
                <div className="min-w-0 flex-1">
                  <h1 className="truncate font-pixel text-sm text-theme">
                    {currentSong?.title ?? 'Waiting for music'}
                  </h1>
                  <p className="mt-1 truncate text-theme-muted text-xs">
                    {currentSong?.artist ?? 'The room queue is ready'}
                  </p>
                </div>
                {currentSong?.sourceType === 'spotify' && (
                  <SpotifyIcon className="h-5 w-5 shrink-0" />
                )}
                {currentSong?.sourceType === 'soundcloud' && (
                  <SoundCloudIcon className="h-5 w-5 shrink-0" />
                )}
                {currentSong?.sourceType === 'youtube' && (
                  <YouTubeIcon className="h-5 w-5 shrink-0" />
                )}
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-theme-surface">
                <div
                  className="h-full rounded-full bg-primary transition-[width] duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>

          {options.playlist && (
            <div className="min-h-0 min-w-0 sm:max-h-[390px] sm:overflow-y-auto sm:pr-1">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-pixel text-[10px] text-theme-muted tracking-[0.2em]">
                  Up next
                </h2>
                {options.vote && (
                  <span className="text-[10px] text-theme-subtle">
                    Tap a track to vote
                  </span>
                )}
              </div>
              <div className="space-y-2">
                {queuedSongs.map((song) => (
                  <QueueSong
                    key={song.id}
                    song={song}
                    votingEnabled={options.vote}
                    onVote={handleVote}
                  />
                ))}
                {queuedSongs.length === 0 && (
                  <div className="rounded-xl border border-theme bg-theme-surface p-6 text-center text-theme-muted text-xs">
                    The queue is empty
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {message && (
          <div className="border-theme border-t px-4 py-2 text-center text-[10px] text-secondary">
            {message}
          </div>
        )}
      </section>
    </main>
  );
}

export function ErrorBoundary() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--theme-bg)] p-4 text-theme">
      <div className="panel-strong rounded-2xl border border-theme p-8 text-center">
        <p className="font-pixel text-sm">Room unavailable</p>
        <p className="mt-2 text-theme-muted text-xs">
          Check the room name and try again.
        </p>
      </div>
    </main>
  );
}
