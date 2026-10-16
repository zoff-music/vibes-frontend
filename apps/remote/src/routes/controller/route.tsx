import {
  createApiV3Client,
  getRoomAnalyticsPath,
  plausibleClient,
  useRemoteEvents,
  useRoomEventsV3,
} from '@vibes/api';

import type {
  PlaybackStateV2,
  PlaylistItem,
  RemoteEventV2,
  RemoteStatusV2,
} from '@vibes/models';
import { roomNameMaxLength } from '@vibes/models';
import {
  showToast,
  synchronizeServerClock,
  usePlaybackStore,
  useQueueStore,
  useRoomStore,
} from '@vibes/shared';
import { getRoomLabels } from '@vibes/ui/shared';
import {
  Button,
  CastIcon,
  CloseIcon,
  Input,
  ListenerCount,
  QueueList,
  RemoteIcon,
  SettingsIcon,
  Tooltip,
} from '@vibes/ui/web';
import {
  type ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Form,
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
import { PlaylistItemSearchModal } from './components/SearchModal';
import type { ControllerLoaderData } from './loadController';
import { loader } from './loader';
import { shouldRevalidate } from './shouldRevalidate';

export { controllerMeta as meta } from './meta';
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
  const handledAction = useRef<ControllerActionData | undefined>(undefined);
  const handledRoomAction = useRef<ControllerActionData | undefined>(undefined);
  const [roomInput, setRoomInput] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [remoteStatus, setRemoteStatus] = useState<RemoteStatusV2 | undefined>(
    loaderData.remote,
  );
  const storedRoom = useRoomStore((state) => state.room);
  const candidateRoom = storedRoom ?? loaderData.room;
  const isCurrentRoom = Boolean(
    candidateRoom &&
      remoteStatus &&
      candidateRoom.id === remoteStatus.currentRoomId,
  );
  const room = isCurrentRoom ? candidateRoom : undefined;
  const playlistItems = useQueueStore((state) => state.playlistItems);
  const currentPlaylistItemFromStore = usePlaybackStore(
    (state) => state.currentPlaylistItem,
  );
  const playbackIsPlaying = usePlaybackStore((state) => state.isPlaying);
  const setRoom = useRoomStore((state) => state.setRoom);
  const resetRoom = useRoomStore((state) => state.reset);
  const setHost = useRoomStore((state) => state.setHost);
  const setUsersCount = useRoomStore((state) => state.setUsersCount);
  const setPlaylistItems = useQueueStore((state) => state.setPlaylistItems);
  const addPlaylistItem = useQueueStore((state) => state.addPlaylistItem);
  const removePlaylistItem = useQueueStore((state) => state.removePlaylistItem);
  const positionPlaylistItem = useQueueStore(
    (state) => state.positionPlaylistItem,
  );
  const setPlaybackState = usePlaybackStore((state) => state.setPlaybackState);
  const usersCount = useRoomStore((state) => state.usersCount);
  const setSession = useRoomStore((state) => state.setSession);
  const currentPlaylistItem =
    currentPlaylistItemFromStore ?? loaderData.playback?.currentPlaylistItem;
  const isMachinePlaylistItemCurrent = Boolean(
    currentPlaylistItem?.id &&
      remoteStatus?.currentPlaylistItemId === currentPlaylistItem.id,
  );
  const remoteClient = useMemo(
    () => createApiV3Client({ 'X-Zoff-Remote-ID': remoteId }),
    [remoteId],
  );

  useEffect(() => {
    const path = room?.id ? getRoomAnalyticsPath(room.id) : '/remotes';
    void plausibleClient.trackPageview({ path, surface: 'remote' });
  }, [room?.id]);

  useEffect(() => {
    if (loaderData.room) setRoom(loaderData.room);
    else resetRoom();

    setRemoteStatus(loaderData.remote);
    setPlaylistItems(loaderData.playlistItems);
    if (loaderData.playback && loaderData.room) {
      setPlaybackState(loaderData.playback, loaderData.room.mode);
    }
  }, [loaderData, setPlaybackState, setRoom, setPlaylistItems, resetRoom]);

  useEffect(() => {
    const responses = [
      { data: actionFetcher.data, handled: handledAction },
      { data: roomFetcher.data, handled: handledRoomAction },
    ];

    for (const { data, handled } of responses) {
      if (!data || handled.current === data) continue;

      handled.current = data;

      if (data.error) {
        if (data.intent !== 'joinAdmin') showToast(data.error, 'error');
        continue;
      }

      const currentRoom = useRoomStore.getState().room;
      if (data.roomId && data.roomId !== currentRoom?.id) continue;

      if (data.session) setSession(data.session.userId, data.session.isAdmin);
      if (data.room) setRoom(data.room);
      if (data.playback && currentRoom) {
        const currentPlayback =
          usePlaybackStore.getState().authoritativePlayback;

        if (
          Date.parse(data.playback.updatedAt) >=
          Date.parse(currentPlayback.updatedAt)
        ) {
          setPlaybackState(data.playback, currentRoom.mode);
        }
      }
      if (data.intent === 'changeRoom') {
        setRoomInput('');
        void revalidator.revalidate();
      }
    }
  }, [
    actionFetcher.data,
    revalidator,
    roomFetcher.data,
    setPlaybackState,
    setRoom,
    setSession,
  ]);

  const handleRemoteRoomUpdate = useCallback(
    (event: RemoteEventV2) => {
      if (event.roomId !== room?.id) {
        void revalidator.revalidate();
      }
    },
    [revalidator, room?.id],
  );
  const handleRemoteStateUpdate = useCallback(
    (event: RemoteEventV2) => {
      if (event.origin !== 'machine') return;

      if (event.roomId !== (useRoomStore.getState().room?.id ?? '')) {
        void revalidator.revalidate();
      }

      setRemoteStatus((current) => ({
        currentRoomId: event.roomId,
        currentPlaylistItemId: event.currentPlaylistItemId,
        enabled: true,
        id: current?.id ?? remoteId,
        online: event.online,
        paired: event.paired,
        playbackIsPlaying: event.playbackIsPlaying,
        playbackObservedAt: event.playbackObservedAt,
        partyMode: event.partyMode,
        playbackPositionMs: event.playbackPositionMs,
      }));
    },
    [remoteId, revalidator],
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
      onPlaybackUpdate: (playback: PlaybackStateV2) => {
        const roomMode = useRoomStore.getState().room?.mode;
        setPlaybackState(playback, roomMode);
      },
      onReconnect: revalidator.revalidate,
      onRoomUpdate: setRoom,
      onPlaylistItemAdded: addPlaylistItem,
      onPlaylistItemRemoved: ({ id }: { id: string }) => removePlaylistItem(id),
      onPlaylistItemUpdated: ({
        playlistItem,
        position,
      }: {
        playlistItem: PlaylistItem;
        position: number;
      }) => positionPlaylistItem(playlistItem, position),
      onPlaylistItemsUpdate: setPlaylistItems,
      onUsersUpdate: setUsersCount,
    }),
    [
      addPlaylistItem,
      positionPlaylistItem,
      revalidator.revalidate,
      removePlaylistItem,
      setHost,
      setPlaybackState,
      setRoom,
      setPlaylistItems,
      setUsersCount,
    ],
  );
  useRoomEventsV3(room?.id, callbacks, remoteClient);

  const handleRoomInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setRoomInput(event.target.value.toLowerCase());
  };
  const handleVote = useCallback(
    (playlistItemId: string) => {
      actionFetcher.submit(
        { intent: 'vote', roomId: room?.id ?? '', playlistItemId },
        { method: 'post' },
      );
    },
    [actionFetcher, room?.id],
  );
  const handleRemove = useCallback(
    (playlistItemId: string) => {
      actionFetcher.submit(
        { intent: 'remove', roomId: room?.id ?? '', playlistItemId },
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

  const isPlaying = isMachinePlaylistItemCurrent
    ? (remoteStatus?.playbackIsPlaying ?? false)
    : (playbackIsPlaying ?? loaderData.playback?.isPlaying ?? false);
  const canSeek =
    room?.mode === 'host' &&
    Boolean(room.hostId && room.hostId === room.userId);
  const queuedPlaylistItems = playlistItems.filter(
    (playlistItem) => playlistItem.id !== currentPlaylistItem?.id,
  );

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
        <div className="flex shrink-0 items-center gap-2">
          {room && remoteStatus?.currentRoomId === room.id && (
            <actionFetcher.Form method="post">
              <input type="hidden" name="intent" value="partyMode" />
              <input type="hidden" name="roomId" value={room.id} />
              <input
                type="hidden"
                name="partyMode"
                value={String(!remoteStatus.partyMode)}
              />
              <Tooltip
                className="inline-flex"
                content={`${remoteStatus.partyMode ? 'Hide' : 'Show'} ${getRoomLabels(room.roomType).presentation}`}
              >
                <Button
                  type="submit"
                  size="icon"
                  variant="tertiary"
                  aria-label={`${remoteStatus.partyMode ? 'Hide' : 'Show'} ${getRoomLabels(room.roomType).presentation}`}
                  aria-pressed={remoteStatus.partyMode}
                  disabled={
                    !remoteStatus.online || actionFetcher.state !== 'idle'
                  }
                >
                  <CastIcon className="h-5 w-5" />
                </Button>
              </Tooltip>
            </actionFetcher.Form>
          )}
          <ListenerCount
            count={usersCount}
            roomType={room?.roomType ?? 'MUSIC'}
          />
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
          <Form method="post" action="/remotes/disconnect" reloadDocument>
            <Tooltip className="inline-flex" content="Disconnect remote">
              <Button
                aria-label="Disconnect remote"
                size="icon"
                type="submit"
                variant="tertiary"
              >
                <CloseIcon className="h-5 w-5" />
              </Button>
            </Tooltip>
          </Form>
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
            maxLength={roomNameMaxLength}
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
        <div className="mt-4 grid min-w-0 items-start gap-4 lg:grid-cols-[0.85fr_1.15fr]">
          <RemotePlaybackControls
            canSeek={canSeek}
            currentPlaylistItem={currentPlaylistItem ?? null}
            fetcher={actionFetcher}
            initialPositionMs={loaderData.playback?.positionMs ?? 0}
            isMachinePlaylistItemCurrent={isMachinePlaylistItemCurrent}
            isPlaying={isPlaying}
            onAddPlaylistItem={() => setShowSearch(true)}
            {...(remoteStatus ? { remoteStatus } : {})}
            room={room}
          />

          <section className="panel-strong min-w-0 rounded-3xl p-4 sm:p-5">
            <h2 className="mb-4 font-display text-2xs text-theme-muted tracking-label">
              Up next ({queuedPlaylistItems.length})
            </h2>
            <QueueList
              playlistItems={queuedPlaylistItems}
              roomId={room.id}
              onVote={handleVote}
              {...(room.isAdmin && { onRemove: handleRemove })}
              isAdmin={room.isAdmin}
            />
          </section>
        </div>
      )}

      {room && (
        <PlaylistItemSearchModal
          fetcher={actionFetcher}
          isOpen={showSearch}
          onClose={() => setShowSearch(false)}
          providers={loaderData.providers}
          roomId={room.id}
          roomType={room.roomType}
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
