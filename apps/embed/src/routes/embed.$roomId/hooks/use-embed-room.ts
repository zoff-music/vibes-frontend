import { useSSE } from '@vibes/api';
import { usePlaybackStore, useQueueStore, useRoomStore } from '@vibes/shared';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useFetcher } from 'react-router';
import type { EmbedActionData } from '../action';
import type { EmbedLoaderData } from '../loader';

interface EmbedToast {
  message: string;
  type: 'success' | 'error' | 'info';
}

export function useEmbedRoom(loaderData: EmbedLoaderData) {
  const { roomId } = loaderData;
  const fetcher = useFetcher<EmbedActionData>();
  useSSE(roomId);

  const [toast, setToast] = useState<EmbedToast | null>(null);
  const [spotifyToken, setSpotifyToken] = useState<string | null>(null);
  const [youtubeToken, setYoutubeToken] = useState<string | null>(null);
  const requestedProviderRef = useRef<string | null>(null);
  const room = useRoomStore((state) => state.room) ?? loaderData.room;
  const songs = useQueueStore((state) => state.songs);
  const currentSong = usePlaybackStore((state) => state.currentSong);
  const positionMs = usePlaybackStore((state) => state.actualPositionMs);
  const setRoom = useRoomStore((state) => state.setRoom);
  const setSongs = useQueueStore((state) => state.setSongs);
  const setPlaybackState = usePlaybackStore((state) => state.setPlaybackState);
  const setLocalPlayingState = usePlaybackStore(
    (state) => state.setLocalPlayingState,
  );

  const dismissToast = useCallback(() => {
    setToast(null);
  }, []);

  const handleSkip = useCallback(() => {
    fetcher.submit(
      { intent: 'skip' },
      { encType: 'application/json', method: 'post' },
    );
  }, [fetcher]);

  const handleVote = useCallback(
    (songId: string) => {
      fetcher.submit(
        { intent: 'voteSong', songId },
        { encType: 'application/json', method: 'post' },
      );
    },
    [fetcher],
  );

  const requestProviderToken = useCallback(
    (provider: 'spotify' | 'youtube', force = false) => {
      if (!force && requestedProviderRef.current === provider) return;
      requestedProviderRef.current = provider;
      fetcher.submit(
        { intent: 'providerToken', provider },
        { encType: 'application/json', method: 'post' },
      );
    },
    [fetcher],
  );

  useEffect(() => {
    setRoom(loaderData.room);
    setSongs(loaderData.songs);
    if (loaderData.playback) {
      setPlaybackState(loaderData.playback, loaderData.room.mode);
    }
  }, [loaderData, setPlaybackState, setRoom, setSongs]);

  useEffect(() => {
    if (loaderData.options.autoplay || !currentSong?.id) return;
    setLocalPlayingState(false, room.mode);
  }, [
    currentSong?.id,
    loaderData.options.autoplay,
    room.mode,
    setLocalPlayingState,
  ]);

  useEffect(() => {
    if (fetcher.state !== 'idle' || !fetcher.data) return;
    if (fetcher.data.error) {
      if (fetcher.data.intent === 'providerToken') {
        requestedProviderRef.current = null;
        return;
      }
      setToast({ message: fetcher.data.error, type: 'error' });
      return;
    }
    if (fetcher.data.intent === 'providerToken' && fetcher.data.providerToken) {
      if (fetcher.data.provider === 'spotify') {
        setSpotifyToken(fetcher.data.providerToken.accessToken);
      }
      if (fetcher.data.provider === 'youtube') {
        setYoutubeToken(fetcher.data.providerToken.accessToken);
      }
      return;
    }
    if (fetcher.data.playback) {
      setPlaybackState(fetcher.data.playback, room.mode);
    }
    setToast({
      message: fetcher.data.intent === 'skip' ? 'Skip requested' : 'Vote added',
      type: 'success',
    });
  }, [fetcher.data, fetcher.state, room.mode, setPlaybackState]);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 2500);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  return {
    currentSong,
    dismissToast,
    handleSkip,
    handleVote,
    positionMs,
    requestProviderToken,
    room,
    songs,
    spotifyToken,
    toast,
    tokenLoading: fetcher.state !== 'idle',
    youtubeToken,
  };
}
