import { useRoomEventsV2 } from '@vibes/api';
import type { Room, Song } from '@vibes/models';
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
import type { EmbedLoaderData, EmbedOptions } from '../loader';

interface EmbedToast {
  message: string;
  type: 'success' | 'error' | 'info';
}

export function useEmbedRoomState(loaderData: EmbedLoaderData) {
  const storedRoom = useRoomStore((state) => state.room);
  const storedSongs = useQueueStore((state) => state.songs);
  const storedCurrentSong = usePlaybackStore((state) => state.currentSong);
  const storedIsPlaying = usePlaybackStore((state) => state.isPlaying);
  const storedHasLocalPlaybackChanges = usePlaybackStore(
    (state) => state.hasLocalPlaybackChanges,
  );
  const storedPositionMs = usePlaybackStore((state) => state.actualPositionMs);
  const setRoom = useRoomStore((state) => state.setRoom);
  const setHost = useRoomStore((state) => state.setHost);
  const setUsersCount = useRoomStore((state) => state.setUsersCount);
  const setSongs = useQueueStore((state) => state.setSongs);
  const addSong = useQueueStore((state) => state.addSong);
  const positionSong = useQueueStore((state) => state.positionSong);
  const removeSong = useQueueStore((state) => state.removeSong);
  const setPlaybackState = usePlaybackStore((state) => state.setPlaybackState);
  const [hydratedRoomId, setHydratedRoomId] = useState<string | null>(null);
  const revalidate = useRevalidator().revalidate;
  const isRoomHydrated = hydratedRoomId === loaderData.roomId;
  const room = isRoomHydrated && storedRoom ? storedRoom : loaderData.room;
  const songs = isRoomHydrated ? storedSongs : loaderData.songs;
  const currentSong = isRoomHydrated
    ? storedCurrentSong
    : (loaderData.playback?.currentSong ?? null);
  const isPlaying = isRoomHydrated
    ? storedIsPlaying
    : (loaderData.playback?.isPlaying ?? false);
  const positionMs = isRoomHydrated
    ? storedPositionMs
    : (loaderData.playback?.positionMs ?? 0);

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
      onSongRemoved: ({ id }: { id: string }) => removeSong(id),
      onSongUpdated: ({ song, position }: { song: Song; position: number }) =>
        positionSong(song, position),
      onSongsUpdate: setSongs,
      onUsersUpdate: setUsersCount,
    }),
    [
      addSong,
      positionSong,
      revalidate,
      removeSong,
      setHost,
      setPlaybackState,
      setRoom,
      setSongs,
      setUsersCount,
    ],
  );
  useRoomEventsV2(loaderData.roomId, sseCallbacks);

  useEffect(() => {
    setRoom(loaderData.room);
    setSongs(loaderData.songs);
    if (loaderData.playback) {
      setPlaybackState(loaderData.playback, loaderData.room.mode);
    }
    setHydratedRoomId(loaderData.roomId);
  }, [loaderData, setPlaybackState, setRoom, setSongs]);

  return {
    currentSong,
    hasLocalPlaybackChanges: isRoomHydrated
      ? storedHasLocalPlaybackChanges
      : false,
    isPlaying,
    positionMs,
    room,
    songs,
  };
}

interface EmbedActionOptions {
  roomMode: Room['mode'];
}

