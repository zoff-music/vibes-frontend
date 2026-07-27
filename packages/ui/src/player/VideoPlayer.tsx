import {
  classNames,
  isTruthyFlag,
  type Song,
  safeWrap,
  usePlaybackStore,
} from '@vibes/shared';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import YouTube, { type YouTubeProps } from 'react-youtube';

interface Props {
  isVisible?: boolean;
  onEnded?: () => void;
  fill?: boolean;
  onNeedsUserGestureChange?: (needsGesture: boolean) => void;
  appContext?: 'platform' | 'cast';
  preloadSong?: Song | null;
  onLocalPause?: () => void;
  onLocalPlay?: () => void;
  onLocalSeek?: (positionMs: number) => void;
  onLocalAlignmentChange?: (isAligned: boolean) => void;
  onLocalVolumeChange?: () => void;
}

interface YouTubeVideoData {
  video_id: string;
}

interface YouTubePlayerRef {
  seekTo: (seconds: number, allowSeekAhead?: boolean) => void;
  getCurrentTime: () => number;
  getVideoData: () => YouTubeVideoData;
  getVolume: () => number;
  playVideo: () => void;
  pauseVideo: () => void;
  getPlayerState: () => number;
  loadVideoById: (videoId: string, startSeconds?: number) => void;
  mute: () => void;
  unMute: () => void;
  isMuted: () => boolean;
  setVolume: (volume: number) => void;
}

interface ObservedPlayback {
  isMuted: boolean;
  observedAt: number;
  positionSeconds: number;
  state: number;
  volume: number;
}

