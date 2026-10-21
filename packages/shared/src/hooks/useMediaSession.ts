import type { PlaylistItem } from '@vibes/models';
import { useCallback, useEffect, useRef } from 'react';
import { usePlaybackStore } from '../stores/playbackStore';
import { safeWrap, safeWrapAsync } from '../wrap';
import { configureMediaSessionActions } from './mediaSessionActions';
import { createMediaSessionBridge } from './mediaSessionBridge';
import { mediaSessionPosition } from './mediaSessionPosition';

interface UseMediaSessionProps {
  canPlay: boolean;
  canSkip: boolean;
  currentPlaylistItem: PlaylistItem | null;
  isPlaying: boolean;
  onPause: () => void;
  onPlay: () => void;
  onSkip: () => void;
  onPrevious?: () => void;
}

export function useMediaSession({
  canPlay,
  canSkip,
  currentPlaylistItem,
  isPlaying,
  onPause,
  onPlay,
  onSkip,
  onPrevious,
}: UseMediaSessionProps) {
  const bridgeRef = useRef<ReturnType<typeof createMediaSessionBridge> | null>(
    null,
  );
  const playingRef = useRef(isPlaying);
  playingRef.current = isPlaying;
  const playlistItemId = currentPlaylistItem?.id;
  const hasPlaylistItem = Boolean(playlistItemId);
  const installActionsRef = useRef<() => void>(() => {});
  const pauseRef = useRef(onPause);
  const playRef = useRef(onPlay);
  const skipRef = useRef(onSkip);
  const previousRef = useRef(onPrevious);
  const hasPreviousAction = Boolean(onPrevious);

  useEffect(() => {
    if (!hasPlaylistItem || !('mediaSession' in navigator)) return;
    const bridge = createMediaSessionBridge();
    bridgeRef.current = bridge;
    const onPlaying = () => installActionsRef.current();
    bridge.audio.addEventListener('playing', onPlaying);
    const resume = () => {
      installActionsRef.current();
      if (playingRef.current && bridge.audio.paused) {
        void safeWrapAsync(bridge.audio.play());
      }
    };
    // Autoplay may be blocked until the first user gesture in the room.
    document.addEventListener('pointerdown', resume, true);
    document.addEventListener('keydown', resume, true);
    window.addEventListener('focus', resume);
    return () => {
      document.removeEventListener('pointerdown', resume, true);
      document.removeEventListener('keydown', resume, true);
      window.removeEventListener('focus', resume);
      bridge.audio.removeEventListener('playing', onPlaying);
      bridgeRef.current = null;
      bridge.dispose();
    };
  }, [hasPlaylistItem]);

  useEffect(() => {
    const bridge = bridgeRef.current;
    if (!playlistItemId || !bridge) return;
    if (isPlaying) {
      void safeWrapAsync(bridge.audio.play());
    } else {
      bridge.audio.pause();
    }
  }, [playlistItemId, isPlaying]);

  useEffect(() => {
    pauseRef.current = onPause;
    playRef.current = onPlay;
    skipRef.current = onSkip;
    previousRef.current = onPrevious;
  }, [onPause, onPlay, onSkip, onPrevious]);

  useEffect(() => {
    if (!('mediaSession' in navigator)) return;
    const session = navigator.mediaSession;
    if (!session.setPositionState) return;
    const updatePosition = () => {
      const state = usePlaybackStore.getState();
      const positionMs =
        state.currentPlaylistItem?.id === currentPlaylistItem?.id
          ? state.actualPositionMs
          : 0;
      const position = mediaSessionPosition(
        currentPlaylistItem?.duration ?? 0,
        positionMs,
      );
      safeWrap(() => {
        if (position) session.setPositionState(position);
        else session.setPositionState();
      });
    };
    updatePosition();
    const unsubscribe = usePlaybackStore.subscribe(updatePosition);
    return () => {
      unsubscribe();
      safeWrap(() => session.setPositionState());
    };
  }, [currentPlaylistItem]);

  useEffect(
    () => () => {
      if (!('mediaSession' in navigator)) return;
      navigator.mediaSession.metadata = null;
      navigator.mediaSession.playbackState = 'none';
    },
    [],
  );

  useEffect(() => {
    if (!('mediaSession' in navigator)) {
      return;
    }

    navigator.mediaSession.playbackState = currentPlaylistItem
      ? isPlaying
        ? 'playing'
        : 'paused'
      : 'none';

    if (!currentPlaylistItem || !('MediaMetadata' in window)) {
      navigator.mediaSession.metadata = null;

      return;
    }

    const artwork = currentPlaylistItem.thumbnailUrl
      ? [{ src: currentPlaylistItem.thumbnailUrl }]
      : [];
    navigator.mediaSession.metadata = new MediaMetadata({
      album: 'Zoff',
      artist: currentPlaylistItem.publisher,
      artwork,
      title: currentPlaylistItem.title,
    });
  }, [currentPlaylistItem, isPlaying]);

  const installActions = useCallback(() => {
    if (!('mediaSession' in navigator)) {
      return;
    }

    configureMediaSessionActions(
      (action, handler) => {
        safeWrap(() =>
          navigator.mediaSession.setActionHandler(action, handler),
        );
      },
      {
        play: canPlay ? () => playRef.current() : null,
        pause: canPlay ? () => pauseRef.current() : null,
        next: canSkip ? () => skipRef.current() : null,
        previous: hasPreviousAction ? () => previousRef.current?.() : null,
      },
    );
  }, [canPlay, canSkip, hasPreviousAction]);

  useEffect(() => {
    installActionsRef.current = installActions;
    installActions();
  }, [installActions]);

  useEffect(() => {
    if (!playlistItemId) return;
    installActionsRef.current();
  }, [playlistItemId]);

  useEffect(
    () => () => {
      if (!('mediaSession' in navigator)) return;
      for (const action of [
        'play',
        'pause',
        'nexttrack',
        'previoustrack',
      ] as const) {
        safeWrap(() => navigator.mediaSession.setActionHandler(action, null));
      }
    },
    [],
  );
}
