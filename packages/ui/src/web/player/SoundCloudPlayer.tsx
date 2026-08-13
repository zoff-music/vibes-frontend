import {
  classNames,
  type Song,
  safeWrap,
  usePlaybackStore,
} from '@vibes/shared';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { ClickToPlayOverlay } from './ClickToPlayOverlay';
import {
  isPlaybackGestureUnlocked,
  markPlaybackGestureUnlocked,
  subscribeToPlaybackGestureUnlock,
} from './playbackGesture';
import {
  claimProviderPlayback,
  registerProviderPlayback,
} from './providerPlaybackCoordinator';

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
  load: (url: string, options: SoundCloudWidgetLoadOptions) => void;
  pause: () => void;
  play: () => void;
  seekTo: (milliseconds: number) => void;
  setVolume: (volume: number) => void;
}

interface SoundCloudWidgetLoadOptions {
  auto_play: boolean;
  hide_related: boolean;
  single_active: boolean;
  show_artwork: boolean;
  show_comments: boolean;
  show_reposts: boolean;
  show_teaser: boolean;
  show_user: boolean;
  visual: boolean;
}

interface SoundCloudApi {
  Widget: {
    (iframe: HTMLIFrameElement): SoundCloudWidget;
    Events: {
      ERROR: string;
      FINISH: string;
      PAUSE: string;
      PLAY: string;
      PLAY_PROGRESS: string;
      READY: string;
      SEEK: string;
    };
  };
}

interface Props {
  appContext?: 'platform' | 'cast';
  isVisible?: boolean;
  onEnded?: () => void;
  fill?: boolean;
  fixedSong?: Song | null;
  preloadSong?: Song | null;
  onLocalPause?: () => void;
  onLocalPlay?: () => void;
  onLocalSeek?: (positionMs: number) => void;
  onLocalAlignmentChange?: (isAligned: boolean) => void;
  onLocalVolumeChange?: () => void;
  onNeedsUserGestureChange?: (needsGesture: boolean) => void;
  showInitialPlaybackOverlay?: boolean;
}

