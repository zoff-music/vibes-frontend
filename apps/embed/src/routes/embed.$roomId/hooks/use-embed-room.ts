import { useSSE } from '@vibes/api';
import {
  synchronizeServerClock,
  useMediaSession,
  usePlaybackStore,
  useQueueStore,
  useRoomStore,
} from '@vibes/shared';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useFetcher, useRevalidator } from 'react-router';
import type { EmbedActionData } from '../action';
import type { EmbedLoaderData } from '../loader';

interface EmbedToast {
  message: string;
  type: 'success' | 'error' | 'info';
}

export function useEmbedRoom(loaderData: EmbedLoaderData) {
  const { roomId } = loaderData;
  const actionFetcher = useFetcher<EmbedActionData>();
  const spotifyTokenFetcher = useFetcher<EmbedActionData>();
  const revalidate = useRevalidator().revalidate;

  const [toast, setToast] = useState<EmbedToast | null>(null);
  const [spotifyToken, setSpotifyToken] = useState<string | null>(null);
  const [hasLocalPlayerInteraction, setHasLocalPlayerInteraction] =
    useState(false);
  const [hydratedRoomId, setHydratedRoomId] = useState<string | null>(null);
  const interactionRoomIDRef = useRef(loaderData.roomId);
  const spotifyTokenRequestedRef = useRef(false);
  const storedRoom = useRoomStore((state) => state.room);
  const storedSongs = useQueueStore((state) => state.songs);
  const storedCurrentSong = usePlaybackStore((state) => state.currentSong);
  const storedIsPlaying = usePlaybackStore((state) => state.isPlaying);
  const storedHasLocalPlaybackChanges = usePlaybackStore(
    (state) => state.hasLocalPlaybackChanges,
  );
  const storedPositionMs = usePlaybackStore((state) => state.actualPositionMs);
  const isRoomHydrated = hydratedRoomId === loaderData.roomId;
  const room = isRoomHydrated && storedRoom ? storedRoom : loaderData.room;
  const songs = isRoomHydrated ? storedSongs : loaderData.songs;
  const currentSong = isRoomHydrated
    ? storedCurrentSong
    : (loaderData.playback?.currentSong ?? null);
  const isPlaying = isRoomHydrated
    ? storedIsPlaying
    : (loaderData.playback?.isPlaying ?? false);
  const hasLocalPlaybackChanges = isRoomHydrated
    ? storedHasLocalPlaybackChanges
    : false;
  const positionMs = isRoomHydrated
    ? storedPositionMs
    : (loaderData.playback?.positionMs ?? 0);
  const roomModeRef = useRef(room.mode);
  const setRoom = useRoomStore((state) => state.setRoom);
  const setHost = useRoomStore((state) => state.setHost);
  const setUsersCount = useRoomStore((state) => state.setUsersCount);
  const setSongs = useQueueStore((state) => state.setSongs);
  const addSong = useQueueStore((state) => state.addSong);
  const setPlaybackState = usePlaybackStore((state) => state.setPlaybackState);
  const resetPlaybackState = usePlaybackStore(
    (state) => state.resetPlaybackState,
  );
  const setLocalPlaybackAligned = usePlaybackStore(
    (state) => state.setLocalPlaybackAligned,
  );
  const setLocalPlayingState = usePlaybackStore(
    (state) => state.setLocalPlayingState,
  );

  const sseCallbacks = useMemo(
    () => ({
      onConnected: synchronizeServerClock,
      onHostUpdate: ({ userId }: { userId: string }) => setHost(userId),
      onPlaybackUpdate: (playback: EmbedLoaderData['playback']) => {
        if (!playback) return;
        setPlaybackState(playback, useRoomStore.getState().room?.mode);
      },
      onReconnect: revalidate,
      onRoomUpdate: setRoom,
      onSongAdded: addSong,
      onSongsUpdate: setSongs,
      onUsersUpdate: setUsersCount,
    }),
    [
      addSong,
      revalidate,
      setHost,
      setPlaybackState,
      setRoom,
      setSongs,
      setUsersCount,
    ],
  );
  useSSE(roomId, sseCallbacks);

  const dismissToast = useCallback(() => {
    setToast(null);
  }, []);

  const handleLocalPlayerInteraction = useCallback(() => {
    setHasLocalPlayerInteraction(true);
  }, []);

  const handleLocalAlignmentChange = useCallback(
    (isAligned: boolean) => {
      if (!hasLocalPlayerInteraction) return;
      setLocalPlaybackAligned(isAligned);
    },
    [hasLocalPlayerInteraction, setLocalPlaybackAligned],
  );

  const handleSkip = useCallback(() => {
    actionFetcher.submit(
      { intent: 'skip' },
      { encType: 'application/json', method: 'post' },
    );
  }, [actionFetcher]);

  const handleReset = useCallback(() => {
    actionFetcher.submit(
      { intent: 'resetPlayback' },
      { encType: 'application/json', method: 'post' },
    );
  }, [actionFetcher]);

  const handlePlay = useCallback(() => {
    setHasLocalPlayerInteraction(true);
    setLocalPlayingState(true, room.mode);
  }, [room.mode, setLocalPlayingState]);

  const handlePause = useCallback(() => {
    setHasLocalPlayerInteraction(true);
    setLocalPlayingState(false, room.mode);
  }, [room.mode, setLocalPlayingState]);

  const handlePlayPause = useCallback(() => {
    if (isPlaying) {
      handlePause();
      return;
    }

    handlePlay();
  }, [handlePause, handlePlay, isPlaying]);

  useMediaSession({
    canPlay: loaderData.options.player && Boolean(currentSong),
    canSkip: loaderData.options.skip && Boolean(currentSong),
    currentSong,
    isPlaying,
    onPause: handlePause,
    onPlay: handlePlay,
    onSkip: handleSkip,
  });

  const handleVote = useCallback(
    (songId: string) => {
      actionFetcher.submit(
        { intent: 'voteSong', songId },
        { encType: 'application/json', method: 'post' },
      );
    },
    [actionFetcher],
  );

  const requestProviderToken = useCallback(
    (provider: 'spotify', force = false) => {
      if (!force && spotifyTokenRequestedRef.current) return;
      spotifyTokenRequestedRef.current = true;
      spotifyTokenFetcher.submit(
        { intent: 'providerToken', provider },
        { encType: 'application/json', method: 'post' },
      );
    },
    [spotifyTokenFetcher],
  );

  useEffect(() => {
    roomModeRef.current = room.mode;
  }, [room.mode]);

  useEffect(() => {
    setRoom(loaderData.room);
    setSongs(loaderData.songs);
    if (loaderData.playback) {
      setPlaybackState(loaderData.playback, loaderData.room.mode);
    }
    setHydratedRoomId(loaderData.roomId);
  }, [loaderData, setPlaybackState, setRoom, setSongs]);

  useEffect(() => {
    if (interactionRoomIDRef.current === loaderData.roomId) return;
    interactionRoomIDRef.current = loaderData.roomId;
    setHasLocalPlayerInteraction(false);
  }, [loaderData.roomId]);

  useEffect(() => {
    if (hasLocalPlayerInteraction || !currentSong?.id || !isPlaying) return;
    setLocalPlayingState(false, room.mode);
  }, [
    currentSong?.id,
    hasLocalPlayerInteraction,
    isPlaying,
    room.mode,
    setLocalPlayingState,
  ]);

  useEffect(() => {
    if (spotifyTokenFetcher.state !== 'idle' || !spotifyTokenFetcher.data) {
      return;
    }
    if (spotifyTokenFetcher.data.error) {
      spotifyTokenRequestedRef.current = false;
      return;
    }
    if (
      spotifyTokenFetcher.data.intent !== 'providerToken' ||
      spotifyTokenFetcher.data.provider !== 'spotify' ||
      !spotifyTokenFetcher.data.providerToken
    ) {
      return;
    }
    setSpotifyToken(spotifyTokenFetcher.data.providerToken.accessToken);
  }, [spotifyTokenFetcher.data, spotifyTokenFetcher.state]);

  useEffect(() => {
    if (actionFetcher.state !== 'idle' || !actionFetcher.data) return;
    if (actionFetcher.data.error) {
      setToast({ message: actionFetcher.data.error, type: 'error' });
      return;
    }
    if (
      actionFetcher.data.intent === 'resetPlayback' &&
      actionFetcher.data.playback
    ) {
      resetPlaybackState(actionFetcher.data.playback, roomModeRef.current);
      return;
    }
    if (actionFetcher.data.playback) {
      setPlaybackState(actionFetcher.data.playback, roomModeRef.current);
    }
    setToast({
      message:
        actionFetcher.data.intent === 'skip' ? 'Skip requested' : 'Vote added',
      type: 'success',
    });
  }, [
    actionFetcher.data,
    actionFetcher.state,
    resetPlaybackState,
    setPlaybackState,
  ]);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 2500);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  return {
    currentSong,
    dismissToast,
    handleLocalAlignmentChange,
    handleLocalPlayerInteraction,
    handlePlay,
    handlePlayPause,
    handleReset,
    handleSkip,
    handleVote,
    hasLocalPlaybackChanges,
    hasLocalPlayerInteraction,
    isPlaying,
    positionMs,
    requestProviderToken,
    room,
    songs,
    spotifyTokenLoading: spotifyTokenFetcher.state !== 'idle',
    spotifyToken,
    toast,
  };
}
