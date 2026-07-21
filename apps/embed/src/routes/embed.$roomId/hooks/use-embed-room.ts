import {
  type USE_SSE_CALLBACKS,
  usePlayback,
  usePlaybackPosition,
  useQueue,
  useRoom,
} from '@vibes/api';
import { usePlaybackStore, useQueueStore, useRoomStore } from '@vibes/shared';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { EmbedLoaderData } from '../loader';

type ToastHandler = NonNullable<USE_SSE_CALLBACKS['onToast']>;

interface EmbedToast {
  message: string;
  type: 'success' | 'error' | 'info';
}

export function useEmbedRoom(loaderData: EmbedLoaderData) {
  const { roomId } = loaderData;
  const fetchStartedRef = useRef(false);
  const [toast, setToast] = useState<EmbedToast | null>(null);
  const handlePlaybackToast = useCallback<ToastHandler>((message, type) => {
    setToast({ message, type });
  }, []);
  const playbackCallbacks = useMemo(
    () => ({ onToast: handlePlaybackToast }),
    [handlePlaybackToast],
  );
  const { fetchRoom, room: apiRoom } = useRoom(roomId);
  const { fetchQueue, songs, voteSong } = useQueue(roomId);
  const { currentSong, fetchPlayback, skip } = usePlayback(
    roomId,
    playbackCallbacks,
  );
  const setRoom = useRoomStore((state) => state.setRoom);
  const usersCount = useRoomStore((state) => state.usersCount);
  const setSongs = useQueueStore((state) => state.setSongs);
  const setPlaybackState = usePlaybackStore((state) => state.setPlaybackState);
  const setLocalPlayingState = usePlaybackStore(
    (state) => state.setLocalPlayingState,
  );
  const room = apiRoom ?? loaderData.room;
  const currentSongId = currentSong?.id;
  const positionMs = usePlaybackPosition();

  const dismissToast = useCallback(() => setToast(null), []);

  useEffect(() => {
    setRoom(loaderData.room);
    setSongs(loaderData.songs);
    if (loaderData.playback) {
      setPlaybackState(loaderData.playback, loaderData.room.mode);
    }
  }, [loaderData, setPlaybackState, setRoom, setSongs]);

  useEffect(() => {
    if (fetchStartedRef.current) return;
    fetchStartedRef.current = true;

    const refresh = async () => {
      await fetchRoom();
      await Promise.all([fetchQueue(), fetchPlayback()]);
    };
    void refresh();
  }, [fetchPlayback, fetchQueue, fetchRoom]);

  useEffect(() => {
    if (loaderData.options.autoplay || !currentSongId) return;
    setLocalPlayingState(false, room.mode);
  }, [
    currentSongId,
    loaderData.options.autoplay,
    room.mode,
    setLocalPlayingState,
  ]);

  const handleVote = useCallback(
    async (songId: string) => {
      const result = await voteSong(songId);
      if (result === 'success') {
        setToast({ message: 'Vote added', type: 'success' });
        return;
      }
      if (result === 'already_voted') {
        setToast({ message: 'Vote already counted', type: 'info' });
        return;
      }
      setToast({ message: 'Could not add vote', type: 'error' });
    },
    [voteSong],
  );

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 2500);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  return {
    currentSong,
    dismissToast,
    handleSkip: skip,
    handleVote,
    positionMs,
    room,
    songs,
    toast,
    usersCount,
  };
}
