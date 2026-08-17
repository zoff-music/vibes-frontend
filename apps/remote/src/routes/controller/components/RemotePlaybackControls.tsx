import type { RemoteStatus, Room, Song } from '@vibes/models';
import {
  Button,
  PauseIcon,
  PlaybackProgress,
  PlayIcon,
  PlusIcon,
  SkipIcon,
} from '@vibes/ui/web';
import {
  type ChangeEvent,
  type KeyboardEvent,
  type PointerEvent,
  useEffect,
  useRef,
  useState,
} from 'react';
import type { useFetcher } from 'react-router';
import type { ControllerActionData } from '../action';

interface RemotePlaybackControlsProps {
  canSeek: boolean;
  currentSong: Song | null;
  fetcher: ReturnType<typeof useFetcher<ControllerActionData>>;
  isMachineSongCurrent: boolean;
  isPlaying: boolean;
  onAddSong: () => void;
  remoteStatus?: RemoteStatus;
  room: Room;
  serverPositionMs: number;
}

export function RemotePlaybackControls({
  canSeek,
  currentSong,
  fetcher,
  isMachineSongCurrent,
  isPlaying,
  onAddSong,
  remoteStatus,
  room,
  serverPositionMs,
}: RemotePlaybackControlsProps) {
  const durationMs = (currentSong?.duration ?? 0) * millisecondsPerSecond;
  const [positionMs, setPositionMs] = useState(serverPositionMs);
  const [seekPositionMs, setSeekPositionMs] = useState(serverPositionMs);
  const isSeekingRef = useRef(false);

  useEffect(() => {
    if (!isMachineSongCurrent || !remoteStatus) {
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
  }, [durationMs, isMachineSongCurrent, remoteStatus, serverPositionMs]);

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
    <section className="panel-strong min-w-0 rounded-3xl p-5">
      <p className="font-pixel text-2xs text-theme-muted tracking-label">
        Now playing
      </p>
      <h2 className="mt-4 line-clamp-2 font-display text-lg text-theme">
        {currentSong?.title ?? 'Nothing playing'}
      </h2>
      <p className="mt-2 truncate text-sm text-theme-muted">
        {currentSong?.artist ?? 'Add a song to begin'}
      </p>

      <div className="mt-6 flex items-center gap-3">
        <fetcher.Form method="post">
          <input
            name="intent"
            type="hidden"
            value={isPlaying ? 'pause' : 'play'}
          />
          <input name="roomId" type="hidden" value={room.id} />
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
        <Button onClick={onAddSong} type="button" variant="primary">
          <PlusIcon className="h-5 w-5" />
          Add Song
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
