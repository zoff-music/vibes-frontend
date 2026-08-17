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

declare global {
  interface Window {
    SC?: SoundCloudApi;
  }
}

interface SoundCloudWidget {
  bind: (event: string, callback: (event?: unknown) => void) => void;
  getPosition: (callback: (currentTimeMs: number) => void) => void;
  isPaused: (callback: (isPaused: boolean) => void) => void;
  load: (url: string, options: SoundCloudWidgetLoadOptions) => void;
  pause: () => void;
  play: () => void;
  seekTo: (milliseconds: number) => void;
  setVolume: (volume: number) => void;
}

interface SoundCloudWidgetLoadOptions {
  auto_play: boolean;
  callback: () => void;
  hide_related: boolean;
  show_artwork: boolean;
  show_comments: boolean;
  show_reposts: boolean;
  show_teaser: boolean;
  show_user: boolean;
  single_active: boolean;
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
  preloadSong?: Song | null;
  onLocalPause?: () => void;
  onLocalPlay?: () => void;
  onLocalSeek?: (positionMs: number) => void;
  onLocalAlignmentChange?: (isAligned: boolean) => void;
  onLocalVolumeChange?: () => void;
  onNeedsUserGestureChange?: (needsGesture: boolean) => void;
  showInitialPlaybackOverlay?: boolean;
  volume?: number;
}

