import { useRemoteEvents, useRoomEventsV2 } from '@vibes/api';
import type {
  PlaybackState,
  Providers,
  RemoteEvent,
  RemotePairing,
  RemoteStatus,
  Room,
  RoomGenerationUpdate,
  Song,
} from '@vibes/models';
import {
  useFetcher,
  useRouteLoaderData,
  useRouter,
} from '@vibes/native-router';
import { synchronizeServerClock } from '@vibes/shared';
import type { PropsWithChildren } from 'react';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useToast } from '@/components/toast';
import type { RoomSnapshot } from '@/data-router/room-snapshot';
import { useAppResume } from '@/hooks/use-app-resume';
import { useMachineRemote } from '@/hooks/use-machine-remote';
import { usePlaybackRuntime } from '@/hooks/use-playback-runtime';
import { usePlayerPreference } from '@/hooks/use-player-preference';
import { mobileApi, mobileApiV2 } from '@/lib/api';
import {
  filterMobileSongs,
  isMobileProvider,
  normalizeMobilePlayback,
  normalizeMobileRoom,
  positionMobileSong,
} from '@/lib/mobile-content';
import type { DiscoveryData } from '@/routes/_index/loader';
import type { StoredRemoteSession } from '@/routes/remotes.session/loader';
import type { RoomSessionActionData } from '@/routes/rooms.$id.session/action';

interface ControllerSessionActions {
  activateControllerRemote: (
    remoteId: string,
    controllerToken: string,
    roomId: string,
  ) => Promise<void>;
  clearControllerRemote: () => Promise<void>;
}

interface PlaybackActions {
  observeLocalPlaybackPosition: (positionMs: number) => void;
  resetLocalPlayback: () => Promise<void>;
  setLocalPlaying: (isPlaying: boolean, positionMs?: number) => void;
  setLocalPlaybackAligned: (isAligned: boolean) => void;
  setLocalPlaybackPosition: (positionMs: number) => void;
  setPlayerEnabled: (enabled: boolean) => Promise<void>;
}

interface RoomActions {
  forgetRoomAdminPassword: (roomId: string) => Promise<void>;
  leaveRoom: () => Promise<void>;
  refresh: () => Promise<void>;
  rememberRoomAdminPassword: (
    roomId: string,
    password: string,
  ) => Promise<void>;
  setError: (message: string) => void;
  setRoomId: (roomId: string, password?: string) => Promise<RoomJoinResult>;
  startGeneratedRoom: (roomId: string) => Promise<RoomJoinResult>;
}

interface PlaybackSessionState {
  authoritativePlayback: PlaybackState | null;
  hasLocalPlaybackChanges: boolean;
  hasLocalPlaybackPositionDrift: boolean;
  playback: PlaybackState | null;
  playbackResetVersion: number;
  playerEnabled: boolean;
  playerPreferenceLoaded: boolean;
}

interface RoomSessionState {
  controllerRemote: ControllerRemoteSession | null;
  loading: boolean;
  providers: Providers;
  room: Room | null;
  roomId: string;
  songs: Song[];
}

export type RoomJoinResult = 'error' | 'joined' | 'notFound';

export interface ControllerRemoteSession {
  controllerToken: string;
  id: string;
  roomId: string;
}

const ControllerSessionActionsContext =
  createContext<ControllerSessionActions | null>(null);
const PlaybackActionsContext = createContext<PlaybackActions | null>(null);
const RoomActionsContext = createContext<RoomActions | null>(null);
const PlaybackSessionContext = createContext<PlaybackSessionState | null>(null);
const RoomSessionContext = createContext<RoomSessionState | null>(null);

interface RoomNavigationState {
  canAddSongs: boolean;
  hasRoom: boolean;
}

interface MachineRemoteState {
  disableMachineRemote: () => Promise<void>;
  enableMachineRemote: () => Promise<void>;
  machinePairing: RemotePairing | null;
  machineRemote: RemoteStatus | null;
}

