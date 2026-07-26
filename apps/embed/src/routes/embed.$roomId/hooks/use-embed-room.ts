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
  const actionFetcher = useFetcher<EmbedActionData>();
  const spotifyTokenFetcher = useFetcher<EmbedActionData>();
  const youtubeTokenFetcher = useFetcher<EmbedActionData>();
  useSSE(roomId);

  const [toast, setToast] = useState<EmbedToast | null>(null);
  const [spotifyToken, setSpotifyToken] = useState<string | null>(null);
  const [youtubeToken, setYoutubeToken] = useState<string | null>(null);
  const [hasLocalPlayerInteraction, setHasLocalPlayerInteraction] = useState(
    loaderData.options.autoplay,
  );
  const interactionRoomIDRef = useRef(loaderData.roomId);
  const spotifyTokenRequestedRef = useRef(false);
  const youtubeTokenRequestedRef = useRef(false);
  const room = useRoomStore((state) => state.room) ?? loaderData.room;
  const roomModeRef = useRef(room.mode);
  const songs = useQueueStore((state) => state.songs);
  const currentSong = usePlaybackStore((state) => state.currentSong);
  const isPlaying = usePlaybackStore((state) => state.isPlaying);
  const hasLocalPlaybackChanges = usePlaybackStore(
    (state) => state.hasLocalPlaybackChanges,
  );
  const positionMs = usePlaybackStore((state) => state.actualPositionMs);
  const setRoom = useRoomStore((state) => state.setRoom);
  const setSongs = useQueueStore((state) => state.setSongs);
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

  const handlePlayPause = useCallback(() => {
    setHasLocalPlayerInteraction(true);
    setLocalPlayingState(!isPlaying, room.mode);
  }, [isPlaying, room.mode, setLocalPlayingState]);

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
    (provider: 'spotify' | 'youtube', force = false) => {
      if (provider === 'spotify') {
        if (!force && spotifyTokenRequestedRef.current) return;
        spotifyTokenRequestedRef.current = true;
        spotifyTokenFetcher.submit(
          { intent: 'providerToken', provider },
          { encType: 'application/json', method: 'post' },
        );
        return;
      }

      if (!force && youtubeTokenRequestedRef.current) return;
      youtubeTokenRequestedRef.current = true;
      youtubeTokenFetcher.submit(
        { intent: 'providerToken', provider },
        { encType: 'application/json', method: 'post' },
      );
    },
    [spotifyTokenFetcher, youtubeTokenFetcher],
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
  }, [loaderData, setPlaybackState, setRoom, setSongs]);

  useEffect(() => {
    if (interactionRoomIDRef.current === loaderData.roomId) return;
    interactionRoomIDRef.current = loaderData.roomId;
    setHasLocalPlayerInteraction(loaderData.options.autoplay);
  }, [loaderData.options.autoplay, loaderData.roomId]);

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
    if (youtubeTokenFetcher.state !== 'idle' || !youtubeTokenFetcher.data) {
      return;
    }
    if (youtubeTokenFetcher.data.error) {
      youtubeTokenRequestedRef.current = false;
      return;
    }
    if (
      youtubeTokenFetcher.data.intent !== 'providerToken' ||
      youtubeTokenFetcher.data.provider !== 'youtube' ||
      !youtubeTokenFetcher.data.providerToken
    ) {
      return;
    }
    setYoutubeToken(youtubeTokenFetcher.data.providerToken.accessToken);
  }, [youtubeTokenFetcher.data, youtubeTokenFetcher.state]);

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
    handlePlayPause,
    handleReset,
    handleSkip,
    handleVote,
    hasLocalPlaybackChanges,
    isPlaying,
    positionMs,
    requestProviderToken,
    room,
    songs,
    spotifyTokenLoading: spotifyTokenFetcher.state !== 'idle',
    spotifyToken,
    toast,
    youtubeTokenLoading: youtubeTokenFetcher.state !== 'idle',
    youtubeToken,
  };
}
