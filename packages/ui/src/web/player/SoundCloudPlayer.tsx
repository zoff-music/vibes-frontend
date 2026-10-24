import {
  classNames,
  type PlaylistItem,
  resolvePlaylistItemArtwork,
  safeWrap,
  usePlaybackStore,
} from '@vibes/shared';
import {
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'preact/compat';
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
import { replaceIframeNavigation } from './replaceIframeNavigation';

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
  allowUnmutedAutoplay?: boolean;
  appContext?: 'platform' | 'cast';
  isVisible?: boolean;
  onEnded?: () => void;
  fill?: boolean;
  preloadPlaylistItem?: PlaylistItem | null;
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
  allowUnmutedAutoplay = false,
  isVisible = true,
  onEnded,
  fill = false,
  preloadPlaylistItem = null,
  onLocalAlignmentChange,
  onLocalPlay,
  onNeedsUserGestureChange,
  showInitialPlaybackOverlay = false,
  volume = MAX_VOLUME,
}) => {
  const currentPlaylistItem = usePlaybackStore(
    (state) => state.currentPlaylistItem,
  );
  const isPlaying = usePlaybackStore((state) => state.isPlaying);
  const resetVersion = usePlaybackStore((state) => state.resetVersion);
  const updatedAt = usePlaybackStore((state) => state.updatedAt);
  const candidateProviderPlaylistItem =
    currentPlaylistItem?.sourceType === 'soundcloud'
      ? currentPlaylistItem
      : preloadPlaylistItem;
  const [retainedProviderPlaylistItem, setRetainedProviderPlaylistItem] =
    useState(candidateProviderPlaylistItem);

  if (
    candidateProviderPlaylistItem?.sourceType === 'soundcloud' &&
    candidateProviderPlaylistItem !== retainedProviderPlaylistItem
  ) {
    setRetainedProviderPlaylistItem(candidateProviderPlaylistItem);
  }

  const providerPlaylistItem =
    candidateProviderPlaylistItem ?? retainedProviderPlaylistItem;
  const isActive =
    isVisible &&
    currentPlaylistItem?.sourceType === 'soundcloud' &&
    !!currentPlaylistItem;

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<SoundCloudWidget | null>(null);
  const [initialSourceId, setInitialSourceId] = useState(
    providerPlaylistItem?.sourceId ?? null,
  );

  if (!initialSourceId && providerPlaylistItem)
    setInitialSourceId(providerPlaylistItem.sourceId);

  const loadedSourceIdRef = useRef(initialSourceId);
  const loadingSourceIdRef = useRef<string | null>(null);
  const isActiveRef = useRef(isActive);
  const providerPlaylistItemRef = useRef(providerPlaylistItem);
  const showInitialPlaybackOverlayRef = useRef(showInitialPlaybackOverlay);
  const allowUnmutedAutoplayRef = useRef(allowUnmutedAutoplay);
  const needsUserGestureRef = useRef(false);
  const prewarmingRef = useRef(false);
  const restartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSynchronizedUpdateRef = useRef<string | null>(null);
  const seekSettlingUntilRef = useRef(0);
  const lastSeekAtRef = useRef(0);
  const seekTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const misalignedSamplesRef = useRef(0);
  const lastAlignmentRef = useRef<boolean | null>(null);
  const lastResetVersionRef = useRef(resetVersion);
  const onEndedRef = useRef(onEnded);
  const onLocalAlignmentChangeRef = useRef(onLocalAlignmentChange);
  const desiredVolume = Math.min(MAX_VOLUME, Math.max(MIN_VOLUME, volume));
  const desiredVolumeRef = useRef(desiredVolume);
  const [isReady, setIsReady] = useState(false);
  const [isPlaybackUnlocked, setIsPlaybackUnlocked] = useState(
    isPlaybackGestureUnlocked,
  );
  const [isWidgetPlaying, setIsWidgetPlaying] = useState(false);
  const [startedSourceId, setStartedSourceId] = useState<string | null>(null);
  const hasStartedPlayback =
    !!startedSourceId && startedSourceId === providerPlaylistItem?.sourceId;
  const [isWidgetMuted, setIsWidgetMuted] = useState(true);
  const [needsUserGesture, setNeedsUserGesture] = useState(false);
  const [isPlaybackStarting, setIsPlaybackStarting] = useState(true);
  const [playbackStartDeadline, setPlaybackStartDeadline] = useState(0);

  useLayoutEffect(() => {
    setIsPlaybackStarting(true);
    setPlaybackStartDeadline(0);

    if (
      !isActive ||
      !isReady ||
      !isPlaying ||
      providerPlaylistItem?.sourceId !== loadedSourceIdRef.current
    )
      return;

    setPlaybackStartDeadline(Date.now() + PLAYBACK_START_TIMEOUT_MS);
  }, [isActive, isReady, isPlaying, providerPlaylistItem?.sourceId]);

  useEffect(() => {
    if (!playbackStartDeadline) return;

    const timeout = setTimeout(
      () => {
        setIsPlaybackStarting(false);
      },
      Math.max(0, playbackStartDeadline - Date.now()),
    );

    return () => clearTimeout(timeout);
  }, [playbackStartDeadline]);

  useLayoutEffect(() => {
    desiredVolumeRef.current = desiredVolume;
    isActiveRef.current = isActive;
    providerPlaylistItemRef.current = providerPlaylistItem;
    showInitialPlaybackOverlayRef.current = showInitialPlaybackOverlay;
    allowUnmutedAutoplayRef.current = allowUnmutedAutoplay;
    needsUserGestureRef.current = needsUserGesture;

    if (!loadedSourceIdRef.current && initialSourceId) {
      loadedSourceIdRef.current = initialSourceId;
    }
  }, [
    desiredVolume,
    isActive,
    providerPlaylistItem,
    showInitialPlaybackOverlay,
    allowUnmutedAutoplay,
    needsUserGesture,
    initialSourceId,
  ]);

  const shouldWidgetPlay = useCallback(() => {
    const playbackState = usePlaybackStore.getState();

    return (
      isActiveRef.current &&
      playbackState.currentPlaylistItem?.sourceType === 'soundcloud' &&
      playbackState.currentPlaylistItem.sourceId ===
        loadedSourceIdRef.current &&
      playbackState.isPlaying &&
      !needsUserGestureRef.current &&
      (!showInitialPlaybackOverlayRef.current ||
        allowUnmutedAutoplayRef.current ||
        isPlaybackGestureUnlocked())
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

  const seekWidget = useCallback(() => {
    if (seekTimerRef.current) clearTimeout(seekTimerRef.current);

    const seek = () => {
      seekTimerRef.current = null;
      const widget = widgetRef.current;
      const playbackState = usePlaybackStore.getState();

      if (
        !widget ||
        !isActiveRef.current ||
        loadingSourceIdRef.current ||
        playbackState.currentPlaylistItem?.sourceId !==
          loadedSourceIdRef.current
      )
        return;

      playbackState.updateActualPosition();
      lastSeekAtRef.current = Date.now();
      seekSettlingUntilRef.current = Date.now() + SEEK_SETTLING_MS;
      setIsPlaybackStarting(true);
      setPlaybackStartDeadline(Date.now() + PLAYBACK_START_TIMEOUT_MS);
      misalignedSamplesRef.current = 0;
      lastAlignmentRef.current = null;
      widget.seekTo(usePlaybackStore.getState().actualPositionMs);
    };
    const delay = Math.max(
      0,
      SEEK_RETRY_DELAY_MS - (Date.now() - lastSeekAtRef.current),
    );

    if (delay === 0) {
      seek();

      return;
    }

    // Coalesce fast resets/seeks to the newest room position, never a backlog.
    seekTimerRef.current = setTimeout(seek, delay);
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
      // load() also emits READY, before its callback commits the new source.
      // Only that callback may make a replacement track ready for seeking.
      if (loadingSourceIdRef.current) return;

      setIsReady(true);

      if (shouldWidgetPlay()) {
        playWidget(widget);

        return;
      }

      prewarmWidget(widget);
    });

    widget.bind(soundCloud.Widget.Events.FINISH, () => {
      if (!isActiveRef.current) return;

      setIsPlaybackStarting(true);
      setPlaybackStartDeadline(Date.now() + PLAYBACK_START_TIMEOUT_MS);
      onEndedRef.current?.();
    });

    widget.bind(soundCloud.Widget.Events.SEEK, () => {
      lastSeekAtRef.current = Date.now();
      seekSettlingUntilRef.current = Date.now() + SEEK_SETTLING_MS;
      setIsPlaybackStarting(true);
      setPlaybackStartDeadline(Date.now() + PLAYBACK_START_TIMEOUT_MS);
    });

    widget.bind(soundCloud.Widget.Events.PLAY_PROGRESS, (event?: unknown) => {
      if (!isSoundCloudProgressEvent(event)) return;

      containerRef.current?.setAttribute(
        'data-provider-position-ms',
        String(Math.round(event.currentPosition)),
      );
    });

    widget.bind(soundCloud.Widget.Events.PLAY, () => {
      const playbackState = usePlaybackStore.getState();

      // Autoplay can arrive before load() commits its READY callback. Do not
      // pause that new document because the previous source is still recorded.
      if (
        isActiveRef.current &&
        playbackState.isPlaying &&
        playbackState.currentPlaylistItem?.sourceType === 'soundcloud' &&
        (loadingSourceIdRef.current ||
          playbackState.currentPlaylistItem.sourceId !==
            loadedSourceIdRef.current)
      )
        return;

      // The official widget can start from its own play control before the
      // parent document has received a gesture. Confirm progress below before
      // unlocking other players; do not pause that legitimate local start.
      const allowed =
        shouldWidgetPlay() ||
        (!prewarmingRef.current &&
          isActiveRef.current &&
          playbackState.isPlaying &&
          playbackState.currentPlaylistItem?.sourceType === 'soundcloud' &&
          playbackState.currentPlaylistItem.sourceId ===
            loadedSourceIdRef.current);

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
    });

    widget.bind(soundCloud.Widget.Events.PAUSE, () => {
      if (loadingSourceIdRef.current) return;

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
      needsUserGestureRef.current = false;
      setNeedsUserGesture(false);
      setIsPlaybackUnlocked(true);
      const widget = widgetRef.current;

      if (!widget) return;

      if (shouldWidgetPlay()) {
        playWidget(widget);

        return;
      }

      prewarmWidget(widget);
    });
  }, [shouldWidgetPlay, playWidget, prewarmWidget]);

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
    const iframe = iframeRef.current;

    if (!widget || !iframe || !isReady || !providerPlaylistItem) return;

    if (loadedSourceIdRef.current === providerPlaylistItem.sourceId) return;

    if (loadingSourceIdRef.current === providerPlaylistItem.sourceId) return;

    const sourceId = providerPlaylistItem.sourceId;
    if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
    restartTimerRef.current = null;
    if (seekTimerRef.current) clearTimeout(seekTimerRef.current);
    seekTimerRef.current = null;
    lastSeekAtRef.current = 0;
    loadingSourceIdRef.current = sourceId;
    prewarmingRef.current = false;
    lastSynchronizedUpdateRef.current = null;
    misalignedSamplesRef.current = 0;
    seekSettlingUntilRef.current = 0;
    lastAlignmentRef.current = null;
    setIsReady(false);
    setIsWidgetPlaying(false);
    setStartedSourceId(null);
    setIsWidgetMuted(true);
    widget.setVolume(MIN_VOLUME);
    const loadError = replaceIframeNavigation(iframe, () => {
      widget.load(getSoundCloudUrl(sourceId), {
        ...SOUNDCLOUD_WIDGET_OPTIONS,
        auto_play: isPlaybackGestureUnlocked(),
        callback: () => {
          if (loadingSourceIdRef.current !== sourceId) return;

          loadingSourceIdRef.current = null;
          loadedSourceIdRef.current = sourceId;
          lastSynchronizedUpdateRef.current = null;
          setIsReady(true);
        },
      });
    });

    if (loadError) {
      loadingSourceIdRef.current = null;
      console.error('[SoundCloud Widget] Track load error:', loadError);
    }
  }, [isReady, providerPlaylistItem]);

  useEffect(() => {
    const widget = widgetRef.current;

    if (!widget || !isReady || loadingSourceIdRef.current) return;

    if (isActive && isPlaying && !needsUserGesture && shouldWidgetPlay()) {
      playWidget(widget);

      return;
    }

    if (prewarmingRef.current) return;

    widget.setVolume(MIN_VOLUME);
    widget.pause();
    setIsWidgetPlaying(false);
    setIsWidgetMuted(true);
  }, [
    isReady,
    isPlaying,
    isActive,
    needsUserGesture,
    shouldWidgetPlay,
    playWidget,
  ]);

  useEffect(() => {
    const sourceId = providerPlaylistItem?.sourceId;

    if (!isActive || !isReady || !isPlaying || !sourceId) return;

    let cancelled = false;
    let pending = false;
    let pendingSince = 0;
    let sampleVersion = 0;
    let previousPosition: number | null = null;
    let advancingSamples = 0;
    let stationarySamples = 0;
    let sampledSeek = seekSettlingUntilRef.current;
    const interval = setInterval(() => {
      const widget = widgetRef.current;

      if (!widget || document.hidden) return;

      if (pending) {
        if (Date.now() - pendingSince < PLAYBACK_SAMPLE_TIMEOUT_MS) return;

        sampleVersion += 1;
        pending = false;
        previousPosition = null;
        advancingSamples = 0;
        stationarySamples = 0;
        setIsWidgetPlaying(false);
      }

      if (sampledSeek !== seekSettlingUntilRef.current) {
        sampledSeek = seekSettlingUntilRef.current;
        previousPosition = null;
        advancingSamples = 0;
        stationarySamples = 0;

        return;
      }

      pending = true;
      pendingSince = Date.now();
      const version = ++sampleVersion;
      widget.isPaused((paused) => {
        if (cancelled || version !== sampleVersion) return;

        widget.getPosition((position) => {
          if (cancelled || version !== sampleVersion) return;

          pending = false;

          if (cancelled || sampledSeek !== seekSettlingUntilRef.current) return;

          const advancing =
            !paused &&
            previousPosition !== null &&
            position > previousPosition &&
            position - previousPosition <= PLAYBACK_SAMPLE_MS * 2;
          stationarySamples =
            !advancing && previousPosition !== null ? stationarySamples + 1 : 0;
          previousPosition = position;
          advancingSamples = advancing ? advancingSamples + 1 : 0;

          if (paused || stationarySamples >= PLAYBACK_CONFIRMATION_SAMPLES) {
            setIsWidgetPlaying(false);

            return;
          }

          if (advancingSamples >= PLAYBACK_CONFIRMATION_SAMPLES) {
            setIsWidgetPlaying(true);
            setStartedSourceId(sourceId);

            if (!isPlaybackGestureUnlocked()) markPlaybackGestureUnlocked();
          }
        });
      });
    }, PLAYBACK_SAMPLE_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [isActive, isReady, isPlaying, providerPlaylistItem?.sourceId]);

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

    const shouldReset = lastResetVersionRef.current !== resetVersion;

    if (
      !widget ||
      !isActive ||
      !isReady ||
      (isPlaying && !hasStartedPlayback) ||
      loadingSourceIdRef.current ||
      providerPlaylistItem?.sourceId !== loadedSourceIdRef.current
    )
      return;

    if (shouldReset) {
      lastResetVersionRef.current = resetVersion;
    }

    if (lastSynchronizedUpdateRef.current === updatedAt && !shouldReset) return;

    lastSynchronizedUpdateRef.current = updatedAt;
    let cancelled = false;
    let attempts = 0;
    let retryTimeout: ReturnType<typeof setTimeout> | null = null;
    const sourceId = providerPlaylistItem?.sourceId;
    const synchronizePosition = () => {
      widget.getPosition((widgetPositionMs) => {
        if (
          cancelled ||
          loadingSourceIdRef.current ||
          loadedSourceIdRef.current !== sourceId
        )
          return;

        const playbackState = usePlaybackStore.getState();
        playbackState.updateActualPosition();
        const actualPositionMs = usePlaybackStore.getState().actualPositionMs;

        if (
          (!shouldReset || attempts > 0) &&
          Math.abs(widgetPositionMs - actualPositionMs) <
            SYNCHRONIZATION_TOLERANCE_MS
        )
          return;

        if (attempts >= MAX_SEEK_ATTEMPTS) return;

        attempts += 1;
        seekWidget();
        retryTimeout = setTimeout(synchronizePosition, SEEK_SETTLING_MS);
      });
    };

    synchronizePosition();

    return () => {
      cancelled = true;
      if (retryTimeout) clearTimeout(retryTimeout);
    };
  }, [
    isActive,
    hasStartedPlayback,
    isPlaying,
    isReady,
    providerPlaylistItem?.sourceId,
    resetVersion,
    seekWidget,
    updatedAt,
  ]);

  useEffect(() => {
    if (
      !isActive ||
      !isReady ||
      !onLocalAlignmentChange ||
      (isPlaying && !hasStartedPlayback)
    )
      return;

    let cancelled = false;
    const interval = setInterval(() => {
      const widget = widgetRef.current;
      if (
        !widget ||
        document.hidden ||
        loadingSourceIdRef.current ||
        Date.now() < seekSettlingUntilRef.current
      )
        return;

      widget.isPaused((isPaused) => {
        if (cancelled) return;

        widget.getPosition((positionMs) => {
          if (cancelled || Date.now() < seekSettlingUntilRef.current) return;

          const playbackStore = usePlaybackStore.getState();
          const authoritativePlayback = playbackStore.authoritativePlayback;
          const sourceId = providerPlaylistItem?.sourceId;
          const authoritativeSourceId =
            authoritativePlayback.currentPlaylistItem?.sourceId;
          const aligned =
            sourceId === authoritativeSourceId &&
            !isPaused === authoritativePlayback.isPlaying &&
            Math.abs(positionMs - playbackStore.getAuthoritativePositionMs()) <=
              ALIGNED_POSITION_TOLERANCE_MS;

          misalignedSamplesRef.current = aligned
            ? 0
            : misalignedSamplesRef.current + 1;
          if (
            !aligned &&
            misalignedSamplesRef.current < MISALIGNED_SAMPLE_COUNT
          )
            return;

          if (lastAlignmentRef.current === aligned) return;

          lastAlignmentRef.current = aligned;
          onLocalAlignmentChangeRef.current?.(aligned);
        });
      });
    }, VOLUME_SAMPLE_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [
    isActive,
    isReady,
    onLocalAlignmentChange,
    hasStartedPlayback,
    isPlaying,
    providerPlaylistItem?.sourceId,
  ]);

  useEffect(() => {
    return () => {
      if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
      if (seekTimerRef.current) clearTimeout(seekTimerRef.current);
    };
  }, []);

  const handleUserGesturePlay = useCallback(() => {
    const widget = widgetRef.current;

    needsUserGestureRef.current = false;
    setNeedsUserGesture(false);
    setIsPlaybackStarting(true);
    setPlaybackStartDeadline(Date.now() + PLAYBACK_START_TIMEOUT_MS);
    setIsPlaybackUnlocked(true);
    onLocalPlay?.();
    markPlaybackGestureUnlocked();

    if (!widget) return;

    playWidget(widget);
  }, [onLocalPlay, playWidget]);

  const showClickToPlay =
    isActive &&
    (needsUserGesture ||
      (isReady && isPlaying && !isWidgetPlaying && !isPlaybackStarting) ||
      (isPlaying && showInitialPlaybackOverlay && !isPlaybackUnlocked));

  useEffect(() => {
    if (!isActive) return;

    onNeedsUserGestureChange?.(
      showClickToPlay || (isPlaying && !isWidgetPlaying),
    );
  }, [
    isActive,
    isPlaying,
    isWidgetPlaying,
    onNeedsUserGestureChange,
    showClickToPlay,
  ]);

  if (providerPlaylistItem?.sourceType !== 'soundcloud') return null;

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
      aria-hidden={!isActive}
      inert={!isActive}
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
        <div
          role="status"
          className="absolute inset-0 z-10 flex items-center justify-center bg-black/80"
        >
          <div className="text-center">
            <div
              aria-hidden="true"
              className="mx-auto mb-3 h-8 w-8 rounded-full border-2 border-orange-500/50 border-t-orange-500 motion-safe:animate-spin"
            />
            <p className="glow-text font-mono text-orange-400 text-sm">
              Loading player...
            </p>
          </div>
        </div>
      )}
      <div className="flex h-full w-full flex-col bg-black">
        <img
          alt={`${providerPlaylistItem.title} artwork`}
          className="pointer-events-none min-h-0 w-full flex-1 object-contain object-center"
          src={resolvePlaylistItemArtwork(providerPlaylistItem.thumbnailUrl)}
          onError={(event) => {
            const fallback = providerPlaylistItem.thumbnailUrl;
            if (event.currentTarget.getAttribute('src') === fallback) return;
            event.currentTarget.src = fallback;
          }}
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
          title={providerPlaylistItem.title}
        />
      </div>
      {showClickToPlay && (
        <div className="absolute inset-0 isolate z-40 transform-gpu">
          <ClickToPlayOverlay onClick={handleUserGesturePlay} />
        </div>
      )}
    </div>
  );
};

