import type { FetcherWithComponents } from '@kasperrt/smolter/preact';
import type { PlaylistItem, RemoteStatusV2, RoomV2 } from '@vibes/models';
import {
  resolvePlaylistItemThumbnail,
  usePlaybackDrift,
  usePlaybackStore,
} from '@vibes/shared';
import { getRoomLabels } from '@vibes/ui/shared';
import {
  Button,
  PauseIcon,
  PlaybackProgress,
  PlayIcon,
  PlusIcon,
  ResetIcon,
  SkipIcon,
  Tooltip,
} from '@vibes/ui/web';
import {
  type ChangeEvent,
  type KeyboardEvent,
  type PointerEvent,
  useEffect,
  useRef,
  useState,
} from 'preact/compat';
import type { ControllerActionData } from '../clientAction';

interface RemotePlaybackControlsProps {
  canSeek: boolean;
  currentPlaylistItem: PlaylistItem | null;
  fetcher: FetcherWithComponents<ControllerActionData>;
  initialPositionMs: number;
  isMachinePlaylistItemCurrent: boolean;
  isPlaying: boolean;
  onAddPlaylistItem: () => void;
  remoteStatus?: RemoteStatusV2;
  room: RoomV2;
}

export function RemotePlaybackControls({
  canSeek,
  currentPlaylistItem,
  fetcher,
  initialPositionMs,
  isMachinePlaylistItemCurrent,
  isPlaying,
  onAddPlaylistItem,
  remoteStatus,
  room,
}: RemotePlaybackControlsProps) {
  const labels = getRoomLabels(room.roomType);
  const serverPositionMs =
    usePlaybackStore((state) => state.actualPositionMs) ?? initialPositionMs;
  const serverIsPlaying = usePlaybackStore((state) => state.isPlaying);
  const durationMs =
    (currentPlaylistItem?.duration ?? 0) * millisecondsPerSecond;
  const [positionMs, setPositionMs] = useState(serverPositionMs);
  const [seekPositionMs, setSeekPositionMs] = useState(serverPositionMs);
  const isSeekingRef = useRef(false);
  const outOfSync = Boolean(
    fetcher.state === 'idle' &&
      remoteStatus?.online &&
      remoteStatus.playbackObservedAt &&
      currentPlaylistItem &&
      !(room.mode === 'host' && room.hostId === room.userId) &&
      (!isMachinePlaylistItemCurrent ||
        remoteStatus.playbackIsPlaying !== serverIsPlaying ||
        Math.abs(positionMs - serverPositionMs) > 5_000),
  );
  const canResetPosition = usePlaybackDrift(
    outOfSync,
    `${room.id}:${currentPlaylistItem?.id ?? ''}:${serverIsPlaying}`,
  );

  useEffect(() => {
    if (!isMachinePlaylistItemCurrent || !remoteStatus) {
      setPositionMs(serverPositionMs);

      return;
    }

    const updatePosition = () => {
      const observedAt = Date.parse(remoteStatus.playbackObservedAt);
      const elapsedMs =
        remoteStatus.playbackIsPlaying && Number.isFinite(observedAt)
          ? Math.max(0, Date.now() - observedAt)
          : 0;
      setPositionMs(
        Math.min(
          remoteStatus.playbackPositionMs + elapsedMs,
          durationMs || Number.POSITIVE_INFINITY,
        ),
      );
    };

    updatePosition();

    if (!remoteStatus.playbackIsPlaying) return;

    const interval = window.setInterval(
      updatePosition,
      remotePositionUpdateIntervalMs,
    );

    return () => window.clearInterval(interval);
  }, [
    durationMs,
    isMachinePlaylistItemCurrent,
    remoteStatus,
    serverPositionMs,
  ]);

  useEffect(() => {
    if (!isSeekingRef.current) {
      setSeekPositionMs(positionMs);
    }
  }, [positionMs]);

  const handleSeekChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSeekPositionMs(Number(event.currentTarget.value));
  };
  const handleSeekStart = () => {
    isSeekingRef.current = true;
  };
  const handleSeekCommit = (
    event: KeyboardEvent<HTMLInputElement> | PointerEvent<HTMLInputElement>,
  ) => {
    isSeekingRef.current = false;
    event.currentTarget.form?.requestSubmit();
  };

  return (
    <section className="panel-strong min-w-0 rounded-3xl p-5 lg:sticky lg:top-6">
      <p className="font-pixel text-2xs text-theme-muted tracking-label">
        Now playing
      </p>
      <div className="mt-4 flex items-center gap-4">
        {currentPlaylistItem?.thumbnailUrl && (
          <img
            key={currentPlaylistItem.id}
            src={resolvePlaylistItemThumbnail(currentPlaylistItem.thumbnailUrl)}
            alt=""
            width={96}
            height={96}
            decoding="async"
            className="h-20 w-20 shrink-0 rounded-xl border border-theme bg-theme-surface object-cover sm:h-24 sm:w-24"
          />
        )}
        <div className="min-w-0 flex-1">
          <h2 className="line-clamp-2 font-display text-lg text-theme">
            {currentPlaylistItem?.title ?? 'Nothing playing'}
          </h2>
          <p className="mt-2 truncate text-sm text-theme-muted">
            {currentPlaylistItem?.publisher ?? `Add a ${labels.item} to begin`}
          </p>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <fetcher.Form method="post">
          <input
            name="intent"
            type="hidden"
            value={isPlaying ? 'pause' : 'play'}
          />
          <input name="roomId" type="hidden" value={room.id} />
          <input
            name="itemId"
            type="hidden"
            value={currentPlaylistItem?.id ?? ''}
          />
          <input name="positionMs" type="hidden" value={positionMs} />
          <Button
            aria-label={isPlaying ? 'Pause' : 'Play'}
            size="icon"
            type="submit"
            variant="secondary"
          >
            {isPlaying && <PauseIcon className="h-5 w-5" />}
            {!isPlaying && <PlayIcon className="h-5 w-5" />}
          </Button>
        </fetcher.Form>
        <fetcher.Form method="post">
          <input name="intent" type="hidden" value="skip" />
          <input name="roomId" type="hidden" value={room.id} />
          <Button
            aria-label="Skip"
            size="icon"
            type="submit"
            variant="tertiary"
          >
            <SkipIcon className="h-5 w-5" />
          </Button>
        </fetcher.Form>
        {canResetPosition && (
          <fetcher.Form method="post">
            <input name="intent" type="hidden" value="resetPosition" />
            <input name="roomId" type="hidden" value={room.id} />
            <Tooltip className="inline-flex" content="Reset playback">
              <Button
                aria-label="Reset playback"
                size="icon"
                type="submit"
                variant="tertiary"
                disabled={fetcher.state !== 'idle'}
              >
                <ResetIcon className="h-5 w-5 text-theme-muted transition-colors group-hover:text-primary" />
              </Button>
            </Tooltip>
          </fetcher.Form>
        )}
        <Button onClick={onAddPlaylistItem} type="button" variant="primary">
          <PlusIcon className="h-5 w-5" />
          {labels.add}
        </Button>
      </div>

      <fetcher.Form className="mt-6" method="post">
        <input name="intent" type="hidden" value="seek" />
        <input name="roomId" type="hidden" value={room.id} />
        <PlaybackProgress
          disabled={!canSeek || durationMs === 0}
          durationMs={durationMs}
          name="positionMs"
          onChange={handleSeekChange}
          onKeyUp={handleSeekCommit}
          onPointerDown={handleSeekStart}
          onPointerUp={handleSeekCommit}
          positionMs={seekPositionMs}
        />
        {!canSeek && room.mode === 'host' && (
          <p className="mt-2 text-theme-subtle text-xs">
            Seeking is available when this machine is the room host.
          </p>
        )}
      </fetcher.Form>
    </section>
  );
}

const millisecondsPerSecond = 1000;
const remotePositionUpdateIntervalMs = 250;
