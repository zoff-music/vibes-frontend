import { useRemoteEvents, useRoomEventsV3 } from '@vibes/api';
import type {
  PlaybackStateV2,
  PlaylistItem,
  RemoteEventV2,
  RemoteSessionV2,
  RemoteStatusV2,
  RoomV2,
} from '@vibes/models';
import { useFetcher } from '@vibes/native-router';
import { synchronizeServerClock } from '@vibes/shared';
import type { BarcodeScanningResult } from 'expo-camera';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useControllerCommands } from '@/hooks/use-controller-commands';
import { useControllerPairing } from '@/hooks/use-controller-pairing';
import { useLivePosition } from '@/hooks/use-live-position';
import { createRemoteApi, createRemoteApiV3 } from '@/lib/api';
import {
  filterMobilePlaylistItems,
  isMobileProvider,
  normalizeMobilePlayback,
  normalizeMobileRoom,
  positionMobilePlaylistItem,
} from '@/lib/mobile-content';
import {
  useControllerSessionActions,
  useRoomSession,
} from '@/providers/app-provider';
import type { ControllerRemoteData } from '@/routes/remotes.controller.$id/loader';

export interface ControllerRemoteActions {
  action: (kind: 'play' | 'pause' | 'skip') => Promise<void>;
  changeRoom: () => Promise<void>;
  disconnect: () => Promise<void>;
  handleScan: (result: BarcodeScanningResult) => void;
  openScanner: () => Promise<void>;
  pair: () => Promise<void>;
  pairWithToken: (remoteId: string, pairingToken: string) => Promise<void>;
  refresh: () => Promise<void>;
  remove: (playlistItem: PlaylistItem) => Promise<void>;
  seek: (positionMs: number) => Promise<void>;
  setNextRoomId: (roomId: string) => void;
  setPairingCode: (code: string) => void;
  setRemoteId: (remoteId: string) => void;
  setScannerVisible: (visible: boolean) => void;
  setSettingsVisible: (visible: boolean) => void;
  vote: (playlistItem: PlaylistItem) => Promise<void>;
}

export interface ControllerRemoteState {
  controllerToken: string;
  error: string;
  livePosition: number;
  nextRoomId: string;
  pairingCode: string;
  playback: PlaybackStateV2 | null;
  queuedPlaylistItems: PlaylistItem[];
  remote: RemoteStatusV2 | null;
  remoteId: string;
  room: RoomV2 | null;
  scannerVisible: boolean;
  settingsVisible: boolean;
}

