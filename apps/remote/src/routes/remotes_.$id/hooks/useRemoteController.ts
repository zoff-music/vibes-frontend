import {
  useFetcher,
  useLoaderData,
  useParams,
  useRevalidator,
} from '@kasperrt/smolter/preact';
import {
  createApiV3Client,
  getRoomAnalyticsPath,
  plausibleClient,
  useRemoteEvents,
  useRoomEventsV3,
} from '@vibes/api';
import {
  type PlaybackStateV2,
  type PlaylistItemIdUpdate,
  type PlaylistItemPositionUpdate,
  type RemoteEventV2,
  type RemoteStatusV2,
  type RoomHostUpdate,
} from '@vibes/models';
import {
  showToast,
  synchronizeServerClock,
  usePlaybackStore,
  useQueueStore,
  useRoomStore,
} from '@vibes/shared';
import {
  type ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'preact/compat';
import { type ControllerActionData } from '../clientAction';
import type { ControllerLoaderData } from '../utils/createControllerRoomData';
import { retainController } from '../utils/retainedController';

export function useRemoteController() {
  const loaderData = useLoaderData<ControllerLoaderData>();
  const { id: remoteId = '' } = useParams<{ id: string }>();
  useEffect(
    () => retainController(remoteId, loaderData),
    [remoteId, loaderData],
  );
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
        void revalidator();
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
        void revalidator();
      }
    },
    [revalidator, room?.id],
  );
  const handleRemoteStateUpdate = useCallback(
    (event: RemoteEventV2) => {
      if (event.origin !== 'machine') return;

      if (event.roomId !== (useRoomStore.getState().room?.id ?? '')) {
        void revalidator();
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
      onHostUpdate: ({ userId }: RoomHostUpdate) => setHost(userId),
      onPlaybackUpdate: (playback: PlaybackStateV2) => {
        const roomMode = useRoomStore.getState().room?.mode;
        setPlaybackState(playback, roomMode);
      },
      onReconnect: revalidator,
      onRoomUpdate: setRoom,
      onPlaylistItemAdded: addPlaylistItem,
      onPlaylistItemRemoved: ({ id }: PlaylistItemIdUpdate) =>
        removePlaylistItem(id),
      onPlaylistItemUpdated: ({
        playlistItem,
        position,
      }: PlaylistItemPositionUpdate) =>
        positionPlaylistItem(playlistItem, position),
      onPlaylistItemsUpdate: setPlaylistItems,
      onUsersUpdate: setUsersCount,
    }),
    [
      addPlaylistItem,
      positionPlaylistItem,
      revalidator,
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
    setRoomInput(event.currentTarget.value.toLowerCase());
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

  const isPlaying = isMachinePlaylistItemCurrent
    ? (remoteStatus?.playbackIsPlaying ?? false)
    : (playbackIsPlaying ?? loaderData.playback?.isPlaying ?? false);
  const canSeek =
    room?.mode === 'host' &&
    Boolean(room.hostId && room.hostId === room.userId);
  const queuedPlaylistItems = playlistItems.filter(
    (playlistItem) => playlistItem.id !== currentPlaylistItem?.id,
  );
  return {
    loaderData,
    actionFetcher,
    roomFetcher,
    roomInput,
    showSearch,
    setShowSearch,
    showSettings,
    setShowSettings,
    remoteStatus,
    room,
    usersCount,
    currentPlaylistItem,
    isMachinePlaylistItemCurrent,
    handleRoomInputChange,
    handleVote,
    handleRemove,
    isPlaying,
    canSeek,
    queuedPlaylistItems,
  };
}
