import {
  getHttpError,
  useRemoteEvents,
  useRemoteRequests,
  useRoomRequests,
  useSSE,
} from '@vibes/api';
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
  getEstimatedServerTimeMs,
  synchronizeServerClock,
} from '@vibes/shared';
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
import { useAppResume } from '@/hooks/use-app-resume';
import {
  getObservedPosition,
  useMachineRemote,
} from '@/hooks/use-machine-remote';
import { getRequestErrorMessage, mobileApi } from '@/lib/api';
import {
  deleteSecureValue,
  getSecureValue,
  setSecureValue,
} from '@/lib/secure-storage';

interface AppState {
  activateControllerRemote: (
    remoteId: string,
    controllerToken: string,
    roomId: string,
  ) => Promise<void>;
  clearControllerRemote: () => Promise<void>;
  controllerRemote: ControllerRemoteSession | null;
  authoritativePlayback: PlaybackState | null;
  hasLocalPlaybackChanges: boolean;
  hasLocalPlaybackPositionDrift: boolean;
  loading: boolean;
  machinePairing: RemotePairing | null;
  machineRemote: RemoteStatus | null;
  observeLocalPlaybackPosition: (positionMs: number) => void;
  leaveRoom: () => Promise<void>;
  playback: PlaybackState | null;
  playbackResetVersion: number;
  playerEnabled: boolean;
  playerPreferenceLoaded: boolean;
  providers: Providers;
  refresh: () => Promise<void>;
  refreshMachineRemote: () => Promise<void>;
  rememberRoomAdminPassword: (
    roomId: string,
    password: string,
  ) => Promise<void>;
  resetLocalPlayback: () => Promise<void>;
  room: Room | null;
  roomId: string;
  setError: (message: string) => void;
  disableMachineRemote: () => Promise<void>;
  enableMachineRemote: () => Promise<void>;
  forgetRoomAdminPassword: (roomId: string) => Promise<void>;
  setLocalPlaying: (isPlaying: boolean, positionMs?: number) => void;
  setLocalPlaybackAligned: (isAligned: boolean) => void;
  setLocalPlaybackPosition: (positionMs: number) => void;
  setPlayerEnabled: (enabled: boolean) => Promise<void>;
  setRoomId: (roomId: string, password?: string) => Promise<RoomJoinResult>;
  songs: Song[];
  startGeneratedRoom: (roomId: string) => Promise<RoomJoinResult>;
}

export type RoomJoinResult = 'error' | 'joined' | 'notFound';

export interface ControllerRemoteSession {
  controllerToken: string;
  id: string;
  roomId: string;
}

const AppContext = createContext<AppState | null>(null);
const remoteStorageKey = 'zoff.mobile.remote';
const remoteTokenStorageKey = 'zoff.mobile.remote-token';
const playerEnabledStorageKey = 'zoff.mobile.player-enabled';
const roomAdminPasswordStoragePrefix = 'zoff.mobile.room-admin';