export function useControllerRemote(): readonly [
  ControllerRemoteState,
  ControllerRemoteActions,
] {
  const { controllerRemote } = useRoomSession();
  const { activateControllerRemote, clearControllerRemote } =
    useControllerSessionActions();
  const [remote, setRemote] = useState<RemoteStatusV2 | null>(null);
  const [room, setRoom] = useState<RoomV2 | null>(null);
  const [playlistItems, setPlaylistItems] = useState<PlaylistItem[]>([]);
  const [playback, setPlayback] = useState<PlaybackStateV2 | null>(null);
  const [error, setError] = useState('');
  const [settingsVisible, setSettingsVisible] = useState(false);
  const handlePaired = useCallback(
    async (remoteId: string, session: RemoteSessionV2) => {
      setRemote(session);
      await activateControllerRemote(
        remoteId,
        session.controllerToken,
        session.currentRoomId,
      );
    },
    [activateControllerRemote],
  );
  const [
    { controllerToken, pairingCode, remoteId, scannerVisible },
    {
      clearCredentials,
      handleScan,
      openScanner,
      pair,
      pairWithToken,
      setPairingCode,
      setRemoteId,
      setScannerVisible,
    },
  ] = useControllerPairing({
    onPaired: handlePaired,
    session: controllerRemote,
    setError,
  });
  const [, remoteLoader] = useFetcher<ControllerRemoteData>({
    params: { controllerToken, id: remoteId },
    routeId: 'remotes.controller.$id',
  });
  const client = useMemo(
    () => createRemoteApi(remoteId, controllerToken),
    [controllerToken, remoteId],
  );
  const roomEventsClient = useMemo(
    () => createRemoteApiV3(remoteId, controllerToken),
    [controllerToken, remoteId],
  );
  const livePosition = useLivePosition(
    remote?.playbackPositionMs ?? 0,
    remote?.playbackIsPlaying ?? false,
    playback?.currentPlaylistItem?.duration ?? 0,
  );
  const [
    nextRoomId,
    { action, changeRoom, remove, seek, setNextRoomId, vote },
  ] = useControllerCommands({
    controllerToken,
    livePosition,
    playback,
    remote,
    remoteId,
    room,
    setError,
    setRemote,
  });
  const queuedPlaylistItems = playback?.currentPlaylistItem
    ? playlistItems.filter(
        (playlistItem) => playlistItem.id !== playback.currentPlaylistItem?.id,
      )
    : playlistItems;

  const refresh = useCallback(async () => {
    if (!remoteId || !controllerToken) return;
    const result = await remoteLoader.load();
    if (!result.data) {
      if (result.error === invalidRemoteError) {
        clearCredentials();
        setRemote(null);
        setRoom(null);
        setPlaylistItems([]);
        setPlayback(null);
        await clearControllerRemote();
      }
      setError(
        result.error === invalidRemoteError
          ? 'Remote pairing expired. Pair the remote again.'
          : result.error || 'Remote is unavailable.',
      );
      return;
    }
    const { remote: nextRemote, snapshot } = result.data;
    setRemote(nextRemote);
    if (controllerRemote?.roomId !== nextRemote.currentRoomId) {
      await activateControllerRemote(
        remoteId,
        controllerToken,
        nextRemote.currentRoomId,
      );
    }
    if (!nextRemote.currentRoomId) {
      setRoom(null);
      setPlaylistItems([]);
      setPlayback(null);
      setError('');
      return;
    }
    if (!snapshot) return;
    setRoom(normalizeMobileRoom(snapshot.room));
    setPlaylistItems(filterMobilePlaylistItems(snapshot.playlistItems));
    synchronizeServerClock(snapshot.playback.serverTimeMs);
    setPlayback(normalizeMobilePlayback(snapshot.playback));
    setError('');
  }, [
    activateControllerRemote,
    clearControllerRemote,
    clearCredentials,
    controllerRemote?.roomId,
    controllerToken,
    remoteId,
    remoteLoader.load,
  ]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const handleRemoteRoomUpdate = useCallback(
    (event: RemoteEventV2) => {
      if (!event.roomId || event.roomId === remote?.currentRoomId) return;
      void refresh();
    },
    [refresh, remote?.currentRoomId],
  );

  const handleRemoteStateUpdate = useCallback((event: RemoteEventV2) => {
    setRemote((current) => {
      if (!current) return current;
      return {
        ...current,
        currentRoomId: event.roomId,
        currentPlaylistItemId: event.currentPlaylistItemId,
        online: event.online,
        paired: event.paired,
        playbackIsPlaying: event.playbackIsPlaying,
        playbackObservedAt: event.playbackObservedAt,
        playbackPositionMs: event.playbackPositionMs,
      };
    });
  }, []);

  useRemoteEvents({
    client,
    controller: true,
    onRoomUpdate: handleRemoteRoomUpdate,
    onStateUpdate: handleRemoteStateUpdate,
    ...(remoteId ? { remoteId } : {}),
  });

  const roomEventCallbacks = useMemo(
    () => ({
      onConnected: synchronizeServerClock,
      onPlaybackUpdate: (nextPlayback: PlaybackStateV2) => {
        synchronizeServerClock(nextPlayback.serverTimeMs);
        setPlayback(normalizeMobilePlayback(nextPlayback));
      },
      onReconnect: () => void refresh(),
      onRoomUpdate: (nextRoom: RoomV2) =>
        setRoom(normalizeMobileRoom(nextRoom)),
      onPlaylistItemAdded: (playlistItem: PlaylistItem) => {
        if (!isMobileProvider(playlistItem.sourceType)) return;
        setPlaylistItems((current) => {
          if (current.some((item) => item.id === playlistItem.id))
            return current;
          return [...current, playlistItem];
        });
      },
      onPlaylistItemRemoved: ({ id }: { id: string }) => {
        setPlaylistItems((current) =>
          current.filter((playlistItem) => playlistItem.id !== id),
        );
      },
      onPlaylistItemUpdated: ({
        playlistItem,
        position,
      }: {
        playlistItem: PlaylistItem;
        position: number;
      }) => {
        setPlaylistItems((current) =>
          positionMobilePlaylistItem(current, playlistItem, position),
        );
      },
      onPlaylistItemsUpdate: (nextPlaylistItems: PlaylistItem[]) =>
        setPlaylistItems(filterMobilePlaylistItems(nextPlaylistItems)),
      onUsersUpdate: (count: number) => {
        setRoom((current) => {
          if (!current) return current;
          return { ...current, userCount: count };
        });
      },
    }),
    [refresh],
  );
  useRoomEventsV3(
    remote?.currentRoomId || undefined,
    roomEventCallbacks,
    roomEventsClient,
  );

  const disconnect = async () => {
    setRemote(null);
    clearCredentials();
    setRoom(null);
    setPlaylistItems([]);
    setPlayback(null);
    await clearControllerRemote();
  };

  return [
    {
      controllerToken,
      error,
      livePosition,
      nextRoomId,
      pairingCode,
      playback,
      queuedPlaylistItems,
      remote,
      remoteId,
      room,
      scannerVisible,
      settingsVisible,
    },
    {
      action,
      changeRoom,
      disconnect,
      handleScan,
      openScanner,
      pair,
      pairWithToken,
      refresh,
      remove,
      seek,
      setNextRoomId,
      setPairingCode,
      setRemoteId,
      setScannerVisible,
      setSettingsVisible,
      vote,
    },
  ];
}

const invalidRemoteError = 'REMOTE_CREDENTIALS_INVALID';
