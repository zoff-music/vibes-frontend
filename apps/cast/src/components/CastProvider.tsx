import { API_BASE_URL } from '@vibes/api';
import type { ResolvedColorScheme, Song } from '@vibes/shared';
import { safeWrap, usePlaybackStore } from '@vibes/shared';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useFetcher, useLocation, useNavigate } from 'react-router';
import { useCastMessageHandler } from '../hooks/useCastMessageHandler';
import { useCastReceiver } from '../hooks/useCastReceiver';
import { useMediaMetadata } from '../hooks/useMediaMetadata';
import { useRoomSync } from '../hooks/useRoomSync';
import type { CastActionData } from '../routes/cast/action';
import type { CastLoaderData } from '../routes/cast/loader';
import type { LocalCastMessage, QueueItem, RoomInfo } from '../types';
import { applyColorScheme, getInitialColorScheme } from '../utils/theme';

interface CastContextType {
  roomInfo: RoomInfo | null;
  queue: QueueItem[];
  statusText: string;
  roomMode: string | null;
  currentSong: Song | null;
  debugMode: boolean;
  roomId: string | null;
  casterId: string | null;
  castToken: string | null;
  error: string | null;
  apiUrl: string;
  enabledProviders: string[];
  reportPlaybackFailure: (songId: string) => void;
}

const CastContext = createContext<CastContextType | undefined>(undefined);

interface CastProviderProps {
  children: React.ReactNode;
  loaderData: CastLoaderData;
}

export function CastProvider({ children, loaderData }: CastProviderProps) {
  // --- State ---
  const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [statusText, setStatusText] = useState('Ready for Casting');
  const [roomMode, setRoomMode] = useState<string | null>(null);
  const [enabledProviders, setEnabledProviders] = useState<string[]>([]);
  const [colorScheme, setColorScheme] = useState<ResolvedColorScheme>(
    getInitialColorScheme,
  );
  const [debugMode, setDebugModeState] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('debug') === 'true';
  });

  const { castToken, casterId, roomId } = loaderData.credentials;
  const failureFetcher = useFetcher<CastActionData>();
  const location = useLocation();
  const navigate = useNavigate();

  const debugModeRef = useRef(debugMode);
  const setDebugMode = useCallback((value: boolean) => {
    setDebugModeState(value);
    debugModeRef.current = value;
  }, []);

  // --- Store ---
  const currentSong = usePlaybackStore((state) => state.currentSong);

  // --- Hooks ---
  const updateMediaMetadata = useMediaMetadata();

  const joinRoom = useCallback(
    (connection: { castToken?: string; casterId?: string; roomId: string }) => {
      const params = new URLSearchParams(location.search);
      params.set('roomId', connection.roomId);
      if (connection.castToken) {
        params.set('castToken', connection.castToken);
      }
      if (connection.casterId) {
        params.set('casterId', connection.casterId);
      }
      void navigate(
        { pathname: location.pathname, search: `?${params.toString()}` },
        {
          replace: true,
        },
      );
    },
    [location.pathname, location.search, navigate],
  );

  const handleCastMessage = useCastMessageHandler({
    joinRoom,
    setRoomInfo,
    setQueue,
    setStatusText,
    updateMediaMetadata,
    roomMode,
    setColorScheme,
  });

  useCastReceiver({
    debugMode,
    setDebugMode,
    handleCastMessage,
    updateMediaMetadata,
    setStatusText,
  });

  useRoomSync({
    roomId,
    casterId,
    castToken,
    loadError: loaderData.error,
    snapshot: loaderData.snapshot,
    setQueue,
    setRoomInfo,
    setStatusText,
    setRoomMode,
    setError,
    setEnabledProviders,
    updateMediaMetadata,
  });
  const reportPlaybackFailure = useCallback(
    (songId: string) => {
      if (!castToken || !roomId) return;
      failureFetcher.submit(
        { castToken, intent: 'reportPlaybackFailure', roomId, songId },
        { method: 'post' },
      );
    },
    [castToken, failureFetcher, roomId],
  );

  useEffect(() => {
    if (!failureFetcher.data?.error) return;
    console.error('[Cast] Failed to report restricted playback failure.');
  }, [failureFetcher.data]);

  // --- Effects ---

  useEffect(() => {
    applyColorScheme(colorScheme);
  }, [colorScheme]);

  // Local window message listener (emulator/dev)
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) {
        const [parseErr, originUrl] = safeWrap(() => new URL(event.origin));
        if (parseErr || !originUrl) return;
        const receiverUrl = new URL(window.location.origin);
        const isLocalOrigin =
          (originUrl.hostname === 'localhost' ||
            originUrl.hostname === '127.0.0.1') &&
          (receiverUrl.hostname === 'localhost' ||
            receiverUrl.hostname === '127.0.0.1');
        if (!isLocalOrigin) return;
      }
      const data = event.data as LocalCastMessage | null;
      if (!data || typeof data !== 'object') return;
      if (!('action' in data)) return;

      handleCastMessage(data);
    };

    window.addEventListener('message', onMessage);
    return () => {
      window.removeEventListener('message', onMessage);
    };
  }, [handleCastMessage]);

  useEffect(() => {
    const opener = window.opener;
    if (!opener) return;

    const [err, referrerUrl] = safeWrap(() => new URL(document.referrer));
    const targetOrigin = !err && referrerUrl ? referrerUrl.origin : '*';

    opener.postMessage(
      {
        action: 'receiverReady',
        timestamp: Date.now(),
      },
      targetOrigin,
    );
  }, []);

  return (
    <CastContext.Provider
      value={{
        roomInfo,
        queue,
        statusText,
        roomMode,
        currentSong,
        debugMode,
        roomId: roomId || null,
        casterId: casterId || null,
        castToken: castToken || null,
        error,
        apiUrl: API_BASE_URL,
        enabledProviders,
        reportPlaybackFailure,
      }}
    >
      {children}
    </CastContext.Provider>
  );
}

export function useCast() {
  const context = useContext(CastContext);
  if (context === undefined) {
    throw new Error('useCast must be used within a CastProvider');
  }
  return context;
}