export function AppProvider({ children }: PropsWithChildren) {
  const { showToast } = useToast();
  const roomRequests = useRoomRequests(mobileApi);
  const remoteRequests = useRemoteRequests(mobileApi);
  const [roomId, setRoomIdValue] = useState('');
  const [room, setRoom] = useState<Room | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [playback, setPlayback] = useState<PlaybackState | null>(null);
  const [authoritativePlayback, setAuthoritativePlayback] =
    useState<PlaybackState | null>(null);
  const [providers, setProviders] = useState<Providers>([]);
  const [playerEnabled, setPlayerEnabledValue] = useState(true);
  const [playerPreferenceLoaded, setPlayerPreferenceLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasLocalPlaybackChanges, setHasLocalPlaybackChanges] = useState(false);
  const [hasLocalPlaybackPositionDrift, setHasLocalPlaybackPositionDrift] =
    useState(false);
  const [playbackResetVersion, setPlaybackResetVersion] = useState(0);
  const [controllerRemote, setControllerRemote] =
    useState<ControllerRemoteSession | null>(null);
  const playbackRef = useRef<PlaybackState | null>(null);
  const authoritativePlaybackRef = useRef<PlaybackState | null>(null);
  const roomModeRef = useRef<Room['mode'] | null>(null);
  const localPlayingRef = useRef<boolean | null>(null);
  const pendingGeneratedRoomRef = useRef('');
  const authenticatedRoomIdsRef = useRef(new Set<string>());
  const {
    applyMachineRemoteEvent,
    disableMachineRemote,
    enableMachineRemote,
    machinePairing,
    machineRemote,
    refreshMachineRemote,
  } = useMachineRemote({ playbackRef, remoteRequests, roomId, setError });

  useEffect(() => {
    showToast(error);
  }, [error, showToast]);

  const setLocalPlaying = useCallback(
    (isPlaying: boolean, positionMs?: number) => {
      const currentPlayback = playbackRef.current;
      if (!currentPlayback) return;
      localPlayingRef.current = isPlaying;
      setHasLocalPlaybackChanges(
        authoritativePlaybackRef.current?.isPlaying !== isPlaying,
      );
      const nextPlayback = {
        ...currentPlayback,
        isPlaying,
        positionMs: positionMs ?? currentPlayback.positionMs,
        serverTimeMs: getEstimatedServerTimeMs(),
      };
      playbackRef.current = nextPlayback;
      setPlayback(nextPlayback);
    },
    [],
  );

  const setLocalPlaybackPosition = useCallback((positionMs: number) => {
    const currentPlayback = playbackRef.current;
    if (!currentPlayback) return;
    const nextPlayback = {
      ...currentPlayback,
      positionMs,
      serverTimeMs: getEstimatedServerTimeMs(),
    };
    playbackRef.current = nextPlayback;
    setPlayback(nextPlayback);
    setHasLocalPlaybackChanges(true);
    const authoritativePlayback = authoritativePlaybackRef.current;
    if (!authoritativePlayback) return;
    setHasLocalPlaybackPositionDrift(
      Math.abs(positionMs - getObservedPosition(authoritativePlayback)) >
        alignedPositionToleranceMs,
    );
  }, []);

  const setLocalPlaybackAligned = useCallback((isAligned: boolean) => {
    const localPlaying = localPlayingRef.current;
    const authoritativePlaying = authoritativePlaybackRef.current?.isPlaying;
    const playingIsAligned =
      localPlaying === null || localPlaying === authoritativePlaying;
    setHasLocalPlaybackChanges(!(isAligned && playingIsAligned));
    if (isAligned && playingIsAligned) {
      localPlayingRef.current = null;
    }
  }, []);

  const observeLocalPlaybackPosition = useCallback((positionMs: number) => {
    const authoritativePlayback = authoritativePlaybackRef.current;
    if (!authoritativePlayback) return;
    const authoritativePosition = getObservedPosition(authoritativePlayback);
    const positionIsAligned =
      Math.abs(positionMs - authoritativePosition) <=
      alignedPositionToleranceMs;
    setHasLocalPlaybackPositionDrift(!positionIsAligned);
    const localPlaying = localPlayingRef.current;
    const playingIsAligned =
      localPlaying === null || localPlaying === authoritativePlayback.isPlaying;
    setHasLocalPlaybackChanges(!(positionIsAligned && playingIsAligned));
    if (positionIsAligned && playingIsAligned) {
      localPlayingRef.current = null;
    }
  }, []);

  const setPlayerEnabled = useCallback(async (enabled: boolean) => {
    setPlayerEnabledValue(enabled);
    await setSecureValue(playerEnabledStorageKey, enabled ? 'true' : 'false');
  }, []);

  const rememberRoomAdminPassword = useCallback(
    async (adminRoomId: string, password: string) => {
      authenticatedRoomIdsRef.current.add(adminRoomId);
      setRoom((currentRoom) => {
        if (currentRoom?.id !== adminRoomId) return currentRoom;
        return { ...currentRoom, isAdmin: true };
      });
      await setSecureValue(
        getRoomAdminPasswordStorageKey(adminRoomId),
        password,
      );
    },
    [],
  );

  const forgetRoomAdminPassword = useCallback(async (adminRoomId: string) => {
    authenticatedRoomIdsRef.current.delete(adminRoomId);
    setRoom((currentRoom) => {
      if (currentRoom?.id !== adminRoomId) return currentRoom;
      return { ...currentRoom, isAdmin: false };
    });
    await deleteSecureValue(getRoomAdminPasswordStorageKey(adminRoomId));
  }, []);

  const leaveRoom = useCallback(async () => {
    pendingGeneratedRoomRef.current = '';
    setRoomIdValue('');
    setRoom(null);
    setSongs([]);
    setPlayback(null);
    setAuthoritativePlayback(null);
    playbackRef.current = null;
    authoritativePlaybackRef.current = null;
    roomModeRef.current = null;
    localPlayingRef.current = null;
    setHasLocalPlaybackChanges(false);
    setHasLocalPlaybackPositionDrift(false);
    setError('');
  }, []);

  const clearControllerRemote = useCallback(async () => {
    setControllerRemote(null);
    await Promise.all([
      deleteSecureValue(remoteStorageKey),
      deleteSecureValue(remoteTokenStorageKey),
    ]);
  }, []);

  const activateControllerRemote = useCallback(
    async (remoteId: string, controllerToken: string, remoteRoomId: string) => {
      pendingGeneratedRoomRef.current = '';
      setRoomIdValue('');
      setRoom(null);
      setSongs([]);
      setPlayback(null);
      setAuthoritativePlayback(null);
      playbackRef.current = null;
      authoritativePlaybackRef.current = null;
      roomModeRef.current = null;
      localPlayingRef.current = null;
      setHasLocalPlaybackChanges(false);
      setHasLocalPlaybackPositionDrift(false);
      setControllerRemote({
        controllerToken,
        id: remoteId,
        roomId: remoteRoomId,
      });
      setError('');
      await Promise.all([
        setSecureValue(remoteStorageKey, remoteId),
        setSecureValue(remoteTokenStorageKey, controllerToken),
      ]);
    },
    [],
  );

  const applyRoomUpdate = useCallback((incomingRoom: Room) => {
    let nextRoom = getLocallyAuthorizedRoom(
      incomingRoom,
      authenticatedRoomIdsRef.current.has(incomingRoom.id),
    );
    if (pendingGeneratedRoomRef.current === incomingRoom.id) {
      nextRoom = { ...nextRoom, isGenerating: true };
    }
    roomModeRef.current = nextRoom.mode;
    setRoom(nextRoom);
  }, []);

  const applyPlaybackUpdate = useCallback((incomingPlayback: PlaybackState) => {
    const previousPlayback = playbackRef.current;
    const isSameSong =
      previousPlayback?.currentSong?.id === incomingPlayback.currentSong?.id;
    let nextPlayback = incomingPlayback;
    authoritativePlaybackRef.current = incomingPlayback;
    setAuthoritativePlayback(incomingPlayback);
    if (roomModeRef.current === 'server' && localPlayingRef.current !== null) {
      nextPlayback = {
        ...incomingPlayback,
        isPlaying: localPlayingRef.current,
      };
      if (localPlayingRef.current === false && isSameSong && previousPlayback) {
        nextPlayback.positionMs = previousPlayback.positionMs;
      }
    }
    if (roomModeRef.current === 'host') {
      localPlayingRef.current = null;
      setHasLocalPlaybackChanges(false);
      setHasLocalPlaybackPositionDrift(false);
    }
    if (!isSameSong) {
      setHasLocalPlaybackPositionDrift(false);
    }
    playbackRef.current = nextPlayback;
    setPlayback(nextPlayback);
  }, []);

  const refresh = useCallback(async () => {
    if (!roomId) {
      return;
    }

    const [requestError, snapshot] = await roomRequests.fetchSnapshot(roomId);
    if (requestError || !snapshot) {
      setError(
        await getRequestErrorMessage(requestError, 'Could not refresh room.'),
      );
      return;
    }

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
  }, [applyPlaybackUpdate, applyRoomUpdate, roomId, roomRequests]);

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
      const [storageError, storedPassword] = await getSecureValue(
        getRoomAdminPasswordStorageKey(normalized),
      );
      const adminPassword = password || storedPassword || '';
      let savedPasswordAuthenticationFailed = false;
      if (adminPassword) {
        const [requestError] = await roomRequests.joinRoom(
          normalized,
          adminPassword,
        );
        if (requestError) {
          if (password) {
            setLoading(false);
            setError(
              await getRequestErrorMessage(
                requestError,
                'Could not authenticate with that admin password.',
              ),
            );
            return 'error';
          }
          authenticatedRoomIdsRef.current.delete(normalized);
          savedPasswordAuthenticationFailed = true;
        } else {
          await rememberRoomAdminPassword(normalized, adminPassword);
        }
      }

      const [requestError, snapshot] =
        await roomRequests.fetchSnapshot(normalized);
      setLoading(false);
      if (requestError || !snapshot) {
        const status = requestError
          ? getHttpError(requestError)?.response.status
          : null;
        setError(
          await getRequestErrorMessage(
            requestError,
            'Could not open that room. Check the room name and try again.',
          ),
        );
        return status === notFoundStatus ? 'notFound' : 'error';
      }
      setRoomIdValue(normalized);
      localPlayingRef.current = null;
      setHasLocalPlaybackChanges(false);
      setHasLocalPlaybackPositionDrift(false);
      applyRoomUpdate(snapshot.room);
      setSongs(snapshot.songs);
      synchronizeServerClock(snapshot.playback.serverTimeMs);
      applyPlaybackUpdate(snapshot.playback);
      setError(
        storageError
          ? 'Room opened, but the saved admin password could not be read.'
          : savedPasswordAuthenticationFailed
            ? 'Room opened, but the saved admin password was not accepted.'
            : '',
      );
      setControllerRemote(null);
      void Promise.all([
        deleteSecureValue(remoteStorageKey),
        deleteSecureValue(remoteTokenStorageKey),
      ]);
      return 'joined';
    },
    [
      applyPlaybackUpdate,
      applyRoomUpdate,
      rememberRoomAdminPassword,
      roomRequests,
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

  const resetLocalPlayback = useCallback(async () => {
    if (!roomId) return;
    const [requestError, authoritativePlayback] =
      await roomRequests.fetchPlayback(roomId);
    if (requestError || !authoritativePlayback) {
      setError(
        await getRequestErrorMessage(
          requestError,
          'Could not reset playback position.',
        ),
      );
      return;
    }
    authoritativePlaybackRef.current = authoritativePlayback;
    synchronizeServerClock(authoritativePlayback.serverTimeMs);
    setAuthoritativePlayback(authoritativePlayback);
    playbackRef.current = authoritativePlayback;
    localPlayingRef.current = null;
    setPlayback(authoritativePlayback);
    setHasLocalPlaybackChanges(false);
    setHasLocalPlaybackPositionDrift(false);
    setPlaybackResetVersion((version) => version + 1);
    setError('');
  }, [roomId, roomRequests]);

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
        !event.currentSongId ||
        event.currentSongId === playbackRef.current?.currentSong?.id;
      setLocalPlaying(
        event.playbackIsPlaying,
        isCurrentSong ? event.playbackPositionMs : undefined,
      );
    },
    [applyMachineRemoteEvent, room?.mode, roomId, setLocalPlaying],
  );

  const handleUsersUpdate = useCallback((count: number) => {
    setRoom((currentRoom) => {
      if (!currentRoom) return currentRoom;
      return { ...currentRoom, userCount: count };
    });
  }, []);

  const handleGenerationUpdate = useCallback(
    (update: RoomGenerationUpdate) => {
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
        void refresh();
      }
    },
    [refresh],
  );

  const roomEventCallbacks = useMemo(
    () => ({
      onGenerationUpdate: handleGenerationUpdate,
      onPlaybackUpdate: applyPlaybackUpdate,
      onRoomUpdate: applyRoomUpdate,
      onSongsUpdate: setSongs,
      onUsersUpdate: handleUsersUpdate,
    }),
    [
      applyPlaybackUpdate,
      applyRoomUpdate,
      handleGenerationUpdate,
      handleUsersUpdate,
    ],
  );

  useSSE(roomId || undefined, roomEventCallbacks, mobileApi);

  useRemoteEvents({
    client: mobileApi,
    onRoomUpdate: handleRemoteRoomUpdate,
    onStateUpdate: handleRemoteStateUpdate,
    ...(machineRemote?.enabled ? { remoteId: machineRemote.id } : {}),
  });

  useEffect(() => {
    const loadPlayerPreference = async () => {
      const [, storedPreference] = await getSecureValue(
        playerEnabledStorageKey,
      );
      if (storedPreference === 'false') {
        setPlayerEnabledValue(false);
      }
      setPlayerPreferenceLoaded(true);
    };
    void loadPlayerPreference();
  }, []);

  useEffect(() => {
    const loadStoredControllerRemote = async () => {
      const [, storedRemoteId] = await getSecureValue(remoteStorageKey);
      const [, storedControllerToken] = await getSecureValue(
        remoteTokenStorageKey,
      );
      if (!storedRemoteId || !storedControllerToken) return;
      setControllerRemote({
        controllerToken: storedControllerToken,
        id: storedRemoteId,
        roomId: '',
      });
    };
    void loadStoredControllerRemote();
  }, []);

  useEffect(() => {
    const loadProviders = async () => {
      const [requestError, nextProviders] = await roomRequests.fetchProviders();
      if (requestError || !nextProviders) {
        setError(
          await getRequestErrorMessage(
            requestError,
            'Could not load music providers.',
          ),
        );
        return;
      }
      setProviders(nextProviders);
    };
    void loadProviders();
  }, [roomRequests]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo<AppState>(
    () => ({
      activateControllerRemote,
      authoritativePlayback,
      clearControllerRemote,
      controllerRemote,
      hasLocalPlaybackChanges,
      hasLocalPlaybackPositionDrift,
      disableMachineRemote,
      enableMachineRemote,
      forgetRoomAdminPassword,
      leaveRoom,
      loading,
      machinePairing,
      machineRemote,
      observeLocalPlaybackPosition,
      playback,
      playbackResetVersion,
      playerEnabled,
      playerPreferenceLoaded,
      providers,
      refresh,
      refreshMachineRemote,
      rememberRoomAdminPassword,
      resetLocalPlayback,
      room,
      roomId,
      setError,
      setLocalPlaying,
      setLocalPlaybackAligned,
      setLocalPlaybackPosition,
      setPlayerEnabled,
      setRoomId,
      songs,
      startGeneratedRoom,
    }),
    [
      activateControllerRemote,
      authoritativePlayback,
      clearControllerRemote,
      controllerRemote,
      hasLocalPlaybackChanges,
      hasLocalPlaybackPositionDrift,
      disableMachineRemote,
      enableMachineRemote,
      forgetRoomAdminPassword,
      leaveRoom,
      loading,
      machinePairing,
      machineRemote,
      observeLocalPlaybackPosition,
      playback,
      playbackResetVersion,
      playerEnabled,
      playerPreferenceLoaded,
      providers,
      refresh,
      refreshMachineRemote,
      rememberRoomAdminPassword,
      resetLocalPlayback,
      room,
      roomId,
      setRoomId,
      setLocalPlaying,
      setLocalPlaybackAligned,
      setLocalPlaybackPosition,
      setPlayerEnabled,
      songs,
      startGeneratedRoom,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

const notFoundStatus = 404;

function getLocallyAuthorizedRoom(room: Room, isAuthenticated: boolean) {
  if (!room.hasPassword) return room;
  return { ...room, isAdmin: isAuthenticated };
}

const alignedPositionToleranceMs = 5_000;

function getRoomAdminPasswordStorageKey(roomId: string) {
  const encodedRoomId = Array.from(roomId, (character) =>
    character.codePointAt(0)?.toString(16),
  ).join('-');
  return `${roomAdminPasswordStoragePrefix}.${encodedRoomId}`;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used inside AppProvider');
  }
  return context;
}
