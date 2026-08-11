import {
  formatPlaybackSeconds,
  getPlaybackPresentation,
  getProviderDisplayName,
  getQueueRemainderLabel,
} from '@vibes/ui/shared';
import { ProviderIcon, VoteIcon } from '@vibes/ui/web';
import { useEffect, useRef, useState } from 'react';
import { useGenerationMessage } from '@/hooks/use-generation-message';
import type { useTvSession } from '@/hooks/use-tv-session';
import { QrCode } from '@/tizen/qr-code';
import { YouTubeIframePlayer } from '@/tizen/youtube-iframe-player';

interface TizenRoomProps {
  session: ReturnType<typeof useTvSession>;
}

export function TizenRoom({ session }: TizenRoomProps) {
  const queueRef = useRef<HTMLDivElement>(null);
  const [visibleQueueLength, setVisibleQueueLength] = useState(0);
  const isGenerating = Boolean(session.room?.isGenerating);
  const generationMessage = useGenerationMessage(isGenerating);
  const current = session.playback.currentSong;
  const queued = current
    ? session.songs.filter((song) => song.id !== current.id)
    : session.songs;
  const joinUrl = `https://zoff.me/${encodeURIComponent(session.roomId)}`;
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
  let player = (
    <div className="flex h-full items-center justify-center bg-black text-4xl text-tv-muted">
      No song is playing
    </div>
  );
  if (current?.sourceType === 'youtube') {
    player = (
      <YouTubeIframePlayer
        key={`${current.sourceId}:${session.playback.updatedAt}`}
        positionMs={session.playback.positionMs}
        sourceId={current.sourceId}
        title={current.title}
      />
    );
  }
  if (current?.sourceType === 'soundcloud' && current.providerUrl) {
    const src = `https://w.soundcloud.com/player/?url=${encodeURIComponent(current.providerUrl)}&auto_play=${String(session.playback.isPlaying)}&hide_related=true&show_comments=false&show_user=true&show_reposts=false&visual=true`;
    player = (
      <iframe
        allow="autoplay"
        className="h-full w-full border-0"
        src={src}
        title={current.title}
      />
    );
  }
  if (current?.sourceType === 'spotify') {
    const src = `https://open.spotify.com/embed/track/${encodeURIComponent(current.sourceId)}?utm_source=zoff`;
    player = (
      <iframe
        allow="autoplay; encrypted-media"
        className="h-full w-full border-0"
        src={src}
        title={current.title}
      />
    );
  }
  if (
    current &&
    current.sourceType !== 'youtube' &&
    current.sourceType !== 'soundcloud' &&
    current.sourceType !== 'spotify'
  ) {
    player = (
      <div className="relative flex h-full items-center justify-center overflow-hidden bg-black">
        <img
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-40"
          src={current.thumbnailUrl}
        />
        <img
          alt=""
          className="relative size-80 rounded-3xl object-cover"
          src={current.thumbnailUrl}
        />
      </div>
    );
  }
  if (isGenerating && !current) {
    player = (
      <div className="flex h-full flex-col items-center justify-center gap-6 bg-tv-surface">
        <div className="size-14 animate-spin rounded-full border-4 border-tv-border border-t-accent" />
        <div className="animate-pulse text-3xl">{generationMessage}</div>
        <div className="text-tv-muted text-xl">
          Songs will appear here automatically.
        </div>
      </div>
    );
  }
  const listenerCount = session.listenerCount || session.room?.userCount || 0;
  const progress = getPlaybackPresentation(
    session.playback.positionMs,
    (current?.duration ?? 0) * millisecondsPerSecond,
  ).progress;
  const queueRemainderLabel = getQueueRemainderLabel(
    queued.length,
    visibleQueueLength,
  );
  return (
    <div className="relative flex h-full gap-6 overflow-hidden p-6">
      <section className="flex h-full w-[65%] shrink-0 flex-col overflow-hidden rounded-[2rem] border border-primary/30 bg-tv-card">
        <div className="min-h-0 flex-1 bg-black">{player}</div>
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
          <div className="mt-4 flex justify-between text-sm text-white/60">
            <span>
              {formatPlaybackSeconds(
                session.playback.positionMs / millisecondsPerSecond,
              )}
            </span>
            <span>{formatPlaybackSeconds(current?.duration ?? 0)}</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full bg-accent"
              style={{ width: `${progress * percentageMultiplier}%` }}
            />
          </div>
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
              {listenerCount} {listenerCount === 1 ? 'listener' : 'listeners'}
            </div>
            <button
              className="rounded-xl border border-tv-border bg-tv-surface px-4 py-2 text-sm"
              onClick={session.leaveRoom}
              type="button"
            >
              Leave
            </button>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-hidden" ref={queueRef}>
          {queued.length === 0 ? (
            <div className="flex h-full items-center justify-center rounded-2xl border border-tv-border text-center text-tv-muted">
              The queue is empty
            </div>
          ) : (
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
            <p className="mt-3 truncate text-2xl">{session.room?.name}</p>
            <p className="mt-2 text-sm text-tv-muted">
              Add songs and vote from your phone
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}

const millisecondsPerSecond = 1000;
const percentageMultiplier = 100;
const queueTrackHeight = 96;
const queueTrackGap = 12;
