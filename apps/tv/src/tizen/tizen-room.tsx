import type { PlaybackState, Room, Song } from '@vibes/models';
import {
  formatPlaybackSeconds,
  getProviderDisplayName,
  getQueueRemainderLabel,
} from '@vibes/ui/shared';
import { ProviderIcon, VoteIcon } from '@vibes/ui/web';
import { useEffect, useRef, useState } from 'react';
import { QrCode } from '@/tizen/qr-code';
import { TizenPlaybackStatus } from '@/tizen/tizen-playback-status';
import { TizenProviderSurface } from '@/tizen/tizen-provider-surface';

interface TizenRoomProps {
  listenerCount: number;
  onLeave: () => void;
  playback: PlaybackState;
  room: Room;
  roomId: string;
  songs: Song[];
}

export function TizenRoom({
  listenerCount,
  onLeave,
  playback,
  room,
  roomId,
  songs,
}: TizenRoomProps) {
  const queueRef = useRef<HTMLDivElement>(null);
  const [visibleQueueLength, setVisibleQueueLength] = useState(0);
  const isGenerating = Boolean(room.isGenerating);
  const current = playback.currentSong;
  const queued = current
    ? songs.filter((song) => song.id !== current.id)
    : songs;
  const joinUrl = `https://zoff.me/${encodeURIComponent(roomId)}`;
  useEffect(() => {
    const queue = queueRef.current;
    if (!queue) return;
    const updateVisibleQueueLength = () => {
      const height = queue.getBoundingClientRect().height;
      setVisibleQueueLength(
        Math.max(
          0,
          Math.floor(
            (height + queueTrackGap) / (queueTrackHeight + queueTrackGap),
          ),
        ),
      );
    };
    updateVisibleQueueLength();
    const observer = new ResizeObserver(updateVisibleQueueLength);
    observer.observe(queue);
    return () => observer.disconnect();
  }, []);
  const displayedListenerCount = listenerCount || room.userCount || 0;
  const queueRemainderLabel = getQueueRemainderLabel(
    queued.length,
    visibleQueueLength,
  );
  return (
    <div className="relative flex h-full gap-6 overflow-hidden p-6">
      <section className="flex h-full w-[65%] shrink-0 flex-col overflow-hidden rounded-[2rem] border border-primary/30 bg-tv-card">
        <div className="min-h-0 flex-1 bg-black">
          <TizenProviderSurface
            isGenerating={isGenerating}
            playback={playback}
          />
        </div>
        <div className="shrink-0 border-tv-border border-t bg-black px-8 py-5">
          <div className="flex items-end gap-6">
            {current?.thumbnailUrl && (
              <img
                alt=""
                className="size-20 shrink-0 rounded-xl border border-tv-border object-cover"
                src={current.thumbnailUrl}
              />
            )}
            <div className="min-w-0 flex-1">
              <h1 className="mb-2 truncate text-2xl">
                {current?.title ?? 'No song is playing'}
              </h1>
              <p className="truncate text-lg text-tv-muted">
                {current?.artist ?? 'Waiting for the room queue'}
              </p>
            </div>
            <span className="shrink-0 text-tv-muted text-xl">
              {current ? getProviderDisplayName(current.sourceType) : ''}
            </span>
          </div>
          <TizenPlaybackStatus
            durationSeconds={current?.duration ?? 0}
            playback={playback}
          />
        </div>
      </section>

      <aside className="flex h-full min-w-0 flex-1 flex-col rounded-[2rem] border border-primary/30 bg-tv-card p-7">
        <header className="mb-5 flex items-center justify-between gap-3 border-tv-border border-b pb-5">
          <h2 className="text-sm text-tv-muted uppercase tracking-[0.2em]">
            Up Next ({queued.length})
          </h2>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-full border border-accent/30 px-4 py-2 text-sm text-tv-muted">
              <span className="size-2 rounded-full bg-accent" />
              {displayedListenerCount}{' '}
              {displayedListenerCount === 1 ? 'listener' : 'listeners'}
            </div>
            <button
              className="rounded-xl border border-tv-border bg-tv-surface px-4 py-2 text-sm"
              onClick={onLeave}
              type="button"
            >
              Leave
            </button>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-hidden" ref={queueRef}>
          {queued.length === 0 && (
            <div className="flex h-full items-center justify-center rounded-2xl border border-tv-border text-center text-tv-muted">
              The queue is empty
            </div>
          )}
          {queued.length > 0 && (
            <div className="flex h-full flex-col">
              <div className="flex shrink-0 flex-col gap-3">
                {queued.slice(0, visibleQueueLength).map((song, index) => (
                  <div
                    className="flex h-24 items-center gap-4 rounded-2xl border border-tv-border bg-tv-surface px-4"
                    key={song.id}
                  >
                    <span className="w-7 shrink-0 text-center text-tv-muted text-xs">
                      {index + 1}
                    </span>
                    <img
                      alt=""
                      className="size-16 shrink-0 rounded-xl border border-tv-border object-cover"
                      src={song.thumbnailUrl}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs">{song.title}</p>
                      <p className="mt-1 truncate text-tv-muted text-xs">
                        {song.artist ?? 'Unknown Artist'} ·{' '}
                        {formatPlaybackSeconds(song.duration)}
                      </p>
                    </div>
                    <span className="flex shrink-0 items-center gap-1 text-accent text-xs">
                      <VoteIcon className="size-4" />
                      {song.voteCount ?? 0}
                    </span>
                    <span className="shrink-0 text-tv-muted">
                      <ProviderIcon
                        className="size-[1.125rem]"
                        provider={song.sourceType}
                      />
                    </span>
                  </div>
                ))}
              </div>
              {queueRemainderLabel && (
                <div className="flex min-h-7 flex-1 items-center justify-center text-tv-muted text-xs">
                  {queueRemainderLabel}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-5 grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4 rounded-3xl border border-primary/30 bg-tv-surface p-4">
          <QrCode value={joinUrl} />
          <div className="min-w-0">
            <p className="text-accent text-xs uppercase tracking-[0.2em]">
              Scan to join
            </p>
            <p className="mt-3 truncate text-2xl">{room.name}</p>
            <p className="mt-2 text-sm text-tv-muted">
              Add songs and vote from your phone
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}

const queueTrackHeight = 96;
const queueTrackGap = 12;