const SoundCloudPlayerComponent: React.FC<Props> = ({
  appContext = 'platform',
  isVisible = true,
  onEnded,
  fill = false,
  fixedSong = null,
  preloadSong = null,
  onLocalAlignmentChange,
  onLocalVolumeChange,
  onLocalPlay,
  onNeedsUserGestureChange,
  showInitialPlaybackOverlay = false,
}) => {
  const currentSong = usePlaybackStore((state) => state.currentSong);
  const isPlaying = usePlaybackStore((state) => state.isPlaying);
  const resetVersion = usePlaybackStore((state) => state.resetVersion);
  const updatedAt = usePlaybackStore((state) => state.updatedAt);
  const candidateProviderSong =
    fixedSong ??
    (currentSong?.sourceType === 'soundcloud' ? currentSong : preloadSong);
  const retainedProviderSongRef = useRef<Song | null>(null);
  if (candidateProviderSong?.sourceType === 'soundcloud') {
    retainedProviderSongRef.current = candidateProviderSong;
  }
  const providerSong = candidateProviderSong ?? retainedProviderSongRef.current;
  const providerSongRef = useRef(providerSong);
  providerSongRef.current = providerSong;
  const loadedSourceIdRef = useRef<string | null>(null);
  const initialProviderSongRef = useRef<Song | null>(null);
  if (!initialProviderSongRef.current && providerSong) {
    initialProviderSongRef.current = providerSong;
    loadedSourceIdRef.current = providerSong.sourceId;
  }
  const initialProviderSong = initialProviderSongRef.current;
  const isActive =
    isVisible &&
    currentSong?.sourceType === 'soundcloud' &&
    !!currentSong &&
    (!fixedSong || fixedSong.sourceId === currentSong.sourceId);
  const isVisibleRef = useRef(isVisible);
  const showInitialPlaybackOverlayRef = useRef(showInitialPlaybackOverlay);
  isVisibleRef.current = isVisible;
  showInitialPlaybackOverlayRef.current = showInitialPlaybackOverlay;
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const widgetRef = useRef<SoundCloudWidget | null>(null);
  const lastSynchronizedUpdateRef = useRef<string | null>(null);
  const latestWidgetPositionRef = useRef<number | null>(null);
  const lastAlignmentRef = useRef<boolean | null>(null);
  const expectedPlayingStateRef = useRef<boolean | null>(null);
  const isPrewarmingRef = useRef(false);
  const expectedSeekPositionRef = useRef<number | null>(null);
  const onEndedRef = useRef(onEnded);
  const onLocalAlignmentChangeRef = useRef(onLocalAlignmentChange);
  const onLocalVolumeChangeRef = useRef(onLocalVolumeChange);
  const lastObservedVolumeRef = useRef<number | null>(null);
  const lastResetVersionRef = useRef(resetVersion);
  const [isReady, setIsReady] = useState(false);
  const [isPlaybackUnlocked, setIsPlaybackUnlocked] = useState(
    isPlaybackGestureUnlocked,
  );
  const [isWidgetPlaying, setIsWidgetPlaying] = useState(false);
  const [isWidgetMuted, setIsWidgetMuted] = useState(true);

  const pauseWidget = useCallback(() => {
    const widget = widgetRef.current;
    if (!widget) return;
    widget.setVolume(MIN_VOLUME);
    widget.pause();
    setIsWidgetPlaying(false);
    setIsWidgetMuted(true);
  }, []);

  useEffect(() => {
    onEndedRef.current = onEnded;
    onLocalAlignmentChangeRef.current = onLocalAlignmentChange;
    onLocalVolumeChangeRef.current = onLocalVolumeChange;
  }, [onEnded, onLocalAlignmentChange, onLocalVolumeChange]);

  useEffect(() => {
    return registerProviderPlayback('soundcloud', () => {
      if (isPrewarmingRef.current) return;
      pauseWidget();
    });
  }, [pauseWidget]);

  useEffect(() => {
    return subscribeToPlaybackGestureUnlock(() => {
      setIsPlaybackUnlocked(true);
      const activeSong = usePlaybackStore.getState().currentSong;
      const isThisWidgetActive =
        activeSong?.sourceType === 'soundcloud' &&
        activeSong.sourceId === providerSongRef.current?.sourceId;
      if (!isThisWidgetActive) {
        const widget = widgetRef.current;
        if (!widget) return;
        widget.setVolume(MIN_VOLUME);
        isPrewarmingRef.current = true;
        expectedPlayingStateRef.current = false;
        widget.play();
        setIsWidgetPlaying(false);
        setIsWidgetMuted(true);
      }
    });
  }, []);

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
      latestWidgetPositionRef.current = actualPositionMs;
      expectedSeekPositionRef.current = actualPositionMs;
      widget.seekTo(actualPositionMs);
      lastSynchronizedUpdateRef.current = usePlaybackStore.getState().updatedAt;
      const playbackState = usePlaybackStore.getState();
      const shouldPlay =
        isVisibleRef.current &&
        playbackState.currentSong?.sourceType === 'soundcloud' &&
        playbackState.isPlaying &&
        (!showInitialPlaybackOverlayRef.current || isPlaybackGestureUnlocked());
      if (shouldPlay) {
        isPrewarmingRef.current = false;
        claimProviderPlayback('soundcloud');
        widget.setVolume(MIN_VOLUME);
        setIsWidgetMuted(true);
        expectedPlayingStateRef.current = true;
        widget.play();
      } else {
        expectedPlayingStateRef.current = false;
        if (isPlaybackGestureUnlocked()) {
          widget.setVolume(MIN_VOLUME);
          setIsWidgetMuted(true);
          isPrewarmingRef.current = true;
          widget.play();
        } else {
          pauseWidget();
        }
      }
    });

    widget.bind(soundCloud.Widget.Events.FINISH, () => {
      const activeSong = usePlaybackStore.getState().currentSong;
      if (activeSong?.sourceId !== providerSongRef.current?.sourceId) return;
      onEndedRef.current?.();
    });

    widget.bind(soundCloud.Widget.Events.SEEK, () => {
      widget.getPosition((positionMs) => {
        latestWidgetPositionRef.current = positionMs;
        const expectedPositionMs = expectedSeekPositionRef.current;
        expectedSeekPositionRef.current = null;
        if (
          expectedPositionMs !== null &&
          Math.abs(positionMs - expectedPositionMs) <=
            EXPECTED_SEEK_TOLERANCE_MS
        ) {
          return;
        }
      });
    });

    widget.bind(soundCloud.Widget.Events.PLAY_PROGRESS, (event?: unknown) => {
      if (!isSoundCloudProgressEvent(event)) return;
      latestWidgetPositionRef.current = event.currentPosition;
    });

    widget.bind(soundCloud.Widget.Events.PLAY, () => {
      setIsWidgetPlaying(true);
      const playbackState = usePlaybackStore.getState();
      const isPlaybackAllowed =
        isVisibleRef.current &&
        playbackState.currentSong?.sourceType === 'soundcloud' &&
        playbackState.currentSong.sourceId ===
          providerSongRef.current?.sourceId &&
        playbackState.isPlaying &&
        (!showInitialPlaybackOverlayRef.current || isPlaybackGestureUnlocked());
      if (!isPlaybackAllowed) {
        isPrewarmingRef.current = false;
        expectedPlayingStateRef.current = false;
        pauseWidget();
        setIsWidgetPlaying(false);
        return;
      }
      claimProviderPlayback('soundcloud');
      widget.setVolume(MAX_VOLUME);
      setIsWidgetMuted(false);
      if (expectedPlayingStateRef.current === true) {
        expectedPlayingStateRef.current = null;
        return;
      }
      expectedPlayingStateRef.current = null;
      if (usePlaybackStore.getState().isPlaying) {
        return;
      }
    });

    widget.bind(soundCloud.Widget.Events.PAUSE, () => {
      setIsWidgetPlaying(false);
      if (expectedPlayingStateRef.current === false) {
        expectedPlayingStateRef.current = null;
        return;
      }
      expectedPlayingStateRef.current = null;
      if (!usePlaybackStore.getState().isPlaying) {
        return;
      }
    });

    widget.bind(soundCloud.Widget.Events.ERROR, (e?: unknown) => {
      console.error('[SoundCloud Widget] Error:', e);
    });
  };

  useEffect(() => {
    const widget = widgetRef.current;
    if (!widget || !isReady || !providerSong) return;
    if (loadedSourceIdRef.current === providerSong.sourceId) return;

    loadedSourceIdRef.current = providerSong.sourceId;
    widgetRef.current = null;
    isPrewarmingRef.current = false;
    lastSynchronizedUpdateRef.current = null;
    expectedPlayingStateRef.current = null;
    expectedSeekPositionRef.current = null;
    latestWidgetPositionRef.current = null;
    lastAlignmentRef.current = null;
    lastObservedVolumeRef.current = null;
    setIsReady(false);
    setIsWidgetPlaying(false);

    const shouldPlay =
      isActive &&
      isPlaying &&
      (!showInitialPlaybackOverlay || isPlaybackUnlocked);
    if (shouldPlay) {
      claimProviderPlayback('soundcloud');
      widget.setVolume(MIN_VOLUME);
      setIsWidgetMuted(true);
    } else {
      widget.setVolume(MIN_VOLUME);
      setIsWidgetMuted(true);
    }
    expectedPlayingStateRef.current = shouldPlay;
    widget.load(getSoundCloudUrl(providerSong.sourceId), {
      ...SOUNDCLOUD_WIDGET_OPTIONS,
      auto_play: false,
    });
  }, [
    appContext,
    isActive,
    isPlaybackUnlocked,
    isPlaying,
    isReady,
    providerSong,
    showInitialPlaybackOverlay,
  ]);

  useEffect(() => {
    if (!isActive) {
      lastResetVersionRef.current = resetVersion;
    }
  }, [isActive, resetVersion]);

  useEffect(() => {
    if (!widgetRef.current || !isActive || !isReady) return;

    const shouldReset = lastResetVersionRef.current !== resetVersion;
    if (shouldReset) {
      claimProviderPlayback('soundcloud');
      widgetRef.current.setVolume(MAX_VOLUME);
      setIsWidgetMuted(false);
      lastResetVersionRef.current = resetVersion;
    }
    if (lastSynchronizedUpdateRef.current !== updatedAt || shouldReset) {
      const widget = widgetRef.current;
      const actualPositionMs = usePlaybackStore.getState().actualPositionMs;
      lastSynchronizedUpdateRef.current = updatedAt;
      widget.getPosition((widgetPositionMs) => {
        latestWidgetPositionRef.current = widgetPositionMs;
        if (
          !shouldReset &&
          Math.abs(widgetPositionMs - actualPositionMs) <
            SYNCHRONIZATION_TOLERANCE_MS
        ) {
          return;
        }
        expectedSeekPositionRef.current = actualPositionMs;
        widget.seekTo(actualPositionMs);
      });
    }
  }, [isActive, isReady, resetVersion, updatedAt]);

  useEffect(() => {
    if (!widgetRef.current || !isReady) return;
    const shouldPlay =
      isActive &&
      isPlaying &&
      (!showInitialPlaybackOverlay || isPlaybackUnlocked);
    if (shouldPlay) {
      isPrewarmingRef.current = false;
      claimProviderPlayback('soundcloud');
      widgetRef.current.setVolume(MIN_VOLUME);
      setIsWidgetMuted(true);
      expectedPlayingStateRef.current = true;
      widgetRef.current.play();
    } else {
      expectedPlayingStateRef.current = false;
      if (isPrewarmingRef.current) return;
      pauseWidget();
    }
  }, [
    isActive,
    isPlaybackUnlocked,
    isPlaying,
    isReady,
    showInitialPlaybackOverlay,
  ]);

  useEffect(() => {
    if (appContext !== 'cast' || !isActive || !isPlaying || !isReady) {
      return;
    }

    let attempts = 0;
    const retryPlayback = () => {
      const widget = widgetRef.current;
      if (!widget) return;

      const playbackState = usePlaybackStore.getState();
      if (
        playbackState.currentSong?.sourceType !== 'soundcloud' ||
        !playbackState.isPlaying
      ) {
        expectedPlayingStateRef.current = false;
        pauseWidget();
        return;
      }

      widget.isPaused((isPaused) => {
        if (!isPaused) return;
        claimProviderPlayback('soundcloud');
        widget.setVolume(MIN_VOLUME);
        setIsWidgetMuted(true);
        widget.play();
      });
    };

    retryPlayback();
    const interval = setInterval(() => {
      attempts += 1;
      retryPlayback();
      if (attempts >= MAX_CAST_AUTOPLAY_RETRIES) {
        clearInterval(interval);
      }
    }, CAST_AUTOPLAY_RETRY_MS);

    return () => clearInterval(interval);
  }, [appContext, isActive, isPlaying, isReady]);

  useEffect(() => {
    if (!isActive || !isReady || !onLocalAlignmentChange) return;

    let cancelled = false;
    const interval = setInterval(() => {
      const widget = widgetRef.current;
      if (!widget) return;

      const positionMs = latestWidgetPositionRef.current;
      if (positionMs === null) return;
      widget.getVolume((volume) => {
        widget.isPaused((isPaused) => {
          if (cancelled) return;
          setIsWidgetPlaying(!isPaused);

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
            Math.abs(positionMs - playbackStore.getAuthoritativePositionMs()) <=
              ALIGNED_POSITION_TOLERANCE_MS &&
            volume === MAX_VOLUME;
          if (lastAlignmentRef.current !== isAligned) {
            lastAlignmentRef.current = isAligned;
            onLocalAlignmentChangeRef.current?.(isAligned);
          }
        });
      });
    }, VOLUME_SAMPLE_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [isActive, isReady, onLocalAlignmentChange, providerSong?.sourceId]);

  const handleUserGesturePlay = useCallback(() => {
    const widget = widgetRef.current;
    if (!widget) return;

    onLocalPlay?.();
    const playbackState = usePlaybackStore.getState();
    playbackState.updateActualPosition();
    const actualPositionMs = usePlaybackStore.getState().actualPositionMs;
    expectedSeekPositionRef.current = actualPositionMs;
    claimProviderPlayback('soundcloud');
    widget.setVolume(MAX_VOLUME);
    setIsWidgetMuted(false);
    widget.seekTo(actualPositionMs);
    widget.play();
    setIsPlaybackUnlocked(true);
    markPlaybackGestureUnlocked();
  }, [onLocalPlay]);

  const showClickToPlay =
    isActive && showInitialPlaybackOverlay && !isPlaybackUnlocked;

  useEffect(() => {
    if (!isActive) return;
    onNeedsUserGestureChange?.(showClickToPlay);
  }, [isActive, onNeedsUserGestureChange, showClickToPlay]);

  if (!providerSong) {
    return null;
  }

  if (providerSong.sourceType !== 'soundcloud') {
    return null;
  }

  if (!initialProviderSong) {
    return null;
  }

  const src = getSoundCloudWidgetSrc(initialProviderSong.sourceId);

  const containerClass = fill
    ? 'relative h-full w-full overflow-hidden'
    : 'relative aspect-video min-h-video-min w-full overflow-hidden rounded-xl';

  return (
    <div
      data-provider-muted={isWidgetMuted ? 'true' : 'false'}
      data-provider-playing={isWidgetPlaying ? 'true' : 'false'}
      data-provider="soundcloud"
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

      <div className="flex h-full w-full flex-col bg-black">
        <img
          alt={`${providerSong.title} artwork`}
          className="pointer-events-none min-h-0 w-full flex-1 object-contain object-center"
          src={providerSong.thumbnailUrl}
        />
        <iframe
          ref={iframeRef}
          id="sc-widget"
          src={src}
          onLoad={initializeWidget}
          width="100%"
          height="166"
          scrolling="no"
          frameBorder="0"
          allow="autoplay; encrypted-media"
          className="h-40 w-full shrink-0 border-0"
          title={providerSong.title}
        />
      </div>
      {showClickToPlay && (
        <ClickToPlayOverlay onClick={handleUserGesturePlay} />
      )}
    </div>
  );
};

export const SoundCloudPlayer = memo(
  SoundCloudPlayerComponent,
  (prevProps, nextProps) => {
    return (
      prevProps.appContext === nextProps.appContext &&
      prevProps.fixedSong?.id === nextProps.fixedSong?.id &&
      prevProps.isVisible === nextProps.isVisible &&
      prevProps.onEnded === nextProps.onEnded &&
      prevProps.onLocalAlignmentChange === nextProps.onLocalAlignmentChange &&
      prevProps.onLocalPause === nextProps.onLocalPause &&
      prevProps.onLocalPlay === nextProps.onLocalPlay &&
      prevProps.onLocalSeek === nextProps.onLocalSeek &&
      prevProps.onLocalVolumeChange === nextProps.onLocalVolumeChange &&
      prevProps.onNeedsUserGestureChange ===
        nextProps.onNeedsUserGestureChange &&
      prevProps.showInitialPlaybackOverlay ===
        nextProps.showInitialPlaybackOverlay &&
      prevProps.preloadSong?.id === nextProps.preloadSong?.id
    );
  },
);

const EXPECTED_SEEK_TOLERANCE_MS = 1000;

const ALIGNED_POSITION_TOLERANCE_MS = 2000;

const SYNCHRONIZATION_TOLERANCE_MS = 5000;

const MAX_VOLUME = 100;

const SOUNDCLOUD_WIDGET_OPTIONS: SoundCloudWidgetLoadOptions = {
  auto_play: false,
  hide_related: true,
  single_active: false,
  show_artwork: true,
  show_comments: false,
  show_reposts: false,
  show_teaser: false,
  show_user: true,
  visual: false,
};

function getSoundCloudUrl(sourceId: string): string {
  if (sourceId.startsWith('http')) return sourceId;
  return `https://api.soundcloud.com/tracks/${sourceId}`;
}

function getSoundCloudWidgetSrc(sourceId: string): string {
  const query = new URLSearchParams({
    ...Object.fromEntries(
      Object.entries(SOUNDCLOUD_WIDGET_OPTIONS).map(([key, value]) => [
        key,
        String(value),
      ]),
    ),
    url: getSoundCloudUrl(sourceId),
  });
  return `https://w.soundcloud.com/player/?${query.toString()}`;
}

const MIN_VOLUME = 0;

const CAST_AUTOPLAY_RETRY_MS = 500;

const MAX_CAST_AUTOPLAY_RETRIES = 12;

const VOLUME_SAMPLE_MS = 2000;

interface SoundCloudProgressEvent {
  currentPosition: number;
}

function isSoundCloudProgressEvent(
  event: unknown,
): event is SoundCloudProgressEvent {
  return (
    !!event &&
    typeof event === 'object' &&
    'currentPosition' in event &&
    typeof event.currentPosition === 'number'
  );
}
