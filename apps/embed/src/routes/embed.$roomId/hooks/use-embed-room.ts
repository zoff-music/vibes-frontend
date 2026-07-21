import {
  usePlayback,
  usePlaybackPosition,
  useQueue,
  useRoom,
} from '@vibes/api';
import { usePlaybackStore, useQueueStore, useRoomStore } from '@vibes/shared';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { EmbedLoaderData } from '../loader';

export function useEmbedRoom(loaderData: EmbedLoaderData) {
  const { roomId } = loaderData;
  const fetchStartedRef = useRef(false);
  const { fetchRoom } = useRoom(roomId);
  const { fetchQueue, voteSong } = useQueue(roomId);
  const { fetchPlayback } = usePlayback(roomId);
  const [message, setMessage] = useState<string | null>(null);
  const setRoom = useRoomStore((state) => state.setRoom);
  const setSongs = useQueueStore((state) => state.setSongs);
  const setPlaybackState = usePlaybackStore((state) => state.setPlaybackState);
  const room = useRoomStore((state) => state.room) ?? loaderData.room;
  const songs = useQueueStore((state) => state.songs);
  const currentSong = usePlaybackStore((state) => state.currentSong);
  const isPlaying = usePlaybackStore((state) => state.isPlaying);
  const positionMs = usePlaybackPosition();

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
    handleVote,
    isPlaying,
    message,
    positionMs,
    room,
    songs,
  };
}
