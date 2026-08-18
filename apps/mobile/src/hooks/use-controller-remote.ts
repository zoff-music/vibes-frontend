import { useRemoteEvents, useRoomEvents } from '@vibes/api';
import type {
  PlaybackState,
  RemoteEvent,
  RemoteSession,
  RemoteStatus,
  Room,
  Song,
} from '@vibes/models';
import { useFetcher } from '@vibes/native-router';
import { synchronizeServerClock } from '@vibes/shared';
import type { BarcodeScanningResult } from 'expo-camera';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useControllerCommands } from '@/hooks/use-controller-commands';
import { useControllerPairing } from '@/hooks/use-controller-pairing';
import { useLivePosition } from '@/hooks/use-live-position';
import { createRemoteApi } from '@/lib/api';
import {
  filterMobileSongs,
  isMobileProvider,
  normalizeMobilePlayback,
  normalizeMobileRoom,
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
  refresh: () => Promise<void>;
  remove: (song: Song) => Promise<void>;
  seek: (positionMs: number) => Promise<void>;
  setNextRoomId: (roomId: string) => void;
  setPairingCode: (code: string) => void;
  setRemoteId: (remoteId: string) => void;
  setScannerVisible: (visible: boolean) => void;
  setSettingsVisible: (visible: boolean) => void;
  vote: (song: Song) => Promise<void>;
}

export interface ControllerRemoteState {
  controllerToken: string;
  error: string;
  livePosition: number;
  nextRoomId: string;
  pairingCode: string;
  playback: PlaybackState | null;
  queuedSongs: Song[];
  remote: RemoteStatus | null;
  remoteId: string;
  room: Room | null;
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
  const [remote, setRemote] = useState<RemoteStatus | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [playback, setPlayback] = useState<PlaybackState | null>(null);
  const [error, setError] = useState('');
  const [settingsVisible, setSettingsVisible] = useState(false);
  const handlePaired = useCallback(
    async (remoteId: string, session: RemoteSession) => {
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
  const livePosition = useLivePosition(
    remote?.playbackPositionMs ?? 0,
    remote?.playbackIsPlaying ?? false,
    playback?.currentSong?.duration ?? 0,
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
  const queuedSongs = playback?.currentSong
    ? songs.filter((song) => song.id !== playback.currentSong?.id)
    : songs;

  const refresh = useCallback(async () => {
    if (!remoteId || !controllerToken) return;
    const result = await remoteLoader.load();
    if (!result.data) {
      if (result.error === invalidRemoteError) {
        clearCredentials();
        setRemote(null);
        setRoom(null);
        setSongs([]);
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
      setSongs([]);
      setPlayback(null);
      setError('');
      return;
    }
    if (!snapshot) return;
    setRoom(normalizeMobileRoom(snapshot.room));
    setSongs(filterMobileSongs(snapshot.songs));
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
    (event: RemoteEvent) => {
      if (!event.roomId || event.roomId === remote?.currentRoomId) return;
      void refresh();
    },
    [refresh, remote?.currentRoomId],
  );

  const handleRemoteStateUpdate = useCallback((event: RemoteEvent) => {
    setRemote((current) => {
      if (!current) return current;
      return {
        ...current,
        currentRoomId: event.roomId,
        currentSongId: event.currentSongId,
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
      onPlaybackUpdate: (nextPlayback: PlaybackState) => {
        synchronizeServerClock(nextPlayback.serverTimeMs);
        setPlayback(normalizeMobilePlayback(nextPlayback));
      },
      onReconnect: () => void refresh(),
      onRoomUpdate: (nextRoom: Room) => setRoom(normalizeMobileRoom(nextRoom)),
      onSongAdded: (song: Song) => {
        if (!isMobileProvider(song.sourceType)) return;
        setSongs((current) => {
          if (current.some((item) => item.id === song.id)) return current;
          return [...current, song];
        });
      },
      onSongsUpdate: (nextSongs: Song[]) =>
        setSongs(filterMobileSongs(nextSongs)),
      onUsersUpdate: (count: number) => {
        setRoom((current) => {
          if (!current) return current;
          return { ...current, userCount: count };
        });
      },
    }),
    [refresh],
  );
  useRoomEvents(remote?.currentRoomId || undefined, roomEventCallbacks, client);

  const disconnect = async () => {
    setRemote(null);
    clearCredentials();
    setRoom(null);
    setSongs([]);
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
      queuedSongs,
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
