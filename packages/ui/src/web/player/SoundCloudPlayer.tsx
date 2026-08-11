import {
  classNames,
  type Song,
  safeWrap,
  usePlaybackStore,
} from '@vibes/shared';
import { memo, useEffect, useRef, useState } from 'react';

// Declare SC global on window
declare global {
  interface Window {
    SC?: SoundCloudApi;
  }
}

interface SoundCloudWidget {
  bind: (event: string, callback: (event?: unknown) => void) => void;
  getPosition: (callback: (currentTimeMs: number) => void) => void;
  getVolume: (callback: (volume: number) => void) => void;
  isPaused: (callback: (isPaused: boolean) => void) => void;
  pause: () => void;
  play: () => void;
  seekTo: (milliseconds: number) => void;
  setVolume: (volume: number) => void;
}

interface SoundCloudApi {
  Widget: {
    (iframe: HTMLIFrameElement): SoundCloudWidget;
    Events: {
      ERROR: string;
      FINISH: string;
      PAUSE: string;
      PLAY: string;
      READY: string;
      SEEK: string;
    };
  };
}

interface Props {
  isVisible?: boolean;
  onEnded?: () => void;
  fill?: boolean;
  preloadSong?: Song | null;
  onLocalPause?: () => void;
  onLocalPlay?: () => void;
  onLocalSeek?: (positionMs: number) => void;
  onLocalAlignmentChange?: (isAligned: boolean) => void;
  onLocalVolumeChange?: () => void;
}

