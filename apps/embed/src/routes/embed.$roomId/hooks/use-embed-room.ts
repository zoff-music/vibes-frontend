import { useRoomEventsV3 } from '@vibes/api';
import type { PlaylistItem, RoomV2 } from '@vibes/models';
import {
  synchronizeServerClock,
  useMediaSession,
  usePlaybackStore,
  useQueueStore,
  useRoomStore,
} from '@vibes/shared';
import { markPlaybackGestureUnlocked } from '@vibes/ui/web';
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
  const storedPlaylistItems = useQueueStore((state) => state.playlistItems);
  const storedCurrentPlaylistItem = usePlaybackStore(
    (state) => state.currentPlaylistItem,
  );
  const storedIsPlaying = usePlaybackStore((state) => state.isPlaying);
  const storedHasLocalPlaybackChanges = usePlaybackStore(
    (state) => state.hasLocalPlaybackChanges,
  );
  const storedPositionMs = usePlaybackStore((state) => state.actualPositionMs);
  const setRoom = useRoomStore((state) => state.setRoom);
  const setHost = useRoomStore((state) => state.setHost);
  const setUsersCount = useRoomStore((state) => state.setUsersCount);
  const setPlaylistItems = useQueueStore((state) => state.setPlaylistItems);
  const addPlaylistItem = useQueueStore((state) => state.addPlaylistItem);
  const positionPlaylistItem = useQueueStore(
    (state) => state.positionPlaylistItem,
  );
  const removePlaylistItem = useQueueStore((state) => state.removePlaylistItem);
  const setPlaybackState = usePlaybackStore((state) => state.setPlaybackState);
  const [hydratedRoomId, setHydratedRoomId] = useState<string | null>(null);
  const revalidate = useRevalidator().revalidate;
  const isRoomHydrated = hydratedRoomId === loaderData.roomId;
  const room = isRoomHydrated && storedRoom ? storedRoom : loaderData.room;
  const playlistItems = isRoomHydrated
    ? storedPlaylistItems
    : loaderData.playlistItems;
  const currentPlaylistItem = isRoomHydrated
    ? storedCurrentPlaylistItem
    : (loaderData.playback?.currentPlaylistItem ?? null);
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
      onPlaylistItemAdded: addPlaylistItem,
      onPlaylistItemRemoved: ({ id }: { id: string }) => removePlaylistItem(id),
      onPlaylistItemUpdated: ({
        playlistItem,
        position,
      }: {
        playlistItem: PlaylistItem;
        position: number;
      }) => positionPlaylistItem(playlistItem, position),
      onPlaylistItemsUpdate: setPlaylistItems,
      onUsersUpdate: setUsersCount,
    }),
    [
      addPlaylistItem,
      positionPlaylistItem,
      revalidate,
      removePlaylistItem,
      setHost,
      setPlaybackState,
      setRoom,
      setPlaylistItems,
      setUsersCount,
    ],
  );
  useRoomEventsV3(loaderData.roomId, sseCallbacks);

  useEffect(() => {
    setRoom(loaderData.room);
    setPlaylistItems(loaderData.playlistItems);
    if (loaderData.playback) {
      setPlaybackState(loaderData.playback, loaderData.room.mode);
    }
    setHydratedRoomId(loaderData.roomId);
  }, [loaderData, setPlaybackState, setRoom, setPlaylistItems]);

  return {
    currentPlaylistItem,
    hasLocalPlaybackChanges: isRoomHydrated
      ? storedHasLocalPlaybackChanges
      : false,
    isPlaying,
    positionMs,
    room,
    playlistItems,
  };
}