export const SoundCloudPlayer = memo(
  SoundCloudPlayerComponent,
  (previous, next) =>
    previous.allowUnmutedAutoplay === next.allowUnmutedAutoplay &&
    previous.appContext === next.appContext &&
    previous.fill === next.fill &&
    previous.isVisible === next.isVisible &&
    previous.onEnded === next.onEnded &&
    previous.onLocalAlignmentChange === next.onLocalAlignmentChange &&
    previous.onLocalPause === next.onLocalPause &&
    previous.onLocalPlay === next.onLocalPlay &&
    previous.onLocalSeek === next.onLocalSeek &&
    previous.onNeedsUserGestureChange === next.onNeedsUserGestureChange &&
    previous.showInitialPlaybackOverlay === next.showInitialPlaybackOverlay &&
    previous.preloadPlaylistItem?.id === next.preloadPlaylistItem?.id &&
    previous.volume === next.volume,
);

const ALIGNED_POSITION_TOLERANCE_MS = 2000;
const SYNCHRONIZATION_TOLERANCE_MS = 2000;
const SEEK_SETTLING_MS = 4000;
const SEEK_RETRY_DELAY_MS = 1000;
const MAX_SEEK_ATTEMPTS = 3;
const MISALIGNED_SAMPLE_COUNT = 2;
const MAX_VOLUME = 100;
const MIN_VOLUME = 0;
const PREWARM_PLAY_TIME_MS = 100;
const PAUSE_RECOVERY_DELAY_MS = 350;
const VOLUME_SAMPLE_MS = 2000;
const PLAYBACK_SAMPLE_MS = 500;
const PLAYBACK_SAMPLE_TIMEOUT_MS = 2000;
const PLAYBACK_CONFIRMATION_SAMPLES = 2;
const PLAYBACK_START_TIMEOUT_MS = 10000;

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
