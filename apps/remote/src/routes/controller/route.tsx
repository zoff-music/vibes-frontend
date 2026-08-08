import { createApiClient, useRemoteEvents, useSSE } from '@vibes/api';
import type { RemoteEvent, RemoteStatus } from '@vibes/models';
import {
  showToast,
  usePlaybackStore,
  useQueueStore,
  useRoomStore,
} from '@vibes/shared';
import {
  Button,
  Input,
  ListenerCount,
  PauseIcon,
  PlaybackProgress,
  PlayIcon,
  PlusIcon,
  QueueList,
  RemoteIcon,
  SettingsIcon,
  SkipIcon,
} from '@vibes/ui';
import {
  type ChangeEvent,
  type KeyboardEvent,
  type PointerEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Link,
  useFetcher,
  useLoaderData,
  useParams,
  useRevalidator,
} from 'react-router';
import { type ControllerActionData, clientAction } from './action';
import { clientLoader } from './clientLoader';
import { RoomSettingsModal } from './components/RoomSettingsModal';
import { SongSearchModal } from './components/SongSearchModal';
import type { ControllerLoaderData } from './loadController';
import { loader } from './loader';

export { clientAction, clientLoader, loader };

export default function RemoteController() {
  const loaderData = useLoaderData<ControllerLoaderData>();
  const { id: remoteId = '' } = useParams<{ id: string }>();
  const revalidator = useRevalidator();
  const actionFetcher = useFetcher<ControllerActionData>();
  const roomFetcher = useFetcher<ControllerActionData>();
  const [roomInput, setRoomInput] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [remoteStatus, setRemoteStatus] = useState<RemoteStatus | undefined>(
    loaderData.remote,
  );
  const room = useRoomStore((state) => state.room) ?? loaderData.room;
  const songs = useQueueStore((state) => state.songs);
  const playback = usePlaybackStore();
  const setRoom = useRoomStore((state) => state.setRoom);
  const setSongs = useQueueStore((state) => state.setSongs);
  const setPlaybackState = usePlaybackStore((state) => state.setPlaybackState);
  const usersCount = useRoomStore((state) => state.usersCount);
  const setSession = useRoomStore((state) => state.setSession);
  const currentSong = playback.currentSong ?? loaderData.playback?.currentSong;
  const serverPositionMs =
    playback.actualPositionMs ?? loaderData.playback?.positionMs ?? 0;
  const durationMs = (currentSong?.duration ?? 0) * 1000;
  const isMachineSongCurrent = Boolean(
    currentSong?.id && remoteStatus?.currentSongId === currentSong.id,
  );
  const [machinePositionMs, setMachinePositionMs] = useState(
    loaderData.remote?.playbackPositionMs ?? serverPositionMs,
  );
  const positionMs = isMachineSongCurrent
    ? machinePositionMs
    : serverPositionMs;
  const [seekPositionMs, setSeekPositionMs] = useState(positionMs);
  const isSeekingRef = useRef(false);
  const remoteClient = useMemo(
    () => createApiClient({ 'X-Zoff-Remote-ID': remoteId }),
    [remoteId],
  );

  useEffect(() => {
    if (loaderData.room) setRoom(loaderData.room);
    setRemoteStatus(loaderData.remote);
    setSongs(loaderData.songs);
    if (loaderData.playback && loaderData.room) {
      setPlaybackState(loaderData.playback, loaderData.room.mode);
    }
  }, [loaderData, setPlaybackState, setRoom, setSongs]);

  useEffect(() => {
    if (!isMachineSongCurrent || !remoteStatus) {
      setMachinePositionMs(serverPositionMs);
      return;
    }

    const updateMachinePosition = () => {
      const observedAt = Date.parse(remoteStatus.playbackObservedAt);
      const elapsedMs =
        remoteStatus.playbackIsPlaying && Number.isFinite(observedAt)
          ? Math.max(0, Date.now() - observedAt)
          : 0;
      setMachinePositionMs(
        Math.min(
          remoteStatus.playbackPositionMs + elapsedMs,
          durationMs || Number.POSITIVE_INFINITY,
        ),
      );
    };

    updateMachinePosition();
    if (!remoteStatus.playbackIsPlaying) return;
    const interval = window.setInterval(
      updateMachinePosition,
      remotePositionUpdateIntervalMs,
    );
    return () => window.clearInterval(interval);
  }, [durationMs, isMachineSongCurrent, remoteStatus, serverPositionMs]);

  useEffect(() => {
    if (!isSeekingRef.current) {
      setSeekPositionMs(positionMs);
    }
  }, [positionMs]);

  useEffect(() => {
    const data = actionFetcher.data ?? roomFetcher.data;
    if (!data) return;
    if (data.error) {
      showToast(data.error, 'error');
      return;
    }
    if (data.session) {
      setSession(data.session.userId, data.session.isAdmin);
    }
    if (data.room) setRoom(data.room);
    if (data.playback && room) setPlaybackState(data.playback, room.mode);
    if (data.intent === 'changeRoom' || data.intent === 'addSong') {
      void revalidator.revalidate();
      setRoomInput('');
    }
  }, [
    actionFetcher.data,
    revalidator,
    room,
    roomFetcher.data,
    setPlaybackState,
    setRoom,
    setSession,
  ]);

  const handleRemoteRoomUpdate = useCallback(
    (event: RemoteEvent) => {
      if (event.roomId !== room?.id) {
        void revalidator.revalidate();
      }
    },
    [revalidator, room?.id],
  );
  const handleRemoteStateUpdate = useCallback(
    (event: RemoteEvent) => {
      setRemoteStatus((current) => ({
        currentRoomId: event.roomId,
        currentSongId: event.currentSongId,
        enabled: true,
        id: current?.id ?? remoteId,
        online: true,
        playbackIsPlaying: event.playbackIsPlaying,
        playbackObservedAt: event.playbackObservedAt,
        playbackPositionMs: event.playbackPositionMs,
      }));
      if (
        event.roomId !== room?.id ||
        (event.currentSongId && event.currentSongId !== currentSong?.id)
      ) {
        void revalidator.revalidate();
      }
    },
    [currentSong?.id, remoteId, revalidator, room?.id],
  );
  useRemoteEvents({
    controller: true,
    remoteId,
    onRoomUpdate: handleRemoteRoomUpdate,
    onStateUpdate: handleRemoteStateUpdate,
  });

  const callbacks = useMemo(() => ({}), []);
  useSSE(room?.id, callbacks, remoteClient);

  const handleRoomInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setRoomInput(event.target.value.toLowerCase());
  };
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
  const handleVote = useCallback(
    (songId: string) => {
      actionFetcher.submit(
        { intent: 'vote', roomId: room?.id ?? '', songId },
        { method: 'post' },
      );
    },
    [actionFetcher, room?.id],
  );
  const handleRemove = useCallback(
    (songId: string) => {
      actionFetcher.submit(
        { intent: 'remove', roomId: room?.id ?? '', songId },
        { method: 'post' },
      );
    },
    [actionFetcher, room?.id],
  );

  if (loaderData.error || !loaderData.remote) {
    return (
      <main className="relative z-10 flex min-h-screen items-center justify-center p-4">
        <section className="panel-strong w-full max-w-md rounded-4xl p-8 text-center">
          <RemoteIcon className="mx-auto h-12 w-12 text-theme-muted" />
          <h1 className="mt-5 font-display text-theme text-xl">
            Remote unavailable
          </h1>
          <p className="mt-3 text-sm text-theme-muted">{loaderData.error}</p>
          <Link
            to="/remotes"
            className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-secondary px-5 py-2.5 text-text-inverse transition-opacity hover:opacity-90"
          >
            Pair another machine
          </Link>
        </section>
      </main>
    );
  }

  const isPlaying = isMachineSongCurrent
    ? (remoteStatus?.playbackIsPlaying ?? false)
    : (playback.isPlaying ?? loaderData.playback?.isPlaying ?? false);
  const canSeek =
    room?.mode === 'host' &&
    Boolean(room.hostId && room.hostId === room.userId);
  const queuedSongs = songs.filter((song) => song.id !== currentSong?.id);

  return (
    <main className="relative z-10 mx-auto min-h-screen max-w-5xl px-4 py-5 sm:px-6 sm:py-8">
      <header className="panel-strong flex items-center justify-between gap-4 rounded-3xl px-5 py-4">
        <div className="min-w-0">
          <p className="font-pixel text-2xs text-secondary tracking-label">
            Controlling machine
          </p>
          <h1 className="mt-1 truncate font-display text-lg text-theme">
            {room?.name ?? 'No room selected'}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <ListenerCount count={usersCount} />
          {room && (
            <Button
              type="button"
              onClick={() => setShowSettings(true)}
              variant="tertiary"
              size="icon"
              aria-label="Room settings"
            >
              <SettingsIcon className="h-5 w-5" />
            </Button>
          )}
          <RemoteIcon className="h-7 w-7 text-secondary" />
        </div>
      </header>

      <roomFetcher.Form
        method="post"
        className="panel-surface mt-4 grid grid-cols-[minmax(0,1fr)_auto] gap-3 rounded-2xl p-3"
      >
        <input type="hidden" name="intent" value="changeRoom" />
        <div className="min-w-0">
          <Input
            aria-label="Room name"
            containerClassName="mb-0 h-full"
            name="nextRoomId"
            onChange={handleRoomInputChange}
            placeholder="Change room"
            required
            value={roomInput}
          />
        </div>
        <Button type="submit" variant="secondary">
          Go
        </Button>
      </roomFetcher.Form>

      {!room && (
        <section className="panel-surface mt-4 rounded-3xl p-8 text-center">
          <p className="text-sm text-theme-muted">
            Enter a room name to move the controlled machine.
          </p>
        </section>
      )}

      {room && (
        <div className="mt-4 grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
          <section className="panel-strong rounded-3xl p-5">
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
              <actionFetcher.Form method="post">
                <input
                  type="hidden"
                  name="intent"
                  value={isPlaying ? 'pause' : 'play'}
                />
                <input type="hidden" name="roomId" value={room.id} />
                <input type="hidden" name="positionMs" value={positionMs} />
                <Button
                  type="submit"
                  size="icon"
                  variant="secondary"
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? (
                    <PauseIcon className="h-5 w-5" />
                  ) : (
                    <PlayIcon className="h-5 w-5" />
                  )}
                </Button>
              </actionFetcher.Form>
              <actionFetcher.Form method="post">
                <input type="hidden" name="intent" value="skip" />
                <input type="hidden" name="roomId" value={room.id} />
                <Button
                  type="submit"
                  size="icon"
                  variant="tertiary"
                  aria-label="Skip"
                >
                  <SkipIcon className="h-5 w-5" />
                </Button>
              </actionFetcher.Form>
              <Button
                type="button"
                onClick={() => setShowSearch(true)}
                variant="primary"
              >
                <PlusIcon className="h-5 w-5" />
                Add Song
              </Button>
            </div>

            <actionFetcher.Form method="post" className="mt-6">
              <input type="hidden" name="intent" value="seek" />
              <input type="hidden" name="roomId" value={room.id} />
              <PlaybackProgress
                disabled={!canSeek || durationMs === 0}
                durationMs={durationMs}
                name="positionMs"
                positionMs={seekPositionMs}
                onChange={handleSeekChange}
                onKeyUp={handleSeekCommit}
                onPointerDown={handleSeekStart}
                onPointerUp={handleSeekCommit}
              />
              {!canSeek && room.mode === 'host' && (
                <p className="mt-2 text-theme-subtle text-xs">
                  Seeking is available when this machine is the room host.
                </p>
              )}
            </actionFetcher.Form>
          </section>

          <section className="panel-strong min-w-0 rounded-3xl p-4 sm:p-5">
            <h2 className="mb-4 font-display text-2xs text-theme-muted tracking-label">
              Up next ({queuedSongs.length})
            </h2>
            <div className="max-h-[60vh] overflow-y-auto">
              <QueueList
                songs={queuedSongs}
                roomId={room.id}
                onVote={handleVote}
                onRemove={room.isAdmin ? handleRemove : undefined}
                isAdmin={room.isAdmin}
              />
            </div>
          </section>
        </div>
      )}

      {room && (
        <SongSearchModal
          fetcher={actionFetcher}
          isOpen={showSearch}
          onClose={() => setShowSearch(false)}
          providers={loaderData.providers}
          roomId={room.id}
        />
      )}
      {room && (
        <RoomSettingsModal
          fetcher={actionFetcher}
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          room={room}
        />
      )}
    </main>
  );
}

const remotePositionUpdateIntervalMs = 250;