const RoomNavigationContext = createContext<RoomNavigationState | null>(null);
const MachineRemoteContext = createContext<MachineRemoteState | null>(null);
export function AppProvider({ children }: PropsWithChildren) {
  const nativeRouter = useRouter();
  const [, roomLoader] = useFetcher<RoomSnapshot>({ routeId: 'rooms.$id' });
  const [, roomSessionAction] = useFetcher<RoomSessionActionData>({
    routeId: 'rooms.$id.session',
  });
  const [, remoteSessionFetcher] = useFetcher<boolean>({
    routeId: 'remotes.session',
  });
  const { showToast } = useToast();
  const [roomId, setRoomIdValue] = useState('');
  const [room, setRoom] = useState<Room | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const discovery = useRouteLoaderData<DiscoveryData>('_index');
  const providers = discovery?.providers ?? [];
  const [playerPreference, setPlayerEnabled] = usePlayerPreference();
  const {
    enabled: playerEnabled,
    loaded: playerPreferenceLoaded,
    warning: playerPreferenceWarning,
  } = playerPreference;
  const storedRemoteSession = useRouteLoaderData<StoredRemoteSession | null>(
    'remotes.session',
  );
  const [controllerRemote, setControllerRemote] =
    useState<ControllerRemoteSession | null>(null);
  const roomModeRef = useRef<Room['mode'] | null>(null);
  const pendingGeneratedRoomRef = useRef('');
  const authenticatedRoomIdsRef = useRef(new Set<string>());
  const [
    {
      authoritativePlayback,
      hasLocalPlaybackChanges,
      hasLocalPlaybackPositionDrift,
      playback,
      playbackRef,
      playbackResetVersion,
    },
    {
      applyPlaybackUpdate,
      clearLocalOverrides,
      clearPlayback,
      observeLocalPlaybackPosition,
      resetLocalPlayback,
      setLocalPlaybackAligned,
      setLocalPlaybackPosition,
      setLocalPlaying,
    },
  ] = usePlaybackRuntime({ roomId, roomModeRef, setError });
  const currentSongId = playback?.currentSong?.id;
  const [
    { machinePairing, machineRemote },
    { applyMachineRemoteEvent, disableMachineRemote, enableMachineRemote },
  ] = useMachineRemote({ playbackRef, roomId, setError });

  useEffect(() => {
    showToast(error);
  }, [error, showToast]);

  useEffect(() => {
    if (discovery?.warning) showToast(discovery.warning);
  }, [discovery?.warning, showToast]);

  useEffect(() => {
    if (playerPreferenceWarning) showToast(playerPreferenceWarning);
  }, [playerPreferenceWarning, showToast]);

  const rememberRoomAdminPassword = useCallback(
    async (adminRoomId: string, password: string) => {
      if (!password) return;
      authenticatedRoomIdsRef.current.add(adminRoomId);
      setRoom((currentRoom) => {
        if (currentRoom?.id !== adminRoomId) return currentRoom;
        return { ...currentRoom, isAdmin: true };
      });
    },
    [],
  );

  const forgetRoomAdminPassword = useCallback(async (adminRoomId: string) => {
    authenticatedRoomIdsRef.current.delete(adminRoomId);
    setRoom((currentRoom) => {
      if (currentRoom?.id !== adminRoomId) return currentRoom;
      return { ...currentRoom, isAdmin: false };
    });
  }, []);

  const leaveRoom = useCallback(async () => {
    if (roomId) nativeRouter.disposeRoute('rooms.$id', { id: roomId });
    pendingGeneratedRoomRef.current = '';
    setRoomIdValue('');
    setRoom(null);
    setSongs([]);
    roomModeRef.current = null;
    clearPlayback();
    setError('');
  }, [clearPlayback, nativeRouter, roomId]);

  const clearControllerRemote = useCallback(async () => {
    setControllerRemote(null);
    const result = await remoteSessionFetcher.submit({ intent: 'clear' });
    if (result.error) setError(result.error);
  }, [remoteSessionFetcher.submit]);

  const activateControllerRemote = useCallback(
    async (remoteId: string, controllerToken: string, remoteRoomId: string) => {
      pendingGeneratedRoomRef.current = '';
      setRoomIdValue('');
      setRoom(null);
      setSongs([]);
      roomModeRef.current = null;
      clearPlayback();
      setControllerRemote({
        controllerToken,
        id: remoteId,
        roomId: remoteRoomId,
      });
      setError('');
      const result = await remoteSessionFetcher.submit({
        controllerToken,
        intent: 'save',
        remoteId,
      });
      if (result.error) setError(result.error);
    },
    [clearPlayback, remoteSessionFetcher.submit],
  );

  const applyRoomUpdate = useCallback((incomingRoom: Room) => {
    let nextRoom = getLocallyAuthorizedRoom(
      normalizeMobileRoom(incomingRoom),
      authenticatedRoomIdsRef.current.has(incomingRoom.id),
    );
    if (pendingGeneratedRoomRef.current === incomingRoom.id) {
      nextRoom = { ...nextRoom, isGenerating: true };
    }
    roomModeRef.current = nextRoom.mode;
    setRoom(nextRoom);
  }, []);

  const refresh = useCallback(async () => {
    if (!roomId) {
      return;
    }

    const result = await roomLoader.load({ params: { id: roomId } });
    if (!result.data) {
      setError(result.error || 'Could not refresh room.');
      return;
    }
    const snapshot = result.data;
    nativeRouter.hydrateRoute('rooms.$id', snapshot, { id: roomId });

    const generationPending = pendingGeneratedRoomRef.current === roomId;
    if (
      generationPending &&
      !snapshot.room.isGenerating &&
      (snapshot.songs.length > 0 || Boolean(snapshot.room.generationError))
    ) {
      pendingGeneratedRoomRef.current = '';
    }
    applyRoomUpdate(snapshot.room);
    setSongs(snapshot.songs);
    synchronizeServerClock(snapshot.playback.serverTimeMs);
    applyPlaybackUpdate(snapshot.playback);
    setError('');
  }, [
    applyPlaybackUpdate,
    applyRoomUpdate,
    nativeRouter,
    roomId,
    roomLoader.load,
  ]);

  useAppResume(refresh);

  const setRoomId = useCallback(
    async (nextRoomId: string, password = '') => {
      const normalized = nextRoomId.trim().toLowerCase().replace(/\s+/g, '-');
      if (!normalized) {
        setError('Enter a room name.');
        return 'error';
      }
      if (
        pendingGeneratedRoomRef.current &&
        pendingGeneratedRoomRef.current !== normalized
      ) {
        pendingGeneratedRoomRef.current = '';
      }
      setLoading(true);
      const result = await roomSessionAction.submit(
        { intent: 'open', ...(password ? { password } : {}) },
        { params: { id: normalized } },
      );
      setLoading(false);
      if (result.data?.intent !== 'joined') {
        const notFound = result.error === roomNotFoundError;
        setError(notFound ? 'Room not found.' : result.error);
        return notFound ? 'notFound' : 'error';
      }
      const { snapshot, warning } = result.data;
      nativeRouter.hydrateRoute('rooms.$id', snapshot, { id: normalized });
      setRoomIdValue(normalized);
      if (snapshot.room.isAdmin) {
        authenticatedRoomIdsRef.current.add(normalized);
      } else {
        authenticatedRoomIdsRef.current.delete(normalized);
      }
      clearLocalOverrides();
      applyRoomUpdate(snapshot.room);
      setSongs(snapshot.songs);
      synchronizeServerClock(snapshot.playback.serverTimeMs);
      applyPlaybackUpdate(snapshot.playback);
      setError(warning);
      setControllerRemote(null);
      return 'joined';
    },
    [
      applyPlaybackUpdate,
      applyRoomUpdate,
      clearLocalOverrides,
      nativeRouter,
      roomSessionAction.submit,
    ],
  );

  const startGeneratedRoom = useCallback(
    async (generatedRoomId: string) => {
      const normalized = generatedRoomId
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-');
      pendingGeneratedRoomRef.current = normalized;
      const result = await setRoomId(normalized);
      if (result !== 'joined') {
        pendingGeneratedRoomRef.current = '';
      }
      return result;
    },
    [setRoomId],
  );

  const handleRemoteRoomUpdate = useCallback(
    (event: RemoteEvent) => {
      if (event.origin !== 'controller' || !event.roomId) return;
      void setRoomId(event.roomId);
    },
    [setRoomId],
  );

  const handleRemoteStateUpdate = useCallback(
    (event: RemoteEvent) => {
      applyMachineRemoteEvent(event);
      if (
        event.origin !== 'controller' ||
        event.roomId !== roomId ||
        room?.mode !== 'server'
      ) {
        return;
      }
      const isCurrentSong =
        !event.currentSongId || event.currentSongId === currentSongId;
      setLocalPlaying(
        event.playbackIsPlaying,
        isCurrentSong ? event.playbackPositionMs : undefined,
      );
    },
    [
      applyMachineRemoteEvent,
      currentSongId,
      room?.mode,
      roomId,
      setLocalPlaying,
    ],
  );

  const handleUsersUpdate = useCallback((count: number) => {
    setRoom((currentRoom) => {
      if (!currentRoom) return currentRoom;
      return { ...currentRoom, userCount: count };
    });
  }, []);

  const handleGenerationUpdate = useCallback((update: RoomGenerationUpdate) => {
    setRoom((currentRoom) => {
      if (!currentRoom) return currentRoom;
      if (update.status === 'generating') {
        return {
          ...currentRoom,
          generationError: undefined,
          isGenerating: true,
        };
      }
      if (update.status === 'failed') {
        return {
          ...currentRoom,
          generationError:
            update.error ?? 'Playlist generation could not be completed.',
          isGenerating: false,
        };
      }
      return {
        ...currentRoom,
        generationError: undefined,
        isGenerating: false,
      };
    });
    if (update.status !== 'generating') {
      pendingGeneratedRoomRef.current = '';
    }
  }, []);

  const roomEventCallbacks = useMemo(
    () => ({
      onConnected: synchronizeServerClock,
      onGenerationUpdate: handleGenerationUpdate,
      onPlaybackUpdate: (nextPlayback: PlaybackState) =>
        applyPlaybackUpdate(normalizeMobilePlayback(nextPlayback)),
      onRoomUpdate: applyRoomUpdate,
      onSongAdded: (song: Song) => {
        if (!isMobileProvider(song.sourceType)) return;
        setSongs((current) => {
          if (current.some((item) => item.id === song.id)) return current;
          return [...current, song];
        });
      },
      onSongRemoved: ({ id }: { id: string }) => {
        setSongs((current) => current.filter((song) => song.id !== id));
      },
      onSongUpdated: ({ song, position }: { song: Song; position: number }) => {
        setSongs((current) => positionMobileSong(current, song, position));
      },
      onSongsUpdate: (nextSongs: Song[]) =>
        setSongs(filterMobileSongs(nextSongs)),
      onUsersUpdate: handleUsersUpdate,
    }),
    [
      applyPlaybackUpdate,
      applyRoomUpdate,
      handleGenerationUpdate,
      handleUsersUpdate,
    ],
  );

  useRoomEventsV2(roomId || undefined, roomEventCallbacks, mobileApiV2);

  useRemoteEvents({
    client: mobileApi,
    onRoomUpdate: handleRemoteRoomUpdate,
    onStateUpdate: handleRemoteStateUpdate,
    ...(machineRemote?.enabled ? { remoteId: machineRemote.id } : {}),
  });

  useEffect(() => {
    if (storedRemoteSession) {
      setControllerRemote({
        controllerToken: storedRemoteSession.controllerToken,
        id: storedRemoteSession.id,
        roomId: '',
      });
    }
  }, [storedRemoteSession]);

  const controllerActionsValue = useMemo<ControllerSessionActions>(
    () => ({
      activateControllerRemote,
      clearControllerRemote,
    }),
    [activateControllerRemote, clearControllerRemote],
  );
  const playbackActionsValue = useMemo<PlaybackActions>(
    () => ({
      observeLocalPlaybackPosition,
      resetLocalPlayback,
      setLocalPlaying,
      setLocalPlaybackAligned,
      setLocalPlaybackPosition,
      setPlayerEnabled,
    }),
    [
      observeLocalPlaybackPosition,
      resetLocalPlayback,
      setLocalPlaying,
      setLocalPlaybackAligned,
      setLocalPlaybackPosition,
      setPlayerEnabled,
    ],
  );
  const roomActionsValue = useMemo<RoomActions>(
    () => ({
      forgetRoomAdminPassword,
      leaveRoom,
      refresh,
      rememberRoomAdminPassword,
      setError,
      setRoomId,
      startGeneratedRoom,
    }),
    [
      forgetRoomAdminPassword,
      leaveRoom,
      refresh,
      rememberRoomAdminPassword,
      setRoomId,
      startGeneratedRoom,
    ],
  );
  const playbackSessionValue = useMemo<PlaybackSessionState>(
    () => ({
      authoritativePlayback,
      hasLocalPlaybackChanges,
      hasLocalPlaybackPositionDrift,
      playback,
      playbackResetVersion,
      playerEnabled,
      playerPreferenceLoaded,
    }),
    [
      authoritativePlayback,
      hasLocalPlaybackChanges,
      hasLocalPlaybackPositionDrift,
      playback,
      playbackResetVersion,
      playerEnabled,
      playerPreferenceLoaded,
    ],
  );
  const roomSessionValue = useMemo<RoomSessionState>(
    () => ({ controllerRemote, loading, providers, room, roomId, songs }),
    [controllerRemote, loading, providers, room, roomId, songs],
  );

  const hasRoom = Boolean(room);
  const canAddSongs = hasRoom || Boolean(controllerRemote?.roomId);
  const roomNavigationValue = useMemo<RoomNavigationState>(
    () => ({ canAddSongs, hasRoom }),
    [canAddSongs, hasRoom],
  );
  const machineRemoteValue = useMemo<MachineRemoteState>(
    () => ({
      disableMachineRemote,
      enableMachineRemote,
      machinePairing,
      machineRemote,
    }),
    [disableMachineRemote, enableMachineRemote, machinePairing, machineRemote],
  );

  return (
    <RoomNavigationContext.Provider value={roomNavigationValue}>
      <MachineRemoteContext.Provider value={machineRemoteValue}>
        <ControllerSessionActionsContext.Provider
          value={controllerActionsValue}
        >
          <RoomActionsContext.Provider value={roomActionsValue}>
            <PlaybackActionsContext.Provider value={playbackActionsValue}>
              <PlaybackSessionContext.Provider value={playbackSessionValue}>
                <RoomSessionContext.Provider value={roomSessionValue}>
                  {children}
                </RoomSessionContext.Provider>
              </PlaybackSessionContext.Provider>
            </PlaybackActionsContext.Provider>
          </RoomActionsContext.Provider>
        </ControllerSessionActionsContext.Provider>
      </MachineRemoteContext.Provider>
    </RoomNavigationContext.Provider>
  );
}

