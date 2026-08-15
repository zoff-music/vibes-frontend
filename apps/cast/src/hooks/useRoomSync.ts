import {
  createApiClient,
  type RoomSSEMessage,
  subscribeRoomEvents,
} from '@vibes/api';
import type { Song } from '@vibes/models';
import { usePlaybackStore } from '@vibes/shared';
import { useEffect } from 'react';
import type { QueueItem, RoomInfo } from '../types';
import { normalizeSong } from '../utils/songUtils';

interface UseRoomSyncProps {
  roomId: string | null;
  casterId: string | null;
  castToken: string | null;
  setQueue: (queue: QueueItem[]) => void;
  setRoomInfo: React.Dispatch<React.SetStateAction<RoomInfo | null>>;
  setStatusText: (text: string) => void;
  setRoomMode: (mode: string | null) => void;
  setError: (err: string | null) => void;
  setSpotifyToken: (token: string | null) => void;
  setEnabledProviders: (providers: string[]) => void;
  updateMediaMetadata: (song: Song) => void;
  debugMode: boolean;
}

export function useRoomSync({
  roomId,
  casterId,
  castToken,
  setQueue,
  setRoomInfo,
  setStatusText,
  setRoomMode,
  setError,
  setSpotifyToken,
  setEnabledProviders,
  updateMediaMetadata,
}: UseRoomSyncProps) {
  const setPlaybackState = usePlaybackStore((state) => state.setPlaybackState);
  const setIsPlaying = usePlaybackStore((state) => state.setIsPlaying);

  useEffect(() => {
    if (!roomId || !castToken) return;

    const authHeaders: Record<string, string> = {
      Authorization: `Bearer ${castToken}`,
    };

    const api = createApiClient(authHeaders);

    let isMounted = true;
    let unsubscribe: (() => void) | null = null;

    const connect = async () => {
      if (!roomId) return;

      // Fetch initial state
      const initialState = await Promise.all([
        api.get('/rooms/{id}', { id: roomId }, { headers: authHeaders }),
        api.get('/rooms/{id}/songs', { id: roomId }, { headers: authHeaders }),
        api.get(
          '/rooms/{id}/states',
          { id: roomId },
          {
            headers: authHeaders,
          },
        ),
        api.get('/providers', null, { headers: authHeaders }),
        api.get(
          '/tokens/{provider}',
          { provider: 'spotify' },
          { headers: authHeaders },
        ),
      ]);
      if (!isMounted) return;

      const [roomRes, queueRes, playbackRes, providersRes, spotifyTokenRes] =
        initialState;
      const [, room] = roomRes;
      const [songsErr, songs] = queueRes;
      const [playbackErr, playbackState] = playbackRes;
      const [, providers] = providersRes;
      const [, spotifyToken] = spotifyTokenRes;
      const enabledProviders = (providers ?? []).filter((provider) =>
        room?.settings.enabledSources.includes(provider),
      );
      setEnabledProviders(enabledProviders);

      if (enabledProviders.includes('spotify') && spotifyToken) {
        setSpotifyToken(spotifyToken.accessToken);
      }

      if (!songsErr && songs) {
        console.log(`[Cast] Fetched ${songs.length} songs for room ${roomId}`);
        const normalizedSongs = songs.map((s) => normalizeSong(s));
        setQueue(normalizedSongs);
      } else if (songsErr) {
        console.error(
          `[Cast] Failed to fetch songs for room ${roomId}:`,
          songsErr,
        );
      }

      if (!playbackErr && playbackState && playbackState.currentSong) {
        const normalizedSong = normalizeSong(playbackState.currentSong);
        setPlaybackState({
          ...playbackState,
          currentSong: normalizedSong,
        });
        setIsPlaying(playbackState.isPlaying);
        setStatusText(`Now Playing: ${normalizedSong.title}`);
        updateMediaMetadata(normalizedSong);
      }

      const [err, stop] = await subscribeRoomEvents(
        api,
        roomId,
        (result) => {
          const [eventError, message] = result;
          if (eventError) {
            // connection error
            return;
          }
          if (!message || !isMounted) return;

          const typedMessage: RoomSSEMessage = message;

          switch (typedMessage.type) {
            case 'connected':
              setStatusText(`Connected to ${roomId}`);
              break;
            case 'playback_update': {
              const data = typedMessage.data;
              const normalizedSong = data.currentSong
                ? normalizeSong(data.currentSong)
                : null;

              setPlaybackState({
                ...data,
                currentSong: normalizedSong,
              });

              if (normalizedSong) {
                updateMediaMetadata(normalizedSong);
                setStatusText(`Now Playing: ${normalizedSong.title}`);
              } else {
                setStatusText('Ready for Casting');
              }

              setIsPlaying(data.isPlaying);
              break;
            }
            case 'songs_update':
              if (Array.isArray(typedMessage.data)) {
                const normalizedQueue = typedMessage.data.map((s) =>
                  normalizeSong(s),
                );
                setQueue(normalizedQueue);
              }
              break;
            case 'settings_update':
              setRoomMode(typedMessage.data.mode);
              setEnabledProviders(
                (providers ?? []).filter((provider) =>
                  typedMessage.data.settings.enabledSources.includes(provider),
                ),
              );
              setRoomInfo((current) => ({
                name: typedMessage.data.name,
                participantCount: current?.participantCount ?? 0,
              }));
              break;
            case 'users_update':
              setRoomInfo((current) => ({
                name: current?.name || roomId,
                participantCount: typedMessage.data,
              }));
              break;
          }
        },
        `cast:${casterId ?? 'receiver'}`,
      );

      if (!isMounted) {
        if (!err && stop) {
          stop();
        }
        return;
      }

      if (!err && stop) {
        unsubscribe = stop;
      }
    };

    connect();

    return () => {
      isMounted = false;
      if (unsubscribe) unsubscribe();
    };
  }, [
    roomId,
    setQueue,
    setRoomInfo,
    setStatusText,
    setRoomMode,
    setError,
    updateMediaMetadata,
    setPlaybackState,
    setIsPlaying,
    setEnabledProviders,
    casterId,
    castToken,
  ]);
}