interface EmbedActionOptions {
  roomMode: RoomV2['mode'];
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
    (
      intent: 'resetPlayback' | 'skip' | 'votePlaylistItem',
      playlistItemId?: string,
    ) => {
      fetcher.submit(
        { intent, ...(playlistItemId ? { playlistItemId } : {}) },
        { encType: 'application/json', method: 'post' },
      );
    },
    [fetcher],
  );

  return {
    dismissToast: () => setToast(null),
    handleReset: () => submit('resetPlayback'),
    handleSkip: () => submit('skip'),
    handleVote: (playlistItemId: string) =>
      submit('votePlaylistItem', playlistItemId),
    toast,
  };
}

interface EmbedPlaybackOptions {
  autoplay: boolean;
  canPlay: boolean;
  canSkip: boolean;
  currentPlaylistItem: PlaylistItem | null;
  isPlaying: boolean;
  onSkip: () => void;
  roomId: string;
  roomMode: RoomV2['mode'];
}

export function useEmbedLocalPlayback({
  autoplay,
  canPlay,
  canSkip,
  currentPlaylistItem,
  isPlaying,
  onSkip,
  roomId,
  roomMode,
}: EmbedPlaybackOptions) {
  const [hasLocalPlayerInteraction, setHasLocalPlayerInteraction] =
    useState(false);
  const interactionRoomIdRef = useRef(roomId);
  const autoplayRoomIdRef = useRef<string | null>(null);
  const [isPlaybackBlocked, setIsPlaybackBlocked] = useState(false);
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
    if (!autoplay || !canPlay || autoplayRoomIdRef.current === roomId) return;
    autoplayRoomIdRef.current = roomId;
    setLocalPlayingState(true, roomMode);
  }, [autoplay, canPlay, roomId, roomMode, setLocalPlayingState]);

  useEffect(() => {
    if (
      autoplay ||
      hasLocalPlayerInteraction ||
      !currentPlaylistItem?.id ||
      !isPlaying
    )
      return;
    setLocalPlayingState(false, roomMode);
  }, [
    autoplay,
    currentPlaylistItem?.id,
    hasLocalPlayerInteraction,
    isPlaying,
    roomMode,
    setLocalPlayingState,
  ]);

  const handleLocalPlay = useCallback(() => {
    setIsPlaybackBlocked(false);
    setHasLocalPlayerInteraction(true);
    setLocalPlayingState(true, roomMode);
  }, [roomMode, setLocalPlayingState]);

  const handlePlay = useCallback(() => {
    markPlaybackGestureUnlocked();
    handleLocalPlay();
  }, [handleLocalPlay]);

  const handlePause = useCallback(() => {
    setHasLocalPlayerInteraction(true);
    setLocalPlayingState(false, roomMode);
  }, [roomMode, setLocalPlayingState]);
  const handlePlayPause = useCallback(() => {
    if (isPlaying && !isPlaybackBlocked) {
      handlePause();
      return;
    }
    handlePlay();
  }, [handlePause, handlePlay, isPlaying, isPlaybackBlocked]);
  const handleLocalAlignmentChange = useCallback(
    (isAligned: boolean) => {
      if (!autoplay && !hasLocalPlayerInteraction) return;
      setLocalPlaybackAligned(isAligned);
    },
    [autoplay, hasLocalPlayerInteraction, setLocalPlaybackAligned],
  );
  const handleNeedsUserGestureChange = setIsPlaybackBlocked;

  useMediaSession({
    canPlay,
    canSkip,
    currentPlaylistItem,
    isPlaying,
    onPause: handlePause,
    onPlay: handlePlay,
    onSkip,
  });

  return {
    handleLocalAlignmentChange,
    handleNeedsUserGestureChange,
    handleLocalPlayerInteraction: () => setHasLocalPlayerInteraction(true),
    handlePlay,
    handleLocalPlay,
    handlePlayPause,
    hasLocalPlayerInteraction,
    isPlaybackBlocked,
  };
}

export function getEmbedPlaybackCapabilities(
  options: EmbedOptions,
  currentPlaylistItem: PlaylistItem | null,
) {
  return {
    canPlay: options.player && Boolean(currentPlaylistItem),
    canSkip: options.skip && Boolean(currentPlaylistItem),
  };
}
