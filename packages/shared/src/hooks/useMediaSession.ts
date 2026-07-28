import type { Song } from '@vibes/models';
import { useEffect } from 'react';
import { safeWrap } from '../utils/wrap';

interface UseMediaSessionProps {
  canPlay: boolean;
  canSkip: boolean;
  currentSong: Song | null;
  isPlaying: boolean;
  onPause: () => void;
  onPlay: () => void;
  onSkip: () => void;
}

export function useMediaSession({
  canPlay,
  canSkip,
  currentSong,
  isPlaying,
  onPause,
  onPlay,
  onSkip,
}: UseMediaSessionProps) {
  useEffect(() => {
    if (!('mediaSession' in navigator)) {
      return;
    }

    navigator.mediaSession.playbackState = currentSong
      ? isPlaying
        ? 'playing'
        : 'paused'
      : 'none';

    if (!currentSong || !('MediaMetadata' in window)) {
      navigator.mediaSession.metadata = null;
      return;
    }

    const artwork = currentSong.thumbnailUrl
      ? [{ src: currentSong.thumbnailUrl }]
      : [];
    navigator.mediaSession.metadata = new MediaMetadata({
      album: 'Zoff',
      artist: currentSong.artist,
      artwork,
      title: currentSong.title,
    });
  }, [currentSong, isPlaying]);

  useEffect(() => {
    if (!('mediaSession' in navigator)) {
      return;
    }

    safeWrap(() => {
      navigator.mediaSession.setActionHandler('play', canPlay ? onPlay : null);
    });
    safeWrap(() => {
      navigator.mediaSession.setActionHandler(
        'pause',
        canPlay ? onPause : null,
      );
    });
    safeWrap(() => {
      navigator.mediaSession.setActionHandler(
        'nexttrack',
        canSkip ? onSkip : null,
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
  }, [canPlay, canSkip, onPause, onPlay, onSkip]);
}
