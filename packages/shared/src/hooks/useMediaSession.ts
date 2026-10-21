import type { PlaylistItem } from '@vibes/models';
import { useEffect, useRef } from 'react';
import { usePlaybackStore } from '../stores/playbackStore';
import { safeWrap, safeWrapAsync } from '../wrap';
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
}

export function useMediaSession({
  canPlay,
  canSkip,
  currentPlaylistItem,
  isPlaying,
  onPause,
  onPlay,
  onSkip,
}: UseMediaSessionProps) {
  const bridgeRef = useRef<ReturnType<typeof createMediaSessionBridge> | null>(
    null,
  );
  const playingRef = useRef(isPlaying);
  playingRef.current = isPlaying;
  const hasPlaylistItem = Boolean(currentPlaylistItem);
  const pauseRef = useRef(onPause);
  const playRef = useRef(onPlay);
  const skipRef = useRef(onSkip);

  useEffect(() => {
    if (!hasPlaylistItem || !('mediaSession' in navigator)) return;
    const bridge = createMediaSessionBridge();
    bridgeRef.current = bridge;
    const resume = () => {
      if (playingRef.current && bridge.audio.paused) {
        void safeWrapAsync(bridge.audio.play());
      }
    };
    // Autoplay may be blocked until the first user gesture in the room.
    document.addEventListener('pointerdown', resume, true);
    document.addEventListener('keydown', resume, true);
    return () => {
      document.removeEventListener('pointerdown', resume, true);
      document.removeEventListener('keydown', resume, true);
      bridgeRef.current = null;
      bridge.dispose();
    };
  }, [hasPlaylistItem]);

  useEffect(() => {
    const bridge = bridgeRef.current;
    if (!hasPlaylistItem || !bridge) return;
    if (isPlaying) {
      void safeWrapAsync(bridge.audio.play());
    } else {
      bridge.audio.pause();
    }
  }, [hasPlaylistItem, isPlaying]);

  useEffect(() => {
    pauseRef.current = onPause;
    playRef.current = onPlay;
    skipRef.current = onSkip;
  }, [onPause, onPlay, onSkip]);

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

  useEffect(() => {
    if (!('mediaSession' in navigator)) {
      return;
    }

    safeWrap(() => {
      navigator.mediaSession.setActionHandler(
        'play',
        canPlay ? () => playRef.current() : null,
      );
    });
    safeWrap(() => {
      navigator.mediaSession.setActionHandler(
        'pause',
        canPlay ? () => pauseRef.current() : null,
      );
    });
    safeWrap(() => {
      navigator.mediaSession.setActionHandler(
        'nexttrack',
        canSkip ? () => skipRef.current() : null,
      );
    });

    // Zoff has no previous-track or media-panel seek controls. Registering
    // null removes these actions from the session's supported action set.
    for (const action of [
      'previoustrack',
      'seekto',
      'seekforward',
      'seekbackward',
    ] as const) {
      safeWrap(() => navigator.mediaSession.setActionHandler(action, null));
    }

    return () => {
      safeWrap(() => {
        navigator.mediaSession.setActionHandler('play', null);
      });
      safeWrap(() => {
        navigator.mediaSession.setActionHandler('pause', null);
      });
      safeWrap(() => {
        navigator.mediaSession.setActionHandler('nexttrack', null);
      });
    };
  }, [canPlay, canSkip]);
}
