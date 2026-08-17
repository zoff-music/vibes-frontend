import {
  classNames,
  type Song,
  safeWrap,
  safeWrapAsync,
  usePlaybackStore,
} from '@vibes/shared';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import SpotifyWebPlayer, {
  type CallbackState,
  type SpotifyPlayer as SpotifySdkPlayer,
} from 'react-spotify-web-playback';
import { AuthOverlay } from './AuthOverlay';

interface Props {
  accessToken?: string | null;
  isVisible?: boolean;
  isFetchingToken?: boolean;
  onEnded?: () => void;
  onRequestToken?: (provider: 'spotify', force?: boolean) => void;
  preloadSong?: Song | null;
  tokenError?: string | null;
  fill?: boolean;
  onLocalPause?: () => void;
  onLocalPlay?: () => void;
  onLocalSeek?: (positionMs: number) => void;
  onLocalAlignmentChange?: (isAligned: boolean) => void;
  onLocalVolumeChange?: () => void;
}

const SpotifyPlayerComponent: React.FC<Props> = ({
  accessToken = null,
  isVisible = true,
  isFetchingToken = false,
  onEnded,
  onRequestToken,
  preloadSong = null,
  tokenError = null,
  fill = false,
  onLocalAlignmentChange,
  onLocalPause,
  onLocalPlay,
  onLocalSeek,
}) => {
  const currentSong = usePlaybackStore((state) => state.currentSong);
  const isPlaying = usePlaybackStore((state) => state.isPlaying);
  const resetVersion = usePlaybackStore((state) => state.resetVersion);
  const updatedAt = usePlaybackStore((state) => state.updatedAt);
  const providerSong =
    currentSong?.sourceType === 'spotify' ? currentSong : preloadSong;
  const isActive =
    isVisible && currentSong?.sourceType === 'spotify' && !!currentSong;

  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [playerResetVersion, setPlayerResetVersion] = useState(resetVersion);
  const lastPositionRef = useRef<number>(0);
  const hasEndedRef = useRef<boolean>(false);
  const sdkPlayerRef = useRef<SpotifySdkPlayer | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastSynchronizedUpdateRef = useRef<string | null>(null);
  const expectedPlayingStateRef = useRef<boolean | null>(null);
  const lastCallbackAtRef = useRef(0);
  const lastCallbackIsPlayingRef = useRef<boolean | null>(null);
  const lastCallbackPositionRef = useRef<number | null>(null);
  const lastCallbackTrackURIRef = useRef<string | null>(null);
  const lastReportedSeekAtRef = useRef(0);
  const lastReportedAlignmentRef = useRef<boolean | null>(null);
  const synchronizationQueueRef = useRef(Promise.resolve());
  const lastResetVersionRef = useRef(resetVersion);
  const oauthCleanupRef = useRef<(() => void) | null>(null);

  useEffect(
    () => () => {
      oauthCleanupRef.current?.();
    },
    [],
  );

  useEffect(() => {
    if (providerSong?.sourceType === 'spotify') {
      onRequestToken?.('spotify');
    }
  }, [providerSong?.sourceType, onRequestToken]);

  useEffect(() => {
    setIsReady(false);
    hasEndedRef.current = false;
    lastPositionRef.current = 0;
    lastSynchronizedUpdateRef.current = null;
    expectedPlayingStateRef.current = null;
    lastCallbackAtRef.current = 0;
    lastCallbackIsPlayingRef.current = null;
    lastCallbackPositionRef.current = null;
    lastCallbackTrackURIRef.current = null;
    setError(null);
  }, [providerSong?.id]);

  useEffect(() => {
    if (!isActive) {
      lastResetVersionRef.current = resetVersion;
      return;
    }

    if (lastResetVersionRef.current !== resetVersion) {
      sdkPlayerRef.current = null;
      lastSynchronizedUpdateRef.current = null;
      expectedPlayingStateRef.current = null;
      setIsReady(false);
      setPlayerResetVersion(resetVersion);
    }
  }, [isActive, resetVersion]);

  useEffect(() => {
    if (
      !isReady ||
      !sdkPlayerRef.current ||
      !currentSong ||
      currentSong.sourceType !== 'spotify' ||
      !isActive
    ) {
      return;
    }

    synchronizationQueueRef.current = synchronizationQueueRef.current.then(
      async () => {
        const player = sdkPlayerRef.current;
        if (!player) return;

        const shouldReset = lastResetVersionRef.current !== resetVersion;
        if (shouldReset) {
          const [volumeError] = await safeWrapAsync(
            player.setVolume(DEFAULT_VOLUME),
          );
          if (volumeError) {
            console.error(
              '[SpotifyPlayer] Failed to reset volume:',
              volumeError,
            );
          } else {
            lastResetVersionRef.current = resetVersion;
          }
        }

        if (lastSynchronizedUpdateRef.current !== updatedAt || shouldReset) {
          const targetMs = usePlaybackStore.getState().actualPositionMs;
          lastCallbackPositionRef.current = null;
          const [seekError] = await safeWrapAsync(player.seek(targetMs));
          if (seekError) {
            console.error('[SpotifyPlayer] Failed to seek:', seekError);
          } else {
            lastPositionRef.current = targetMs;
            lastSynchronizedUpdateRef.current = updatedAt;
            lastCallbackPositionRef.current = null;
          }
        }

        if (isPlaying) {
          expectedPlayingStateRef.current = true;
          const [resumeError] = await safeWrapAsync(player.resume());
          if (resumeError) {
            console.error('[SpotifyPlayer] Failed to resume:', resumeError);
          }
          return;
        }

        expectedPlayingStateRef.current = false;
        const [pauseError] = await safeWrapAsync(player.pause());
        if (pauseError) {
          console.error('[SpotifyPlayer] Failed to pause:', pauseError);
        }
      },
    );
  }, [currentSong, isActive, isPlaying, isReady, resetVersion, updatedAt]);

  const handleCallback = useCallback(
    (state: CallbackState) => {
      if (state.isActive) {
        setIsReady(true);
      }

      if (
        isActive &&
        state.progressMs !== undefined &&
        state.track?.durationMs !== undefined
      ) {
        const now = Date.now();
        const isNearEnd = state.progressMs >= state.track.durationMs - 500;
        const wasPlaying = lastPositionRef.current > 0;

        if (
          isNearEnd &&
          wasPlaying &&
          !state.isPlaying &&
          !hasEndedRef.current
        ) {
          hasEndedRef.current = true;
          onEnded?.();
        }

        const previousPosition = lastCallbackPositionRef.current;
        const previousObservedAt = lastCallbackAtRef.current;
        const previousIsPlaying = lastCallbackIsPlayingRef.current;
        lastCallbackTrackURIRef.current = state.track.uri;

        if (previousPosition !== null && previousObservedAt > 0) {
          const expectedPosition =
            previousPosition +
            (previousIsPlaying ? Math.max(0, now - previousObservedAt) : 0);
          const seekDistance = Math.abs(state.progressMs - expectedPosition);
          if (
            onLocalSeek &&
            seekDistance >= LOCAL_SEEK_THRESHOLD_MS &&
            now - lastReportedSeekAtRef.current >= LOCAL_SEEK_DEBOUNCE_MS
          ) {
            lastReportedSeekAtRef.current = now;
            onLocalSeek(Math.round(state.progressMs));
          }
        }

        if (
          previousIsPlaying !== null &&
          previousIsPlaying !== state.isPlaying
        ) {
          const expectedPlayingState = expectedPlayingStateRef.current;
          expectedPlayingStateRef.current = null;
          if (expectedPlayingState === state.isPlaying) {
            lastCallbackAtRef.current = now;
            lastCallbackIsPlayingRef.current = state.isPlaying;
            lastCallbackPositionRef.current = state.progressMs;
            lastPositionRef.current = state.progressMs;
            return;
          }
          const authoritativeIsPlaying = usePlaybackStore.getState().isPlaying;
          if (state.isPlaying && !authoritativeIsPlaying) {
            onLocalPlay?.();
          }
          if (!state.isPlaying && authoritativeIsPlaying) {
            onLocalPause?.();
          }
        }

        lastCallbackAtRef.current = now;
        lastCallbackIsPlayingRef.current = state.isPlaying;
        lastCallbackPositionRef.current = state.progressMs;
        lastPositionRef.current = state.progressMs;
      }

      if (state.errorType) {
        console.error('[SpotifyPlayer] Error:', state.errorType);
        const errType = String(state.errorType);

        if (
          errType === 'account_error' ||
          errType === 'authentication_error' ||
          errType === 'account'
        ) {
          setError("You don't seem to have premium");
        } else {
          setError('Playback error');
        }
      }
    },
    [isActive, onEnded, onLocalPause, onLocalPlay, onLocalSeek],
  );

  useEffect(() => {
    if (!isActive || !isReady || !onLocalAlignmentChange) return;
    lastReportedAlignmentRef.current = null;

    const interval = setInterval(() => {
      const localPositionMs = lastCallbackPositionRef.current;
      const localIsPlaying = lastCallbackIsPlayingRef.current;
      const localTrackURI = lastCallbackTrackURIRef.current;
      if (
        localPositionMs === null ||
        localIsPlaying === null ||
        !localTrackURI
      ) {
        return;
      }

      const elapsedMs = localIsPlaying
        ? Math.max(0, Date.now() - lastCallbackAtRef.current)
        : 0;
      const playbackStore = usePlaybackStore.getState();
      const authoritativePlayback = playbackStore.authoritativePlayback;
      const authoritativeSourceID = authoritativePlayback.currentSong?.sourceId;
      const isAligned =
        !!authoritativeSourceID &&
        localTrackURI === `spotify:track:${authoritativeSourceID}` &&
        localIsPlaying === authoritativePlayback.isPlaying &&
        Math.abs(
          localPositionMs +
            elapsedMs -
            playbackStore.getAuthoritativePositionMs(),
        ) <= ALIGNED_POSITION_TOLERANCE_MS;
      if (lastReportedAlignmentRef.current === isAligned) {
        return;
      }
      lastReportedAlignmentRef.current = isAligned;
      onLocalAlignmentChange(isAligned);
    }, ALIGNMENT_SAMPLE_MS);

    return () => clearInterval(interval);
  }, [isActive, isReady, onLocalAlignmentChange]);

  const handleGetPlayer = useCallback((player: SpotifySdkPlayer) => {
    sdkPlayerRef.current = player;
  }, []);

  const handleAuthorize = () => {
    const width = 600;
    const height = 800;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    oauthCleanupRef.current?.();
    const [popupError, popup] = safeWrap(() =>
      window.open(
        '/api/v1/authorizations/spotify',
        'SpotifyAuth',
        `width=${width},height=${height},left=${left},top=${top}`,
      ),
    );
    if (popupError || !popup) {
      setError('The Spotify sign-in window could not be opened.');
      return;
    }

    let timer: ReturnType<typeof setInterval> | null = null;

    const cleanup = () => {
      if (timer) clearInterval(timer);
      window.removeEventListener('message', handleMessage);
      oauthCleanupRef.current = null;
    };

    const completeAuthorization = () => {
      cleanup();
      onRequestToken?.('spotify', true);
      setError(null);
    };

    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (!popup || event.source !== popup) return;
      if (
        event.data?.type === 'oauth-success' &&
        event.data?.provider === 'spotify'
      ) {
        console.log(
          '[SpotifyPlayer] OAuth success message received, cleaning up',
        );
        completeAuthorization();
        popup.close();
      }
    };

    window.addEventListener('message', handleMessage);
    oauthCleanupRef.current = cleanup;

    timer = setInterval(() => {
      if (popup.closed) {
        console.log('[SpotifyPlayer] Popup closed detected via polling');
        completeAuthorization();
      }
    }, 500);
  };

  if (providerSong?.sourceType !== 'spotify') {
    return null;
  }

  const spotifyUri = `spotify:track:${providerSong.sourceId}`;

  const showOverlay =
    (!accessToken && !isFetchingToken) ||
    !!tokenError ||
    (error && (error.includes('auth') || error.includes('premium')));

  const overlayErrorMessage =
    (tokenError?.includes('premium') ? tokenError : null) ||
    (error?.includes('premium') ? error : null) ||
    (error?.includes('auth') ? error : null);

  const containerClass = fill
    ? 'relative h-full w-full overflow-hidden bg-spotify-surface'
    : 'relative aspect-video min-h-video-min w-full overflow-hidden rounded-xl bg-spotify-surface';

  if (!accessToken && isFetchingToken) {
    return (
      <div
        className={classNames(
          containerClass,
          'flex items-center justify-center',
          !isActive && 'pointer-events-none opacity-0',
        )}
      >
        <div className="text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-green-500/30 border-t-green-500" />
          <p className="text-sm text-white/70">Connecting to Spotify...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={classNames(
        containerClass,
        !isActive && 'pointer-events-none opacity-0',
      )}
    >
      {/* Spotify Background Gradient - Bottom Layer */}
      <div className="absolute inset-0 bg-gradient-to-br from-spotify/20 via-black/40 to-black opacity-90" />

      {/* Content Layer - Back Layer */}
      <div className="absolute inset-0 flex items-center justify-center p-8">
        <div className="flex max-w-full items-center gap-6">
          {providerSong.thumbnailUrl && (
            <div className="relative h-32 w-32 shrink-0">
              <img
                src={providerSong.thumbnailUrl}
                alt={providerSong.title}
                className="h-full w-full rounded-lg object-cover shadow-spotify-cover"
              />
              <div className="absolute inset-0 rounded-lg border border-white/10" />
            </div>
          )}
          <div className="min-w-0">
            <h3 className="truncate font-display text-2xl text-white tracking-tight">
              {providerSong.title}
            </h3>
            <p className="mt-1 truncate font-medium text-lg text-spotify">
              {providerSong.artist || 'Unknown Artist'}
            </p>
            <div className="mt-4 flex items-center gap-3">
              <div
                className={classNames(
                  'h-2.5 w-2.5 rounded-full',
                  isActive &&
                    isPlaying &&
                    'animate-pulse bg-spotify shadow-spotify-pulse',
                  (!isActive || !isPlaying) && 'bg-white/30',
                )}
              />
              <span className="font-mono text-2xs text-white/50 uppercase tracking-display">
                {isActive && isPlaying
                  ? 'Streaming from Spotify'
                  : 'Paused on Spotify'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* CRT Effects Layer - Middle Layer (if shown) */}
      {showOverlay && (
        <div className="pointer-events-none absolute inset-0 z-5 overflow-hidden">
          <div className="vhs-scanlines h-full w-full opacity-20 mix-blend-overlay" />
          <div className="crt-overlay !absolute !z-6 pointer-events-none inset-0 opacity-18" />
        </div>
      )}

      {/* Auth/Error Overlay - Top Layer */}
      {showOverlay && (
        <AuthOverlay
          provider="spotify"
          errorMessage={overlayErrorMessage}
          onAuthorize={handleAuthorize}
        />
      )}

      <div className="absolute right-4 bottom-4 left-4 z-10 overflow-hidden rounded-xl">
        {accessToken && (
          <SpotifyWebPlayer
            key={playerResetVersion}
            token={accessToken}
            uris={[spotifyUri]}
            play={isActive && isPlaying}
            callback={handleCallback}
            getPlayer={handleGetPlayer}
            initialVolume={DEFAULT_VOLUME}
            name="Vibes Player"
            styles={{
              bgColor: 'transparent',
              color: '#fff',
              trackNameColor: '#fff',
            }}
          />
        )}
      </div>

      {!isReady && !error && !showOverlay && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="text-center">
            <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-spotify/30 border-t-spotify" />
            <p className="font-mono text-2xs text-spotify uppercase tracking-widest">
              Initialising Track...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export const SpotifyPlayer = memo(
  SpotifyPlayerComponent,
  (prevProps, nextProps) => {
    return (
      prevProps.isVisible === nextProps.isVisible &&
      prevProps.onEnded === nextProps.onEnded &&
      prevProps.onLocalAlignmentChange === nextProps.onLocalAlignmentChange &&
      prevProps.onLocalPause === nextProps.onLocalPause &&
      prevProps.onLocalPlay === nextProps.onLocalPlay &&
      prevProps.onLocalSeek === nextProps.onLocalSeek &&
      prevProps.accessToken === nextProps.accessToken &&
      prevProps.isFetchingToken === nextProps.isFetchingToken &&
      prevProps.preloadSong?.id === nextProps.preloadSong?.id &&
      prevProps.tokenError === nextProps.tokenError
    );
  },
);

const LOCAL_SEEK_DEBOUNCE_MS = 1000;

const LOCAL_SEEK_THRESHOLD_MS = 2000;

const ALIGNED_POSITION_TOLERANCE_MS = 2000;

const ALIGNMENT_SAMPLE_MS = 1000;

const DEFAULT_VOLUME = 0.5;