const SoundCloudPlayerComponent: React.FC<Props> = ({
  isVisible = true,
  onEnded,
  fill = false,
  preloadSong = null,
  onLocalAlignmentChange,
  onLocalPlay,
  onNeedsUserGestureChange,
  showInitialPlaybackOverlay = false,
  volume = MAX_VOLUME,
}) => {
  const currentSong = usePlaybackStore((state) => state.currentSong);
  const resetVersion = usePlaybackStore((state) => state.resetVersion);
  const updatedAt = usePlaybackStore((state) => state.updatedAt);
  const candidateProviderSong =
    currentSong?.sourceType === 'soundcloud' ? currentSong : preloadSong;
  const retainedProviderSongRef = useRef<Song | null>(null);
  if (candidateProviderSong?.sourceType === 'soundcloud') {
    retainedProviderSongRef.current = candidateProviderSong;
  }
  const providerSong = candidateProviderSong ?? retainedProviderSongRef.current;
  const isActive =
    isVisible && currentSong?.sourceType === 'soundcloud' && !!currentSong;

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<SoundCloudWidget | null>(null);
  const initialSourceIdRef = useRef<string | null>(null);
  const loadedSourceIdRef = useRef<string | null>(null);
  const loadingSourceIdRef = useRef<string | null>(null);
  const isActiveRef = useRef(isActive);
  const providerSongRef = useRef(providerSong);
  const showInitialPlaybackOverlayRef = useRef(showInitialPlaybackOverlay);
  const prewarmingRef = useRef(false);
  const restartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSynchronizedUpdateRef = useRef<string | null>(null);
  const latestWidgetPositionRef = useRef<number | null>(null);
  const expectedSeekPositionRef = useRef<number | null>(null);
  const lastAlignmentRef = useRef<boolean | null>(null);
  const lastResetVersionRef = useRef(resetVersion);
  const onEndedRef = useRef(onEnded);
  const onLocalAlignmentChangeRef = useRef(onLocalAlignmentChange);
  const desiredVolume = Math.min(MAX_VOLUME, Math.max(MIN_VOLUME, volume));
  const desiredVolumeRef = useRef(desiredVolume);
  desiredVolumeRef.current = desiredVolume;
  const [isReady, setIsReady] = useState(false);
  const [isPlaybackUnlocked, setIsPlaybackUnlocked] = useState(
    isPlaybackGestureUnlocked,
  );
  const [isWidgetPlaying, setIsWidgetPlaying] = useState(false);
  const [isWidgetMuted, setIsWidgetMuted] = useState(true);

  isActiveRef.current = isActive;
  providerSongRef.current = providerSong;
  showInitialPlaybackOverlayRef.current = showInitialPlaybackOverlay;
  if (!initialSourceIdRef.current && providerSong) {
    initialSourceIdRef.current = providerSong.sourceId;
    loadedSourceIdRef.current = providerSong.sourceId;
  }

  const shouldWidgetPlay = useCallback(() => {
    const playbackState = usePlaybackStore.getState();
    return (
      isActiveRef.current &&
      playbackState.currentSong?.sourceType === 'soundcloud' &&
      playbackState.currentSong.sourceId === loadedSourceIdRef.current &&
      playbackState.isPlaying &&
      (!showInitialPlaybackOverlayRef.current || isPlaybackGestureUnlocked())
    );
  }, []);

  const playWidget = useCallback((widget: SoundCloudWidget) => {
    claimProviderPlayback('soundcloud');
    widget.setVolume(desiredVolumeRef.current);
    setIsWidgetMuted(desiredVolumeRef.current === MIN_VOLUME);
    widget.play();
  }, []);

  const prewarmWidget = useCallback((widget: SoundCloudWidget) => {
    if (!isPlaybackGestureUnlocked() || prewarmingRef.current) return;
    prewarmingRef.current = true;
    widget.setVolume(MIN_VOLUME);
    setIsWidgetMuted(true);
    widget.play();
  }, []);

  const initializeWidget = useCallback(() => {
    const iframe = iframeRef.current;
    const soundCloud = window.SC;
    if (!iframe || !soundCloud || widgetRef.current) return;

    const [widgetError, widget] = safeWrap(() => soundCloud.Widget(iframe));
    if (widgetError || !widget) {
      console.error('[SoundCloud Widget] Initialization error:', widgetError);
      return;
    }
    widgetRef.current = widget;

    widget.bind(soundCloud.Widget.Events.READY, () => {
      setIsReady(true);
      if (shouldWidgetPlay()) {
        playWidget(widget);
        return;
      }
      prewarmWidget(widget);
    });

    widget.bind(soundCloud.Widget.Events.FINISH, () => {
      if (!isActiveRef.current) return;
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
      containerRef.current?.setAttribute(
        'data-provider-position-ms',
        String(Math.round(event.currentPosition)),
      );
    });

    widget.bind(soundCloud.Widget.Events.PLAY, () => {
      const allowed = shouldWidgetPlay();
      if (!allowed) {
        widget.setVolume(MIN_VOLUME);
        setIsWidgetMuted(true);
        setIsWidgetPlaying(false);
        if (prewarmingRef.current) {
          prewarmingRef.current = false;
          setTimeout(() => widget.pause(), PREWARM_PLAY_TIME_MS);
          return;
        }
        widget.pause();
        return;
      }

      prewarmingRef.current = false;
      if (restartTimerRef.current) {
        clearTimeout(restartTimerRef.current);
        restartTimerRef.current = null;
      }
      claimProviderPlayback('soundcloud');
      widget.setVolume(desiredVolumeRef.current);
      setIsWidgetMuted(desiredVolumeRef.current === MIN_VOLUME);
      setIsWidgetPlaying(true);
    });

    widget.bind(soundCloud.Widget.Events.PAUSE, () => {
      const shouldRestart = shouldWidgetPlay();
      setIsWidgetPlaying(false);
      if (!shouldRestart || restartTimerRef.current) return;
      restartTimerRef.current = setTimeout(() => {
        restartTimerRef.current = null;
        const currentWidget = widgetRef.current;
        if (!currentWidget || !shouldWidgetPlay()) return;
        playWidget(currentWidget);
      }, PAUSE_RECOVERY_DELAY_MS);
    });

    widget.bind(soundCloud.Widget.Events.ERROR, (event?: unknown) => {
      console.error('[SoundCloud Widget] Error:', event);
    });
  }, [playWidget, prewarmWidget, shouldWidgetPlay]);

  useEffect(() => {
    onEndedRef.current = onEnded;
    onLocalAlignmentChangeRef.current = onLocalAlignmentChange;
  }, [onEnded, onLocalAlignmentChange]);

  useEffect(() => {
    return registerProviderPlayback('soundcloud', () => {
      const widget = widgetRef.current;
      if (!widget || prewarmingRef.current) return;
      widget.setVolume(MIN_VOLUME);
      widget.pause();
      setIsWidgetPlaying(false);
      setIsWidgetMuted(true);
    });
  }, []);

  useEffect(() => {
    return subscribeToPlaybackGestureUnlock(() => {
      setIsPlaybackUnlocked(true);
      const widget = widgetRef.current;
      if (!widget || shouldWidgetPlay()) return;
      prewarmWidget(widget);
    });
  }, [shouldWidgetPlay, prewarmWidget]);

  useEffect(() => {
    if (!window.SC) {
      const script = document.createElement('script');
      script.src = 'https://w.soundcloud.com/player/api.js';
      script.async = true;
      script.onload = initializeWidget;
      document.body.appendChild(script);
      return;
    }
    initializeWidget();
  }, [initializeWidget]);

  useEffect(() => {
    const widget = widgetRef.current;
    if (!widget || !isReady || !providerSong) return;
    if (loadedSourceIdRef.current === providerSong.sourceId) return;
    if (loadingSourceIdRef.current === providerSong.sourceId) return;

    const sourceId = providerSong.sourceId;
    loadingSourceIdRef.current = sourceId;
    prewarmingRef.current = false;
    lastSynchronizedUpdateRef.current = null;
    expectedSeekPositionRef.current = null;
    latestWidgetPositionRef.current = null;
    lastAlignmentRef.current = null;
    setIsReady(false);
    setIsWidgetPlaying(false);
    setIsWidgetMuted(true);
    widget.setVolume(MIN_VOLUME);
    widget.load(getSoundCloudUrl(sourceId), {
      ...SOUNDCLOUD_WIDGET_OPTIONS,
      auto_play: isPlaybackGestureUnlocked(),
      callback: () => {
        if (loadingSourceIdRef.current !== sourceId) return;
        loadingSourceIdRef.current = null;
        loadedSourceIdRef.current = sourceId;
        lastSynchronizedUpdateRef.current =
          usePlaybackStore.getState().updatedAt;
        setIsReady(true);
      },
    });
  }, [isReady, providerSong]);

  useEffect(() => {
    const widget = widgetRef.current;
    if (!widget || !isReady || loadingSourceIdRef.current) return;
    if (shouldWidgetPlay()) {
      playWidget(widget);
      return;
    }
    if (prewarmingRef.current) return;
    widget.setVolume(MIN_VOLUME);
    widget.pause();
    setIsWidgetPlaying(false);
    setIsWidgetMuted(true);
  }, [isReady, shouldWidgetPlay, playWidget]);

  useEffect(() => {
    const widget = widgetRef.current;
    if (!widget || !isActive || !isReady) return;
    widget.setVolume(desiredVolume);
    setIsWidgetMuted(desiredVolume === MIN_VOLUME);
  }, [desiredVolume, isActive, isReady]);

  useEffect(() => {
    if (!isActive) {
      lastResetVersionRef.current = resetVersion;
    }
  }, [isActive, resetVersion]);

  useEffect(() => {
    const widget = widgetRef.current;
    if (!widget || !isActive || !isReady) return;

    const shouldReset = lastResetVersionRef.current !== resetVersion;
    if (shouldReset) {
      lastResetVersionRef.current = resetVersion;
    }
    if (lastSynchronizedUpdateRef.current === updatedAt && !shouldReset) return;

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
  }, [isActive, isReady, resetVersion, updatedAt]);

  useEffect(() => {
    if (!isActive || !isReady || !onLocalAlignmentChange) return;
    let cancelled = false;
    const interval = setInterval(() => {
      const widget = widgetRef.current;
      const positionMs = latestWidgetPositionRef.current;
      if (!widget || positionMs === null) return;
      widget.isPaused((isPaused) => {
        if (cancelled) return;
        setIsWidgetPlaying(!isPaused);
        const playbackStore = usePlaybackStore.getState();
        const authoritativePlayback = playbackStore.authoritativePlayback;
        const aligned =
          providerSong?.sourceId ===
            authoritativePlayback.currentSong?.sourceId &&
          !isPaused === authoritativePlayback.isPlaying &&
          Math.abs(positionMs - playbackStore.getAuthoritativePositionMs()) <=
            ALIGNED_POSITION_TOLERANCE_MS;
        if (lastAlignmentRef.current === aligned) return;
        lastAlignmentRef.current = aligned;
        onLocalAlignmentChangeRef.current?.(aligned);
      });
    }, VOLUME_SAMPLE_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [isActive, isReady, onLocalAlignmentChange, providerSong?.sourceId]);

  useEffect(() => {
    return () => {
      if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
    };
  }, []);

  const handleUserGesturePlay = useCallback(() => {
    const widget = widgetRef.current;
    if (!widget) return;
    setIsPlaybackUnlocked(true);
    markPlaybackGestureUnlocked();
    onLocalPlay?.();
    const playbackState = usePlaybackStore.getState();
    playbackState.updateActualPosition();
    const actualPositionMs = usePlaybackStore.getState().actualPositionMs;
    expectedSeekPositionRef.current = actualPositionMs;
    widget.seekTo(actualPositionMs);
    playWidget(widget);
  }, [onLocalPlay, playWidget]);

  const showClickToPlay =
    isActive && showInitialPlaybackOverlay && !isPlaybackUnlocked;

  useEffect(() => {
    if (!isActive) return;
    onNeedsUserGestureChange?.(showClickToPlay);
  }, [isActive, onNeedsUserGestureChange, showClickToPlay]);

  if (providerSong?.sourceType !== 'soundcloud') return null;
  const initialSourceId = initialSourceIdRef.current;
  if (!initialSourceId) return null;

  const containerClass = fill
    ? 'relative h-full w-full overflow-hidden'
    : 'relative aspect-video min-h-video-min w-full overflow-hidden rounded-xl';

  return (
    <div
      ref={containerRef}
      data-provider-muted={isWidgetMuted ? 'true' : 'false'}
      data-provider-playing={isWidgetPlaying ? 'true' : 'false'}
      data-provider="soundcloud"
      className={classNames(
        containerClass,
        'bg-black',
        !isActive && 'pointer-events-none opacity-0',
      )}
    >
      {!isReady && (
        <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
          <div className="vhs-scanlines h-full w-full opacity-40 mix-blend-overlay" />
          <div className="crt-overlay !absolute !z-21 pointer-events-none inset-0 opacity-10" />
        </div>
      )}
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
          src={getSoundCloudWidgetSrc(initialSourceId)}
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
  (previous, next) =>
    previous.appContext === next.appContext &&
    previous.isVisible === next.isVisible &&
    previous.onEnded === next.onEnded &&
    previous.onLocalAlignmentChange === next.onLocalAlignmentChange &&
    previous.onLocalPause === next.onLocalPause &&
    previous.onLocalPlay === next.onLocalPlay &&
    previous.onLocalSeek === next.onLocalSeek &&
    previous.onNeedsUserGestureChange === next.onNeedsUserGestureChange &&
    previous.showInitialPlaybackOverlay === next.showInitialPlaybackOverlay &&
    previous.preloadSong?.id === next.preloadSong?.id &&
    previous.volume === next.volume,
);

const EXPECTED_SEEK_TOLERANCE_MS = 1000;
const ALIGNED_POSITION_TOLERANCE_MS = 2000;
const SYNCHRONIZATION_TOLERANCE_MS = 5000;
const MAX_VOLUME = 100;
const MIN_VOLUME = 0;
const PREWARM_PLAY_TIME_MS = 100;
const PAUSE_RECOVERY_DELAY_MS = 350;
const VOLUME_SAMPLE_MS = 2000;

const SOUNDCLOUD_WIDGET_OPTIONS = {
  hide_related: true,
  show_artwork: true,
  show_comments: false,
  show_reposts: false,
  show_teaser: false,
  show_user: true,
  single_active: false,
  visual: false,
};

function getSoundCloudUrl(sourceId: string): string {
  if (sourceId.startsWith('http')) return sourceId;
  return `https://api.soundcloud.com/tracks/${sourceId}`;
}

function getSoundCloudWidgetSrc(sourceId: string): string {
  const query = new URLSearchParams({
    auto_play: 'false',
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