const VideoPlayerComponent = ({
  isVisible = true,
  onEnded,
  fill = false,
  onNeedsUserGestureChange,
  appContext = 'platform',
  preloadSong = null,
  onLocalAlignmentChange,
  onLocalPause,
  onLocalPlay,
  onLocalSeek,
  onLocalVolumeChange,
}: Props) => {
  const currentSong = usePlaybackStore((state) => state.currentSong);
  const isPlaying = usePlaybackStore((state) => state.isPlaying);
  const resetVersion = usePlaybackStore((state) => state.resetVersion);
  const updatedAt = usePlaybackStore((state) => state.updatedAt);

  const playerRef = useRef<YouTubePlayerRef | null>(null);
  const lastVideoIdRef = useRef<string | null>(null);
  const lastLoadedVideoIdRef = useRef<string | null>(null);
  const pendingVideoIdRef = useRef<string | null>(null);
  const pauseAfterLoadVideoIdRef = useRef<string | null>(null);
  const initialVideoIdRef = useRef<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const autoPlayRetryRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoPlayKickCountRef = useRef(0);
  const autoPlayKickLastAtRef = useRef(0);
  const autoPlayKickVideoIdRef = useRef<string | null>(null);
  const suppressLoadUntilRef = useRef(0);
  const expectedPlayingStateRef = useRef<boolean | null>(null);
  const lastSynchronizedUpdateRef = useRef<string | null>(null);
  const observedPlaybackRef = useRef<ObservedPlayback | null>(null);
  const lastReportedSeekAtRef = useRef(0);
  const lastResetVersionRef = useRef(resetVersion);
  const isYouTubeActive =
    isVisible && currentSong?.sourceType === 'youtube' && !!currentSong;
  const shouldPlay = isYouTubeActive && isPlaying;
  const videoId =
    currentSong?.sourceType === 'youtube'
      ? currentSong.sourceId
      : preloadSong?.sourceType === 'youtube'
        ? preloadSong.sourceId
        : null;
  const debugLastRef = useRef(0);
  const [hasUserStartedPlayback, setHasUserStartedPlayback] = useState(false);
  const [needsUserGesture, setNeedsUserGesture] = useState(false);
  const [isMutedState, setIsMutedState] = useState(false);
  const origin =
    typeof window === 'undefined' ? undefined : window.location.origin;
  const isCastReceiver = appContext === 'cast';

  const debugLog = useCallback(
    (label: string, extra?: Record<string, unknown>) => {
      if (!DEBUG) return;
      const now = Date.now();
      const isUnmuteLog = label.startsWith('unmute-');
      if (!isUnmuteLog && now - debugLastRef.current < 250) return;
      if (!isUnmuteLog) {
        debugLastRef.current = now;
      }
      const visibility =
        typeof document === 'undefined' ? 'unknown' : document.visibilityState;
      const playerState = playerRef.current?.getPlayerState?.();
      const muted = playerRef.current?.isMuted?.();
      const payload = {
        videoId,
        resolvedVideoId: videoId ?? lastVideoIdRef.current,
        isPlaying,
        shouldPlay,
        isReady,
        visibility,
        playerState,
        muted,
        ...extra,
      };
      console.log('[VideoPlayer]', label, JSON.stringify(payload));
    },
    [videoId, isPlaying, shouldPlay, isReady],
  );

  useEffect(() => {
    setError(null);
    if (!playerRef.current) {
      setIsReady(false);
    }
    if (isYouTubeActive && !hasUserStartedPlayback && !isCastReceiver) {
      setNeedsUserGesture(true);
    }
    debugLog('song-change', { currentSongId: currentSong?.id });
  }, [
    currentSong?.id,
    isYouTubeActive,
    hasUserStartedPlayback,
    isCastReceiver,
    debugLog,
  ]);

  useEffect(() => {
    debugLog('mount');
    return () => {
      debugLog('unmount');
    };
  }, []);

  useEffect(() => {
    if (!currentSong && !isPlaying) {
      lastVideoIdRef.current = null;
      lastLoadedVideoIdRef.current = null;
      pendingVideoIdRef.current = null;
    }
  }, [currentSong, isPlaying]);

  useEffect(() => {
    if (!isYouTubeActive) {
      lastResetVersionRef.current = resetVersion;
    }
  }, [isYouTubeActive, resetVersion]);

  useEffect(() => {
    if (!isReady || !playerRef.current || !isYouTubeActive || !videoId) return;

    const player = playerRef.current;
    const shouldReset = lastResetVersionRef.current !== resetVersion;
    const shouldSynchronizePosition =
      lastSynchronizedUpdateRef.current !== updatedAt || shouldReset;
    const [err] = safeWrap(() => {
      if (shouldReset) {
        player.unMute();
        player.setVolume(MAX_VOLUME);
        lastResetVersionRef.current = resetVersion;
      }
      if (shouldSynchronizePosition) {
        const actualPositionMs = usePlaybackStore.getState().actualPositionMs;
        const targetTime = actualPositionMs / 1000;
        const loadedVideoID = player.getVideoData().video_id;
        if (loadedVideoID !== videoId) {
          expectedPlayingStateRef.current = shouldPlay;
          pendingVideoIdRef.current = videoId;
          player.loadVideoById(videoId, targetTime);
          lastLoadedVideoIdRef.current = videoId;
        } else if (
          Math.abs(player.getCurrentTime() - targetTime) >
          AUTHORITATIVE_SEEK_THRESHOLD_SECONDS
        ) {
          player.seekTo(targetTime, true);
        }
        lastSynchronizedUpdateRef.current = updatedAt;
        observedPlaybackRef.current = null;
      }

      const state = player.getPlayerState();
      if (shouldPlay && state !== YOUTUBE_STATE_PLAYING) {
        expectedPlayingStateRef.current = true;
        player.playVideo();
      }
      if (!shouldPlay && state === YOUTUBE_STATE_PLAYING) {
        expectedPlayingStateRef.current = false;
        player.pauseVideo();
      }
    });
    if (err && DEBUG) {
      debugLog('sync-playback-error', { error: err.message });
    }
  }, [
    debugLog,
    isReady,
    isYouTubeActive,
    resetVersion,
    shouldPlay,
    updatedAt,
    videoId,
  ]);

  useEffect(() => {
    if (
      !isReady ||
      !isYouTubeActive ||
      (!onLocalAlignmentChange && !onLocalSeek && !onLocalVolumeChange)
    ) {
      return;
    }

    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.hidden) {
        observedPlaybackRef.current = null;
        return;
      }

      const player = playerRef.current;
      if (!player) return;

      const [err] = safeWrap(() => {
        const now = Date.now();
        const positionSeconds = player.getCurrentTime();
        const state = player.getPlayerState();
        const isMuted = player.isMuted();
        const volume = player.getVolume();
        const previous = observedPlaybackRef.current;
        observedPlaybackRef.current = {
          isMuted,
          observedAt: now,
          positionSeconds,
          state,
          volume,
        };

        if (!previous || !hasUserStartedPlayback) {
          return;
        }

        if (
          (previous.isMuted !== isMuted || previous.volume !== volume) &&
          (!shouldPlay || hasUserStartedPlayback)
        ) {
          onLocalVolumeChange?.();
        }

        const playbackStore = usePlaybackStore.getState();
        const authoritativePlayback = playbackStore.authoritativePlayback;
        const loadedVideoID = player.getVideoData().video_id;
        if (pendingVideoIdRef.current) {
          if (loadedVideoID !== pendingVideoIdRef.current) {
            return;
          }
          pendingVideoIdRef.current = null;
        }
        const authoritativePositionMs =
          playbackStore.getAuthoritativePositionMs();
        const isLocallyPlaying =
          state === YOUTUBE_STATE_PLAYING || state === YOUTUBE_STATE_BUFFERING;
        const isAligned =
          loadedVideoID === authoritativePlayback.currentSong?.sourceId &&
          isLocallyPlaying === authoritativePlayback.isPlaying &&
          Math.abs(positionSeconds * 1000 - authoritativePositionMs) <=
            ALIGNED_POSITION_TOLERANCE_MS &&
          !isMuted &&
          volume === MAX_VOLUME;
        onLocalAlignmentChange?.(isAligned);

        const elapsedSeconds =
          previous.state === YOUTUBE_STATE_PLAYING
            ? (now - previous.observedAt) / 1000
            : 0;
        const expectedPosition = previous.positionSeconds + elapsedSeconds;
        const seekDistance = Math.abs(positionSeconds - expectedPosition);
        if (
          seekDistance < LOCAL_SEEK_THRESHOLD_SECONDS ||
          now - lastReportedSeekAtRef.current < LOCAL_SEEK_DEBOUNCE_MS
        ) {
          return;
        }

        lastReportedSeekAtRef.current = now;
        onLocalSeek?.(Math.round(positionSeconds * 1000));
      });
      if (err && DEBUG) {
        debugLog('local-seek-detection-error', { error: err.message });
      }
    }, LOCAL_SEEK_SAMPLE_MS);

    return () => clearInterval(interval);
  }, [
    debugLog,
    isReady,
    isYouTubeActive,
    onLocalAlignmentChange,
    onLocalSeek,
    onLocalVolumeChange,
    shouldPlay,
    hasUserStartedPlayback,
  ]);

  useEffect(() => {
    if (isYouTubeActive || !playerRef.current) return;
    const [err] = safeWrap(() => playerRef.current?.pauseVideo());
    if (err && DEBUG) {
      debugLog('pause-error', { error: err.message });
    }
  }, [isYouTubeActive]);

  useEffect(() => {
    if (
      !isReady ||
      !isYouTubeActive ||
      isCastReceiver ||
      hasUserStartedPlayback
    ) {
      return;
    }

    const enforceMutedPlayback = () => {
      const [err] = safeWrap(() => {
        playerRef.current?.mute();
        setIsMutedState(true);
      });
      if (err && DEBUG) {
        debugLog('mute-enforcement-error', { error: err.message });
      }
    };

    enforceMutedPlayback();
    const interval = setInterval(
      enforceMutedPlayback,
      MUTE_ENFORCEMENT_INTERVAL_MS,
    );

    return () => clearInterval(interval);
  }, [
    debugLog,
    hasUserStartedPlayback,
    isCastReceiver,
    isReady,
    isYouTubeActive,
  ]);

  const kickAutoplay = useCallback(
    (reason: 'state' | 'hidden' | 'retry') => {
      if (!videoId || !shouldPlay) return;
      const player = playerRef.current;
      if (!player) return;

      if (autoPlayKickVideoIdRef.current !== videoId) {
        autoPlayKickVideoIdRef.current = videoId;
        autoPlayKickCountRef.current = 0;
      }

      const now = Date.now();
      if (now - autoPlayKickLastAtRef.current < AUTOPLAY_KICK_COOLDOWN_MS) {
        return;
      }
      if (autoPlayKickCountRef.current >= MAX_AUTOPLAY_RETRIES) {
        return;
      }

      autoPlayKickLastAtRef.current = now;
      autoPlayKickCountRef.current += 1;

      const [err] = safeWrap(() => {
        const actualPositionMs = usePlaybackStore.getState().actualPositionMs;
        const startSeconds = actualPositionMs > 0 ? actualPositionMs / 1000 : 0;
        const shouldSuppressLoad = now < suppressLoadUntilRef.current;
        const alreadyLoaded = lastLoadedVideoIdRef.current === videoId;
        if (
          !shouldSuppressLoad &&
          !alreadyLoaded &&
          (reason !== 'state' || player.getPlayerState() !== 1)
        ) {
          pendingVideoIdRef.current = videoId;
          player.loadVideoById(videoId, startSeconds);
          lastLoadedVideoIdRef.current = videoId;
        }
        player.playVideo();
        debugLog('kick', { reason, attempts: autoPlayKickCountRef.current });
      });
      if (err && DEBUG) {
        debugLog('kick-error', { reason, error: err.message });
      }
    },
    [videoId, shouldPlay],
  );

  useEffect(() => {
    if (!videoId || !shouldPlay) {
      if (autoPlayRetryRef.current) {
        clearInterval(autoPlayRetryRef.current);
        autoPlayRetryRef.current = null;
      }
      autoPlayKickCountRef.current = 0;
      autoPlayKickVideoIdRef.current = null;
      return;
    }

    let attempts = 0;
    const attemptPlay = () => {
      const player = playerRef.current;
      if (!player) return;
      const [err] = safeWrap(() => {
        const state = player.getPlayerState();
        if (state === 1 || state === 3) {
          return;
        }
        if (state === 2) {
          player.playVideo();
          return;
        }
        kickAutoplay('retry');
      });
      if (err && DEBUG) {
        debugLog('autoplay-retry-error', { error: err.message });
      }
    };

    attemptPlay();

    autoPlayRetryRef.current = setInterval(() => {
      attempts += 1;
      attemptPlay();
      if (attempts >= MAX_AUTOPLAY_RETRIES) {
        if (autoPlayRetryRef.current) {
          clearInterval(autoPlayRetryRef.current);
          autoPlayRetryRef.current = null;
        }
      }
    }, AUTOPLAY_RETRY_MS);

    return () => {
      if (autoPlayRetryRef.current) {
        clearInterval(autoPlayRetryRef.current);
        autoPlayRetryRef.current = null;
      }
    };
  }, [videoId, shouldPlay, kickAutoplay]);

  useEffect(() => {
    if (!videoId || !shouldPlay) return;
    if (typeof document === 'undefined') return;
    if (document.visibilityState !== 'hidden') return;

    let attempts = 0;
    const kickInterval = setInterval(() => {
      attempts += 1;
      const [err] = safeWrap(() => {
        const state = playerRef.current?.getPlayerState();
        if (state === 1 || state === 3) {
          clearInterval(kickInterval);
          return;
        }
        kickAutoplay('hidden');
      });
      if (err && DEBUG) {
        debugLog('autoplay-hidden-error', { error: err.message });
      }

      if (attempts >= MAX_AUTOPLAY_RETRIES) {
        clearInterval(kickInterval);
      }
    }, AUTOPLAY_RETRY_MS);

    return () => clearInterval(kickInterval);
  }, [videoId, shouldPlay, kickAutoplay]);

  const forceAutoplay = useCallback(
    (label: string) => {
      if (!isCastReceiver) return;
      const player = playerRef.current;
      if (!player) return;

      const [unmuteErr] = safeWrap(() => {
        player.unMute();
        setIsMutedState(false);
      });
      if (unmuteErr && DEBUG) {
        debugLog('force-autoplay-unmute-error', { error: unmuteErr.message });
      }

      const [playErr] = safeWrap(() => player.playVideo());
      if (playErr && DEBUG) {
        debugLog('force-autoplay-play-error', { error: playErr.message });
      }

      setNeedsUserGesture(false);
      debugLog('force-autoplay', { label });
    },
    [debugLog, isCastReceiver],
  );

  const handleReady = useCallback(
    (event: { target: YouTubePlayerRef }) => {
      playerRef.current = event.target;
      setIsReady(true);
      setError(null);
      debugLog('ready');

      const playbackState = usePlaybackStore.getState();
      playbackState.updateActualPosition();
      const actualPositionMs = usePlaybackStore.getState().actualPositionMs;
      if (actualPositionMs > 0) {
        const targetTime = actualPositionMs / 1000;
        event.target.seekTo(targetTime, true);
      }
      const activeSong = usePlaybackStore.getState().currentSong;
      if (activeSong?.sourceType === 'youtube') {
        lastLoadedVideoIdRef.current = activeSong.sourceId;
        if (event.target.getVideoData().video_id === activeSong.sourceId) {
          pendingVideoIdRef.current = null;
        }
        if (!isCastReceiver && !usePlaybackStore.getState().isPlaying) {
          pauseAfterLoadVideoIdRef.current = activeSong.sourceId;
        }
      }

      if (isCastReceiver) {
        forceAutoplay('ready');
        return;
      }

      if (usePlaybackStore.getState().isPlaying) {
        const [err] = safeWrap(() => {
          if (!hasUserStartedPlayback) {
            event.target.mute();
            setIsMutedState(true);
          }
          event.target.playVideo();
        });
        if (err && DEBUG) {
          debugLog('ready-autoplay-error', { error: err.message });
        }
      }
    },
    [debugLog, forceAutoplay, hasUserStartedPlayback, isCastReceiver],
  );

  const handleStateChange = useCallback(
    (event: { data: number }) => {
      const state = event.data;
      debugLog('state', { state });

      if (state === 1 && pauseAfterLoadVideoIdRef.current === videoId) {
        pauseAfterLoadVideoIdRef.current = null;
        const shouldRemainPaused =
          !isCastReceiver && !usePlaybackStore.getState().isPlaying;
        if (shouldRemainPaused) {
          const [err] = safeWrap(() => playerRef.current?.pauseVideo());
          if (err && DEBUG) {
            debugLog('pause-after-load-error', { error: err.message });
          }
          setIsReady(true);
          debugLog('pause-after-load');
          return;
        }
      }

      if (state === 1 || state === 3) {
        if (
          playerRef.current?.getVideoData().video_id ===
          pendingVideoIdRef.current
        ) {
          pendingVideoIdRef.current = null;
        }
        if (autoPlayRetryRef.current) {
          clearInterval(autoPlayRetryRef.current);
          autoPlayRetryRef.current = null;
        }
        setIsReady(true);
        let muted = playerRef.current?.isMuted?.() ?? false;
        if (!isCastReceiver && !hasUserStartedPlayback && !muted) {
          playerRef.current?.mute();
          muted = true;
        }
        if (isCastReceiver && muted) {
          playerRef.current?.unMute?.();
        }
        const resolvedMuted = isCastReceiver
          ? (playerRef.current?.isMuted?.() ?? false)
          : muted;
        setIsMutedState(resolvedMuted);
        if (!resolvedMuted) {
          setNeedsUserGesture(false);
        } else {
          setNeedsUserGesture(!isCastReceiver);
        }
        const expectedPlayingState = expectedPlayingStateRef.current;
        if (state === YOUTUBE_STATE_PLAYING && expectedPlayingState === true) {
          expectedPlayingStateRef.current = null;
          return;
        }
        if (
          state === YOUTUBE_STATE_PLAYING &&
          expectedPlayingState === false &&
          pauseAfterLoadVideoIdRef.current === videoId
        ) {
          return;
        }
        if (state === YOUTUBE_STATE_PLAYING && expectedPlayingState !== null) {
          expectedPlayingStateRef.current = null;
        }
        if (
          state === YOUTUBE_STATE_PLAYING &&
          !usePlaybackStore.getState().isPlaying
        ) {
          onLocalPlay?.();
        }
        return;
      }

      if (state === 5 || state === -1) {
        kickAutoplay('state');
      } else if (
        state === YOUTUBE_STATE_PAUSED &&
        isCastReceiver &&
        shouldPlay
      ) {
        const [err] = safeWrap(() => playerRef.current?.playVideo());
        if (err && DEBUG) {
          debugLog('state-autoplay-error', { error: err.message });
        }
      } else if (
        state === YOUTUBE_STATE_PAUSED &&
        expectedPlayingStateRef.current === false
      ) {
        expectedPlayingStateRef.current = null;
      } else if (state === YOUTUBE_STATE_PAUSED) {
        expectedPlayingStateRef.current = null;
        if (!usePlaybackStore.getState().isPlaying) {
          return;
        }
        onLocalPause?.();
      }
    },
    [
      debugLog,
      hasUserStartedPlayback,
      isCastReceiver,
      kickAutoplay,
      onLocalPause,
      onLocalPlay,
      shouldPlay,
      videoId,
    ],
  );

  const handleEnd = useCallback(() => {
    onEnded?.();
  }, [onEnded]);

  const handleError = useCallback((event: unknown) => {
    console.error('[VideoPlayer] Player error:', event);
    setError('This video is unavailable in the embedded player.');
  }, []);

  if (videoId) {
    lastVideoIdRef.current = videoId;
  }

  const resolvedVideoId = videoId ?? lastVideoIdRef.current;
  if (!initialVideoIdRef.current && resolvedVideoId) {
    initialVideoIdRef.current = resolvedVideoId;
  }
  const youtubeVideoIdProp = initialVideoIdRef.current ?? resolvedVideoId;

  useEffect(() => {
    if (!videoId) return;
    const player = playerRef.current;
    if (!player) return;
    if (lastLoadedVideoIdRef.current === videoId) return;

    const actualPositionMs = usePlaybackStore.getState().actualPositionMs;
    const startSeconds = actualPositionMs > 0 ? actualPositionMs / 1000 : 0;
    const shouldPauseAfterLoad =
      !isCastReceiver && !usePlaybackStore.getState().isPlaying;
    const [err] = safeWrap(() => {
      pauseAfterLoadVideoIdRef.current = shouldPauseAfterLoad ? videoId : null;
      expectedPlayingStateRef.current = !shouldPauseAfterLoad;
      observedPlaybackRef.current = null;
      pendingVideoIdRef.current = videoId;
      player.loadVideoById(videoId, startSeconds);
      lastLoadedVideoIdRef.current = videoId;
      debugLog('load-video', { shouldPauseAfterLoad, startSeconds });
    });
    if (err && DEBUG) {
      debugLog('load-video-error', { error: err.message });
    }
    if (isCastReceiver) {
      forceAutoplay('load-video');
    }
  }, [videoId, isReady, debugLog, forceAutoplay, isCastReceiver]);

  // All hooks must be called unconditionally, so define these before early return
  const opts: YouTubeProps['opts'] = useMemo(
    () => ({
      height: '100%',
      width: '100%',
      playerVars: {
        autoplay: 1,
        controls: isCastReceiver ? 0 : 1,
        disablekb: isCastReceiver ? 1 : 0,
        enablejsapi: 1,
        fs: isCastReceiver ? 0 : 1,
        modestbranding: 1,
        rel: 0,
        playsinline: 1,
        origin,
      },
    }),
    [isCastReceiver, origin],
  );

  const showClickToPlay =
    isYouTubeActive &&
    !isCastReceiver &&
    (!hasUserStartedPlayback ||
      needsUserGesture ||
      (shouldPlay && isMutedState)) &&
    !error;

  const handleUserGesturePlay = useCallback(() => {
    const player = playerRef.current;
    if (!player) return;

    const [err] = safeWrap(() => {
      player.unMute();
      setIsMutedState(false);
      suppressLoadUntilRef.current = Date.now() + 2000;
      if (videoId) {
        lastLoadedVideoIdRef.current = videoId;
      }
      const playbackState = usePlaybackStore.getState();
      playbackState.updateActualPosition();
      const actualPositionMs = usePlaybackStore.getState().actualPositionMs;
      player.seekTo(actualPositionMs / 1000, true);
      observedPlaybackRef.current = null;
      player.playVideo();
      setHasUserStartedPlayback(true);
      setNeedsUserGesture(false);
      debugLog('user-gesture-play');
    });
    if (err && DEBUG) {
      debugLog('user-gesture-error', { error: err.message });
    }
  }, [debugLog, videoId]);

  useEffect(() => {
    onNeedsUserGestureChange?.(showClickToPlay);
  }, [showClickToPlay, onNeedsUserGestureChange]);

  const containerClass = fill
    ? 'relative flex h-full w-full flex-col overflow-hidden bg-black'
    : 'relative flex h-full min-h-player-min w-full flex-col overflow-hidden bg-black';

  // Early return after all hooks have been called
  if (!resolvedVideoId) {
    return null;
  }

  // Main render logic always includes the container and CRT layers
  return (
    <div
      className={classNames(
        containerClass,
        !isVisible && 'pointer-events-none opacity-0',
      )}
    >
      <div className="relative min-h-0 flex-1 bg-black">
        {youtubeVideoIdProp && (
          <YouTube
            videoId={youtubeVideoIdProp}
            opts={opts}
            onReady={handleReady}
            onStateChange={handleStateChange}
            onEnd={handleEnd}
            onError={handleError}
            className={
              fill
                ? 'absolute inset-0 flex h-full min-h-0 w-full items-center justify-center [&_iframe]:h-full [&_iframe]:max-h-full [&_iframe]:w-full [&_iframe]:max-w-full'
                : 'absolute inset-0 flex min-h-video-min items-center justify-center [&_iframe]:aspect-video [&_iframe]:max-h-full [&_iframe]:w-full [&_iframe]:max-w-full'
            }
          />
        )}
      </div>

      {showClickToPlay && (
        <button
          type="button"
          className="absolute inset-0 z-40 flex h-full w-full cursor-pointer items-center justify-center bg-black text-white transition-colors hover:bg-theme-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-inset"
          onClick={handleUserGesturePlay}
        >
          <span className="rounded-full border border-white/20 bg-white/5 px-6 py-3 font-mono text-caption uppercase tracking-widest">
            ▶ Click to play
          </span>
        </button>
      )}

      {error && (
        <div className="shrink-0 border-white/15 border-t bg-black px-4 py-3 text-center">
          <p className="font-mono text-2xs text-white/70 uppercase tracking-widest">
            {error}
          </p>
        </div>
      )}

      {!isReady && !error && !showClickToPlay && (
        <div className="flex shrink-0 items-center justify-center gap-3 border-white/15 border-t bg-black px-4 py-3">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-500/30 border-t-red-500" />
          <p className="font-mono text-2xs text-white/70 uppercase tracking-widest">
            Loading player...
          </p>
        </div>
      )}
    </div>
  );
};

export const VideoPlayer = memo(VideoPlayerComponent);

const AUTHORITATIVE_SEEK_THRESHOLD_SECONDS = 1;

const ALIGNED_POSITION_TOLERANCE_MS = 2000;

const AUTOPLAY_KICK_COOLDOWN_MS = 800;

const AUTOPLAY_RETRY_MS = 500;

const DEBUG = isTruthyFlag(import.meta.env.VITE_DEBUG);

const LOCAL_SEEK_DEBOUNCE_MS = 1000;

const LOCAL_SEEK_SAMPLE_MS = 500;

const LOCAL_SEEK_THRESHOLD_SECONDS = 2;

const MUTE_ENFORCEMENT_INTERVAL_MS = 500;

const MAX_AUTOPLAY_RETRIES = 12;

const MAX_VOLUME = 100;

const YOUTUBE_STATE_PAUSED = 2;

const YOUTUBE_STATE_PLAYING = 1;

const YOUTUBE_STATE_BUFFERING = 3;
