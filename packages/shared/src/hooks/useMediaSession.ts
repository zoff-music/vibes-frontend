import type { PlaylistItem } from '@vibes/models';
import { useEffect, useRef } from 'react';
import { safeWrap } from '../utils/wrap';

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
  const pauseRef = useRef(onPause);
  const playRef = useRef(onPlay);
  const skipRef = useRef(onSkip);

  useEffect(() => {
    pauseRef.current = onPause;
    playRef.current = onPlay;
    skipRef.current = onSkip;
  }, [onPause, onPlay, onSkip]);

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