export function useEmbedRoomActions({ roomMode }: EmbedActionOptions) {
  const fetcher = useFetcher<EmbedActionData>();
  const resetPlaybackState = usePlaybackStore(
    (state) => state.resetPlaybackState,
  );
  const setPlaybackState = usePlaybackStore((state) => state.setPlaybackState);
  const roomModeRef = useRef(roomMode);
  const [toast, setToast] = useState<EmbedToast | null>(null);

  useEffect(() => {
    roomModeRef.current = roomMode;
  }, [roomMode]);

  useEffect(() => {
    if (fetcher.state !== 'idle' || !fetcher.data) return;
    if (fetcher.data.error) {
      setToast({ message: fetcher.data.error, type: 'error' });
      return;
    }
    if (fetcher.data.intent === 'resetPlayback' && fetcher.data.playback) {
      resetPlaybackState(fetcher.data.playback, roomModeRef.current);
      return;
    }
    if (fetcher.data.playback) {
      setPlaybackState(fetcher.data.playback, roomModeRef.current);
    }
    setToast({
      message: fetcher.data.intent === 'skip' ? 'Skip requested' : 'Vote added',
      type: 'success',
    });
  }, [fetcher.data, fetcher.state, resetPlaybackState, setPlaybackState]);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 2500);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const submit = useCallback(
    (intent: 'resetPlayback' | 'skip' | 'voteSong', songId?: string) => {
      fetcher.submit(
        { intent, ...(songId ? { songId } : {}) },
        { encType: 'application/json', method: 'post' },
      );
    },
    [fetcher],
  );

  return {
    dismissToast: () => setToast(null),
    handleReset: () => submit('resetPlayback'),
    handleSkip: () => submit('skip'),
    handleVote: (songId: string) => submit('voteSong', songId),
    toast,
  };
}

interface EmbedPlaybackOptions {
  canPlay: boolean;
  canSkip: boolean;
  currentSong: Song | null;
  isPlaying: boolean;
  onSkip: () => void;
  roomId: string;
  roomMode: Room['mode'];
}

export function useEmbedLocalPlayback({
  canPlay,
  canSkip,
  currentSong,
  isPlaying,
  onSkip,
  roomId,
  roomMode,
}: EmbedPlaybackOptions) {
  const [hasLocalPlayerInteraction, setHasLocalPlayerInteraction] =
    useState(false);
  const interactionRoomIdRef = useRef(roomId);
  const setLocalPlaybackAligned = usePlaybackStore(
    (state) => state.setLocalPlaybackAligned,
  );
  const setLocalPlayingState = usePlaybackStore(
    (state) => state.setLocalPlayingState,
  );

  useEffect(() => {
    if (interactionRoomIdRef.current === roomId) return;
    interactionRoomIdRef.current = roomId;
    setHasLocalPlayerInteraction(false);
  }, [roomId]);

  useEffect(() => {
    if (hasLocalPlayerInteraction || !currentSong?.id || !isPlaying) return;
    setLocalPlayingState(false, roomMode);
  }, [
    currentSong?.id,
    hasLocalPlayerInteraction,
    isPlaying,
    roomMode,
    setLocalPlayingState,
  ]);

  const handlePlay = useCallback(() => {
    setHasLocalPlayerInteraction(true);
    setLocalPlayingState(true, roomMode);
  }, [roomMode, setLocalPlayingState]);
  const handlePause = useCallback(() => {
    setHasLocalPlayerInteraction(true);
    setLocalPlayingState(false, roomMode);
  }, [roomMode, setLocalPlayingState]);
  const handlePlayPause = useCallback(() => {
    if (isPlaying) {
      handlePause();
      return;
    }
    handlePlay();
  }, [handlePause, handlePlay, isPlaying]);
  const handleLocalAlignmentChange = useCallback(
    (isAligned: boolean) => {
      if (!hasLocalPlayerInteraction) return;
      setLocalPlaybackAligned(isAligned);
    },
    [hasLocalPlayerInteraction, setLocalPlaybackAligned],
  );

  useMediaSession({
    canPlay,
    canSkip,
    currentSong,
    isPlaying,
    onPause: handlePause,
    onPlay: handlePlay,
    onSkip,
  });

  return {
    handleLocalAlignmentChange,
    handleLocalPlayerInteraction: () => setHasLocalPlayerInteraction(true),
    handlePlay,
    handlePlayPause,
    hasLocalPlayerInteraction,
  };
}

export function getEmbedPlaybackCapabilities(
  options: EmbedOptions,
  currentSong: Song | null,
) {
  return {
    canPlay: options.player && Boolean(currentSong),
    canSkip: options.skip && Boolean(currentSong),
  };
}