const roomNotFoundError = 'ROOM_NOT_FOUND';

function getLocallyAuthorizedRoom(room: Room, isAuthenticated: boolean) {
  if (!room.hasPassword) return room;
  return { ...room, isAdmin: isAuthenticated };
}

export function useControllerSessionActions() {
  const context = useContext(ControllerSessionActionsContext);
  if (!context) {
    throw new Error(
      'useControllerSessionActions must be used inside AppProvider',
    );
  }
  return context;
}

export function usePlaybackActions() {
  const context = useContext(PlaybackActionsContext);
  if (!context) {
    throw new Error('usePlaybackActions must be used inside AppProvider');
  }
  return context;
}

export function useRoomActions() {
  const context = useContext(RoomActionsContext);
  if (!context) {
    throw new Error('useRoomActions must be used inside AppProvider');
  }
  return context;
}

export function usePlaybackSession() {
  const context = useContext(PlaybackSessionContext);
  if (!context) {
    throw new Error('usePlaybackSession must be used inside AppProvider');
  }
  return context;
}

export function useRoomSession() {
  const context = useContext(RoomSessionContext);
  if (!context) {
    throw new Error('useRoomSession must be used inside AppProvider');
  }
  return context;
}

export function useRoomNavigation() {
  const context = useContext(RoomNavigationContext);
  if (!context) {
    throw new Error('useRoomNavigation must be used inside AppProvider');
  }
  return context;
}

export function useMachineRemoteSettings() {
  const context = useContext(MachineRemoteContext);
  if (!context) {
    throw new Error('useMachineRemoteSettings must be used inside AppProvider');
  }
  return context;
}
