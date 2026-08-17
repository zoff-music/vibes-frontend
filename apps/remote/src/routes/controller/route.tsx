import { createApiClient, useRemoteEvents, useSSE } from '@vibes/api';
import type { PlaybackState, RemoteEvent, RemoteStatus } from '@vibes/models';
import {
  showToast,
  synchronizeServerClock,
  usePlaybackStore,
  useQueueStore,
  useRoomStore,
} from '@vibes/shared';
import {
  Button,
  Input,
  ListenerCount,
  QueueList,
  RemoteIcon,
  SettingsIcon,
} from '@vibes/ui/web';
import {
  type ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  Link,
  useFetcher,
  useLoaderData,
  useParams,
  useRevalidator,
  useRouteError,
} from 'react-router';
import { RemoteErrorView } from '../../components/RemoteErrorView';
import { getPublicRouteErrorMessage } from '../../routeError';
import { type ControllerActionData, clientAction } from './action';
import { clientLoader } from './clientLoader';
import { RemotePlaybackControls } from './components/RemotePlaybackControls';
import { RoomSettingsModal } from './components/RoomSettingsModal';
import { SongSearchModal } from './components/SongSearchModal';
import type { ControllerLoaderData } from './loadController';
import { loader } from './loader';
import { shouldRevalidate } from './shouldRevalidate';

export { clientAction, clientLoader, loader, shouldRevalidate };

export function ErrorBoundary() {
  const error = useRouteError();
  return (
    <RemoteErrorView
      message={getPublicRouteErrorMessage(error)}
      title="Remote control unavailable"
    />
  );
}

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
  const currentSongFromStore = usePlaybackStore((state) => state.currentSong);
  const actualPositionMs = usePlaybackStore((state) => state.actualPositionMs);
  const playbackIsPlaying = usePlaybackStore((state) => state.isPlaying);
  const setRoom = useRoomStore((state) => state.setRoom);
  const setHost = useRoomStore((state) => state.setHost);
  const setUsersCount = useRoomStore((state) => state.setUsersCount);
  const setSongs = useQueueStore((state) => state.setSongs);
  const addSong = useQueueStore((state) => state.addSong);
  const setPlaybackState = usePlaybackStore((state) => state.setPlaybackState);
  const usersCount = useRoomStore((state) => state.usersCount);
  const setSession = useRoomStore((state) => state.setSession);
  const currentSong = currentSongFromStore ?? loaderData.playback?.currentSong;
  const serverPositionMs =
    actualPositionMs ?? loaderData.playback?.positionMs ?? 0;
  const isMachineSongCurrent = Boolean(
    currentSong?.id && remoteStatus?.currentSongId === currentSong.id,
  );
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
    const data = actionFetcher.data ?? roomFetcher.data;
    if (!data) return;
    if (data.error) {
      if (data.intent !== 'joinAdmin') {
        showToast(data.error, 'error');
      }
      return;
    }
    if (data.session) {
      setSession(data.session.userId, data.session.isAdmin);
    }
    if (data.room) setRoom(data.room);
    if (data.playback && room) setPlaybackState(data.playback, room.mode);
    if (data.intent === 'changeRoom') {
      setRoomInput('');
    }
  }, [
    actionFetcher.data,
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
        online: event.online,
        paired: event.paired,
        playbackIsPlaying: event.playbackIsPlaying,
        playbackObservedAt: event.playbackObservedAt,
        playbackPositionMs: event.playbackPositionMs,
      }));
    },
    [remoteId],
  );
  useRemoteEvents({
    controller: true,
    remoteId,
    onRoomUpdate: handleRemoteRoomUpdate,
    onStateUpdate: handleRemoteStateUpdate,
  });

  const callbacks = useMemo(
    () => ({
      onConnected: synchronizeServerClock,
      onHostUpdate: ({ userId }: { userId: string }) => setHost(userId),
      onPlaybackUpdate: (playback: PlaybackState) => {
        const roomMode = useRoomStore.getState().room?.mode;
        setPlaybackState(playback, roomMode);
      },
      onReconnect: revalidator.revalidate,
      onRoomUpdate: setRoom,
      onSongAdded: addSong,
      onSongsUpdate: setSongs,
      onUsersUpdate: setUsersCount,
    }),
    [
      addSong,
      revalidator.revalidate,
      setHost,
      setPlaybackState,
      setRoom,
      setSongs,
      setUsersCount,
    ],
  );
  useSSE(room?.id, callbacks, remoteClient);

  const handleRoomInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setRoomInput(event.target.value.toLowerCase());
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
            to="/remotes/join"
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
    : (playbackIsPlaying ?? loaderData.playback?.isPlaying ?? false);
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
        className="panel-surface mt-4 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-2xl p-3"
      >
        <input type="hidden" name="intent" value="changeRoom" />
        <div className="min-w-0">
          <Input
            aria-label="Room name"
            containerClassName="mb-0!"
            name="nextRoomId"
            onChange={handleRoomInputChange}
            placeholder="Change room"
            required
            value={roomInput}
          />
        </div>
        <Button
          type="submit"
          className="border border-transparent py-3"
          variant="secondary"
        >
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
        <div className="mt-4 grid min-w-0 gap-4 lg:grid-cols-[0.85fr_1.15fr]">
          <RemotePlaybackControls
            canSeek={canSeek}
            currentSong={currentSong ?? null}
            fetcher={actionFetcher}
            isMachineSongCurrent={isMachineSongCurrent}
            isPlaying={isPlaying}
            onAddSong={() => setShowSearch(true)}
            {...(remoteStatus ? { remoteStatus } : {})}
            room={room}
            serverPositionMs={serverPositionMs}
          />

          <section className="panel-strong min-w-0 rounded-3xl p-4 sm:p-5">
            <h2 className="mb-4 font-display text-2xs text-theme-muted tracking-label">
              Up next ({queuedSongs.length})
            </h2>
            <QueueList
              songs={queuedSongs}
              roomId={room.id}
              onVote={handleVote}
              {...(room.isAdmin && { onRemove: handleRemove })}
              isAdmin={room.isAdmin}
            />
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