const SoundCloudPlayerComponent: React.FC<Props> = ({
  isVisible = true,
  onEnded,
  fill = false,
  preloadSong = null,
  onLocalAlignmentChange,
  onLocalPause,
  onLocalPlay,
  onLocalSeek,
  onLocalVolumeChange,
}) => {
  const currentSong = usePlaybackStore((state) => state.currentSong);
  const isPlaying = usePlaybackStore((state) => state.isPlaying);
  const resetVersion = usePlaybackStore((state) => state.resetVersion);
  const updatedAt = usePlaybackStore((state) => state.updatedAt);
  const providerSong =
    currentSong?.sourceType === 'soundcloud' ? currentSong : preloadSong;
  const isActive =
    isVisible && currentSong?.sourceType === 'soundcloud' && !!currentSong;
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const widgetRef = useRef<SoundCloudWidget | null>(null);
  const lastSynchronizedUpdateRef = useRef<string | null>(null);
  const expectedPlayingStateRef = useRef<boolean | null>(null);
  const expectedSeekPositionRef = useRef<number | null>(null);
  const onEndedRef = useRef(onEnded);
  const onLocalAlignmentChangeRef = useRef(onLocalAlignmentChange);
  const onLocalPauseRef = useRef(onLocalPause);
  const onLocalPlayRef = useRef(onLocalPlay);
  const onLocalSeekRef = useRef(onLocalSeek);
  const onLocalVolumeChangeRef = useRef(onLocalVolumeChange);
  const lastObservedVolumeRef = useRef<number | null>(null);
  const lastResetVersionRef = useRef(resetVersion);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    onEndedRef.current = onEnded;
    onLocalAlignmentChangeRef.current = onLocalAlignmentChange;
    onLocalPauseRef.current = onLocalPause;
    onLocalPlayRef.current = onLocalPlay;
    onLocalSeekRef.current = onLocalSeek;
    onLocalVolumeChangeRef.current = onLocalVolumeChange;
  }, [
    onEnded,
    onLocalAlignmentChange,
    onLocalPause,
    onLocalPlay,
    onLocalSeek,
    onLocalVolumeChange,
  ]);

  // Load SoundCloud Widget API script
  useEffect(() => {
    if (!window.SC) {
      const script = document.createElement('script');
      script.src = 'https://w.soundcloud.com/player/api.js';
      script.async = true;
      script.onload = () => {
        // Initialize widget if iframe is already mounted
        if (iframeRef.current) {
          initializeWidget();
        }
      };
      document.body.appendChild(script);
    } else if (iframeRef.current && !widgetRef.current) {
      initializeWidget();
    }
  }, []);

  const initializeWidget = () => {
    const iframe = iframeRef.current;
    const soundCloud = window.SC;
    if (!iframe || !soundCloud || widgetRef.current) return;

    const [widgetErr, widget] = safeWrap(() => soundCloud.Widget(iframe));
    if (widgetErr || !widget) {
      console.error('[SoundCloud Widget] Initialization error:', widgetErr);
      return;
    }

    widgetRef.current = widget;

    widget.bind(soundCloud.Widget.Events.READY, () => {
      setIsReady(true);
      const actualPositionMs = usePlaybackStore.getState().actualPositionMs;
      expectedSeekPositionRef.current = actualPositionMs;
      widget.seekTo(actualPositionMs);
      lastSynchronizedUpdateRef.current = usePlaybackStore.getState().updatedAt;
      const playbackState = usePlaybackStore.getState();
      const shouldPlay =
        isVisible &&
        playbackState.currentSong?.sourceType === 'soundcloud' &&
        playbackState.isPlaying;
      if (shouldPlay) {
        expectedPlayingStateRef.current = true;
        widget.play();
      } else {
        expectedPlayingStateRef.current = false;
        widget.pause();
      }
    });

    widget.bind(soundCloud.Widget.Events.FINISH, () => {
      onEndedRef.current?.();
    });

    widget.bind(soundCloud.Widget.Events.SEEK, () => {
      widget.getPosition((positionMs) => {
        const expectedPositionMs = expectedSeekPositionRef.current;
        expectedSeekPositionRef.current = null;
        if (
          expectedPositionMs !== null &&
          Math.abs(positionMs - expectedPositionMs) <=
            EXPECTED_SEEK_TOLERANCE_MS
        ) {
          return;
        }
        onLocalSeekRef.current?.(Math.round(positionMs));
      });
    });

    widget.bind(soundCloud.Widget.Events.PLAY, () => {
      if (expectedPlayingStateRef.current === true) {
        expectedPlayingStateRef.current = null;
        return;
      }
      expectedPlayingStateRef.current = null;
      if (usePlaybackStore.getState().isPlaying) {
        return;
      }
      onLocalPlayRef.current?.();
    });

    widget.bind(soundCloud.Widget.Events.PAUSE, () => {
      if (expectedPlayingStateRef.current === false) {
        expectedPlayingStateRef.current = null;
        return;
      }
      expectedPlayingStateRef.current = null;
      if (!usePlaybackStore.getState().isPlaying) {
        return;
      }
      onLocalPauseRef.current?.();
    });

    widget.bind(soundCloud.Widget.Events.ERROR, (e?: unknown) => {
      console.error('[SoundCloud Widget] Error:', e);
    });
  };

  // Re-initialize when song changes (iframe src changes)
  useEffect(() => {
    // Reset state
    widgetRef.current = null;
    lastSynchronizedUpdateRef.current = null;
    expectedPlayingStateRef.current = null;
    expectedSeekPositionRef.current = null;
    lastObservedVolumeRef.current = null;
    setIsReady(false);
  }, [providerSong?.sourceId]);

  useEffect(() => {
    if (!isActive) {
      lastResetVersionRef.current = resetVersion;
    }
  }, [isActive, resetVersion]);

  useEffect(() => {
    if (!widgetRef.current || !isActive || !isReady) return;

    const shouldReset = lastResetVersionRef.current !== resetVersion;
    if (shouldReset) {
      widgetRef.current.setVolume(MAX_VOLUME);
      lastResetVersionRef.current = resetVersion;
    }
    if (lastSynchronizedUpdateRef.current !== updatedAt || shouldReset) {
      const actualPositionMs = usePlaybackStore.getState().actualPositionMs;
      expectedSeekPositionRef.current = actualPositionMs;
      widgetRef.current.seekTo(actualPositionMs);
      lastSynchronizedUpdateRef.current = updatedAt;
    }

    if (isActive && isPlaying) {
      expectedPlayingStateRef.current = true;
      widgetRef.current.play();
    } else {
      expectedPlayingStateRef.current = false;
      widgetRef.current.pause();
    }
  }, [isActive, isPlaying, isReady, resetVersion, updatedAt]);

  useEffect(() => {
    if (!isActive || !isReady || !onLocalAlignmentChange) return;

    let cancelled = false;
    const interval = setInterval(() => {
      const widget = widgetRef.current;
      if (!widget) return;

      widget.getPosition((positionMs) => {
        widget.getVolume((volume) => {
          widget.isPaused((isPaused) => {
            if (cancelled) return;

            const previousVolume = lastObservedVolumeRef.current;
            lastObservedVolumeRef.current = volume;
            if (previousVolume !== null && previousVolume !== volume) {
              onLocalVolumeChangeRef.current?.();
            }

            const playbackStore = usePlaybackStore.getState();
            const authoritativePlayback = playbackStore.authoritativePlayback;
            const isAligned =
              providerSong?.sourceId ===
                authoritativePlayback.currentSong?.sourceId &&
              !isPaused === authoritativePlayback.isPlaying &&
              Math.abs(
                positionMs - playbackStore.getAuthoritativePositionMs(),
              ) <= ALIGNED_POSITION_TOLERANCE_MS &&
              volume === MAX_VOLUME;
            onLocalAlignmentChangeRef.current?.(isAligned);
          });
        });
      });
    }, VOLUME_SAMPLE_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [isActive, isReady, onLocalAlignmentChange, providerSong?.sourceId]);

  if (!providerSong) {
    return null;
  }

  if (providerSong.sourceType !== 'soundcloud') {
    return null;
  }

  const soundcloudUrl = providerSong.sourceId.startsWith('http')
    ? providerSong.sourceId
    : `https://api.soundcloud.com/tracks/${providerSong.sourceId}`;

  // Construct iframe src with parameters
  // visual=true makes it the big album art player
  const src = `https://w.soundcloud.com/player/?url=${encodeURIComponent(soundcloudUrl)}&auto_play=false&visual=true&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false`;

  const containerClass = fill
    ? 'relative h-full w-full overflow-hidden'
    : 'relative aspect-video min-h-video-min w-full overflow-hidden rounded-xl';

  return (
    <div
      className={classNames(
        containerClass,
        'bg-black',
        !isActive && 'pointer-events-none opacity-0',
      )}
    >
      {/* CRT Effects Layer - Behind content, only while loading */}
      {!isReady && (
        <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
          <div className="vhs-scanlines h-full w-full opacity-40 mix-blend-overlay" />
          <div className="crt-overlay !absolute !z-21 pointer-events-none inset-0 opacity-10" />
        </div>
      )}

      {/* Loading State */}
      {!isReady && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/80">
          <div className="text-center">
            <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-orange-500/50 border-t-orange-500" />
            <p className="glow-text font-mono text-orange-400 text-sm">
              LOADING SYSTEM...
            </p>
          </div>
        </div>
      )}

      <iframe
        ref={iframeRef}
        id="sc-widget"
        src={src}
        onLoad={initializeWidget}
        width="100%"
        height="100%"
        scrolling="no"
        frameBorder="0"
        allow="autoplay; encrypted-media"
        className={classNames(
          'h-full w-full transition-opacity duration-700',
          isReady && 'opacity-100',
          !isReady && 'opacity-0',
        )}
        title={providerSong.title}
      />
    </div>
  );
};

export const SoundCloudPlayer = memo(
  SoundCloudPlayerComponent,
  (prevProps, nextProps) => {
    return (
      prevProps.isVisible === nextProps.isVisible &&
      prevProps.onEnded === nextProps.onEnded &&
      prevProps.onLocalAlignmentChange === nextProps.onLocalAlignmentChange &&
      prevProps.onLocalPause === nextProps.onLocalPause &&
      prevProps.onLocalPlay === nextProps.onLocalPlay &&
      prevProps.onLocalSeek === nextProps.onLocalSeek &&
      prevProps.onLocalVolumeChange === nextProps.onLocalVolumeChange &&
      prevProps.preloadSong?.id === nextProps.preloadSong?.id
    );
  },
);

const EXPECTED_SEEK_TOLERANCE_MS = 1000;

const ALIGNED_POSITION_TOLERANCE_MS = 2000;

const MAX_VOLUME = 100;

const VOLUME_SAMPLE_MS = 1000;
