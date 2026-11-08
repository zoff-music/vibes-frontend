import type { PlaybackStateV2, PlaylistItem, RoomV2 } from '@vibes/models';
import {
  formatPlaybackSeconds,
  getProviderDisplayName,
  getQueueRemainderLabel,
  getRoomLabels,
} from '@vibes/ui/shared';
import { ExplicitBadge, ProviderIcon, VoteIcon } from '@vibes/ui/web';
import { useEffect, useRef, useState } from 'preact/compat';
import { QrCode } from '@/tizen/qr-code';
import { TizenPlaybackStatus } from '@/tizen/tizen-playback-status';
import { TizenProviderSurface } from '@/tizen/tizen-provider-surface';
import { TizenRoomControls } from '@/tizen/tizen-room-controls';

interface TizenRoomProps {
  listenerCount: number;
  onLeave: () => void;
  playback: PlaybackStateV2;
  room: RoomV2;
  roomId: string;
  playlistItems: PlaylistItem[];
}

export function TizenRoom({
  listenerCount,
  onLeave,
  playback,
  room,
  roomId,
  playlistItems,
}: TizenRoomProps) {
  const labels = getRoomLabels(room.roomType);
  const queueRef = useRef<HTMLDivElement>(null);
  const [visibleQueueLength, setVisibleQueueLength] = useState(0);
  const isGenerating = Boolean(room.isGenerating);
  const current = playback.currentPlaylistItem;
  const queued = current
    ? playlistItems.filter((playlistItem) => playlistItem.id !== current.id)
    : playlistItems;
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
    <div className="relative flex h-full overflow-hidden p-6">
      <section className="border-primary/30 bg-tv-card flex h-full w-[68%] shrink-0 flex-col overflow-hidden rounded-[2rem] border">
        <div className="min-h-0 flex-1 bg-black">
          <TizenProviderSurface
            isGenerating={isGenerating}
            playback={playback}
          />
        </div>
        <div className="border-tv-border shrink-0 border-t bg-black px-8 py-5">
          <div className="tv-space-x-6 flex items-end">
            {current?.thumbnailUrl && (
              <img
                alt=""
                className="border-tv-border size-20 shrink-0 rounded-xl border object-cover"
                src={current.thumbnailUrl}
              />
            )}
            <div className="min-w-0 flex-1">
              <h1 className="mb-2 truncate text-2xl">
                {current?.title ?? 'No song is playing'}
              </h1>
              <p className="text-tv-muted truncate text-lg">
                {current?.publisher ?? 'Waiting for the room queue'}
              </p>
            </div>
            <span className="text-tv-muted shrink-0 text-xl">
              {current ? getProviderDisplayName(current.sourceType) : ''}
            </span>
          </div>
          <TizenPlaybackStatus
            durationSeconds={current?.duration ?? 0}
            playback={playback}
          />
        </div>
      </section>

      <div className="h-full min-w-0 flex-1 pl-6">
        <aside className="border-primary/30 bg-tv-card flex h-full flex-col rounded-[2rem] border p-7">
          <header className="tv-space-x-3 border-tv-border mb-5 flex items-center justify-between border-b pb-5">
            <h2 className="text-tv-muted text-sm tracking-[0.2em] uppercase">
              Up Next ({queued.length})
            </h2>
            <div className="tv-space-x-3 flex items-center">
              <div className="tv-space-x-2 border-accent/30 text-tv-muted flex items-center rounded-full border px-4 py-2 text-sm">
                <span className="bg-accent size-2 rounded-full" />
                <span>
                  {displayedListenerCount}{' '}
                  {displayedListenerCount === 1
                    ? labels.participant
                    : labels.participants}
                </span>
              </div>
              <TizenRoomControls
                key={current?.id ?? 'empty'}
                hasCurrentItem={Boolean(current)}
                room={room}
                roomId={roomId}
                onLeave={onLeave}
              />
            </div>
          </header>

          <div className="min-h-0 flex-1 overflow-hidden" ref={queueRef}>
            {queued.length === 0 && (
              <div className="border-tv-border text-tv-muted flex h-full items-center justify-center rounded-2xl border text-center">
                The queue is empty
              </div>
            )}
            {queued.length > 0 && (
              <div className="flex h-full flex-col">
                <div className="tv-space-y-3 flex shrink-0 flex-col">
                  {queued
                    .slice(0, visibleQueueLength)
                    .map((playlistItem, index) => (
                      <div
                        className="tv-space-x-4 border-tv-border bg-tv-surface flex h-24 items-center rounded-2xl border px-4"
                        key={playlistItem.id}
                      >
                        <span className="text-tv-muted w-7 shrink-0 text-center text-xs">
                          {index + 1}
                        </span>
                        <img
                          alt=""
                          className="border-tv-border size-16 shrink-0 rounded-xl border object-cover"
                          decoding="async"
                          loading="lazy"
                          src={playlistItem.thumbnailUrl}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs">
                            {playlistItem.title}
                          </p>
                          <p className="text-tv-muted mt-1 truncate text-xs">
                            {playlistItem.publisher ?? 'Unknown Artist'} ·{' '}
                            {formatPlaybackSeconds(playlistItem.duration)}
                          </p>
                        </div>
                        <span className="tv-space-x-1 text-accent flex shrink-0 items-center text-xs">
                          <VoteIcon className="size-4" />
                          <span>{playlistItem.voteCount ?? 0}</span>
                        </span>
                        <span className="text-tv-muted shrink-0">
                          <ProviderIcon
                            className="size-[1.125rem]"
                            provider={playlistItem.sourceType}
                          />
                        </span>
                      </div>
                    ))}
                </div>
                {queueRemainderLabel && (
                  <div className="text-tv-muted flex min-h-7 flex-1 items-center justify-center text-xs">
                    {queueRemainderLabel}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="border-primary/30 bg-tv-surface mt-5 grid grid-cols-[minmax(0,1fr)_auto] items-center rounded-3xl border p-4">
            <div className="min-w-0 pr-4">
              <p className="text-accent text-xs tracking-[0.2em] uppercase">
                Scan to join
              </p>
              <p className="mt-3 truncate text-2xl">{room.name}</p>
              {room.flagged && <ExplicitBadge />}
              <p className="text-tv-muted mt-2 text-sm">
                Add {labels.items} and vote from your phone
              </p>
            </div>
            <QrCode value={joinUrl} />
          </div>
        </aside>
      </div>
    </div>
  );
}

const queueTrackHeight = 96;
const queueTrackGap = 12;
