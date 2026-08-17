import { type RoomSSEMessage, subscribeRoomEvents } from '@vibes/api';
import type { Providers, Song } from '@vibes/models';
import { synchronizeServerClock, usePlaybackStore } from '@vibes/shared';
import { useEffect } from 'react';
import { createCastApiClient, loadCastRoomSnapshot } from '../lib/castRequests';
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

    const api = createCastApiClient(castToken);

    let isMounted = true;
    let unsubscribe: (() => void) | null = null;

    const connect = async () => {
      if (!roomId) return;

      const [requestError, snapshot] = await loadCastRoomSnapshot(api, roomId);
      if (!isMounted) return;
      let availableProviders: Providers = [];
      if (requestError || !snapshot) {
        setError('Could not connect to this room. Reconnect and try again.');
        setStatusText('Could not load the room. Waiting for updates…');
      }
      if (snapshot) {
        availableProviders = snapshot.providers;
        setError(
          snapshot.spotifyTokenUnavailable
            ? 'Connected, but Spotify could not be prepared.'
            : null,
        );
        setRoomInfo({
          name: snapshot.room.name,
          participantCount: snapshot.room.userCount ?? 0,
        });
        setRoomMode(snapshot.room.mode);
        setEnabledProviders(snapshot.providers);
        setSpotifyToken(snapshot.spotifyAccessToken);
        const normalizedSongs = snapshot.songs.map((song) =>
          normalizeSong(song),
        );
        setQueue(normalizedSongs);

        if (snapshot.playback.currentSong) {
          synchronizeServerClock(snapshot.playback.serverTimeMs);
          const normalizedSong = normalizeSong(snapshot.playback.currentSong);
          setPlaybackState({
            ...snapshot.playback,
            currentSong: normalizedSong,
          });
          setIsPlaying(snapshot.playback.isPlaying);
          setStatusText(`Now Playing: ${normalizedSong.title}`);
          updateMediaMetadata(normalizedSong);
        }
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
              synchronizeServerClock(typedMessage.data.time);
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
                availableProviders.filter((provider) =>
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
    setSpotifyToken,
  ]);
}
