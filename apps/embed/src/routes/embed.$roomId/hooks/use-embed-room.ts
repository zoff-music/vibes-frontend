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

export function useEmbedRoom(loaderData: EmbedLoaderData) {
  const { roomId } = loaderData;
  const fetchStartedRef = useRef(false);
  const [message, setMessage] = useState<string | null>(null);
  const handlePlaybackToast = useCallback<ToastHandler>((toastMessage) => {
    setMessage(toastMessage);
  }, []);
  const playbackCallbacks = useMemo(
    () => ({ onToast: handlePlaybackToast }),
    [handlePlaybackToast],
  );
  const { fetchRoom } = useRoom(roomId);
  const { fetchQueue, voteSong } = useQueue(roomId);
  const { fetchPlayback, skip } = usePlayback(roomId, playbackCallbacks);
  const setRoom = useRoomStore((state) => state.setRoom);
  const setSongs = useQueueStore((state) => state.setSongs);
  const setPlaybackState = usePlaybackStore((state) => state.setPlaybackState);
  const setLocalPlayingState = usePlaybackStore(
    (state) => state.setLocalPlayingState,
  );
  const room = useRoomStore((state) => state.room) ?? loaderData.room;
  const songs = useQueueStore((state) => state.songs);
  const currentSong = usePlaybackStore((state) => state.currentSong);
  const currentSongId = currentSong?.id;
  const positionMs = usePlaybackPosition();

  const dismissMessage = useCallback(() => setMessage(null), []);

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
        setMessage('Vote added');
        return;
      }
      if (result === 'already_voted') {
        setMessage('Vote already counted');
        return;
      }
      setMessage('Could not add vote');
    },
    [voteSong],
  );

  useEffect(() => {
    if (!message) return;
    const timeout = window.setTimeout(() => setMessage(null), 2500);
    return () => window.clearTimeout(timeout);
  }, [message]);

  return {
    currentSong,
    dismissMessage,
    handleSkip: skip,
    handleVote,
    message,
    positionMs,
    room,
    songs,
  };
}
