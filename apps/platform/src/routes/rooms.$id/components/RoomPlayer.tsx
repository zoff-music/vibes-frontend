import { type PlaybackState, type Room, type Song } from '@vibes/models';
import {
  classNames,
  safeWrapAsync,
  showToast,
  useMediaSession,
  usePlaybackStore,
  useQueueStore,
  useRoomStore,
} from '@vibes/shared';
import { PlayerControls } from '@vibes/ui';
import React, {
  type ComponentType,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useFetcher } from 'react-router';
import { useCasting } from '../../../hooks/useCasting';
import type { RoomActionData } from '../action';

interface RoomPlayerProps {
  roomId: string;
  displayRoom: Room | null;
  onAddSong: () => void;
  onOpenCast: () => void;
  addSongLeadingAction?: ReactNode;
  initialPlayback?: PlaybackState;
  providers: string[];
}

interface PlayerProps {
  isVisible?: boolean;
  onEnded?: () => void;
  fill?: boolean;
  onNeedsUserGestureChange?: (needsGesture: boolean) => void;
  appContext?: 'platform' | 'cast';
  accessToken?: string | null;
  isFetchingToken?: boolean;
  onRequestToken?: (provider: 'spotify', force?: boolean) => void;
  preloadSong?: Song | null;
  tokenError?: string | null;
  onLocalPause?: () => void;
  onLocalPlay?: () => void;
  onLocalSeek?: (positionMs: number) => void;
  onLocalAlignmentChange?: (isAligned: boolean) => void;
}

type PlayerComponent = ComponentType<PlayerProps>;

interface PlayerLoadErrors {
  spotify: string | null;
  soundcloud: string | null;
  video: string | null;
}

interface AutoSkipHandlerProps {
  currentSong: Song | null;
  isPlaying: boolean;
  skip: (shouldShowToast?: boolean) => void;
  mode?: string;
}

const AutoSkipHandler = ({
  currentSong,
  isPlaying,
  skip,
  mode,
}: AutoSkipHandlerProps) => {
  const actualPositionMs = usePlaybackStore((state) => state.actualPositionMs);
  const autoSkipRef = useRef<string | null>(null);

  useEffect(() => {
    if (!currentSong?.id) {
      autoSkipRef.current = null;
      return;
    }
    if (mode !== 'host') return;
    if (!isPlaying || !currentSong.duration) return;

    const durationMs = currentSong.duration * 1000;
    const shouldAutoSkip = actualPositionMs >= durationMs - 750;

    if (shouldAutoSkip && autoSkipRef.current !== currentSong.id) {
      autoSkipRef.current = currentSong.id;
      skip(false);
    }
  }, [
    actualPositionMs,
    currentSong?.id,
    currentSong?.duration,
    mode,
    isPlaying,
    skip,
  ]);

  return null;
};

export const RoomPlayer = React.memo(
  ({
    roomId,
    displayRoom,
    onAddSong,
    onOpenCast,
    addSongLeadingAction,
    initialPlayback,
    providers,
  }: RoomPlayerProps) => {
    /* 1. Hooks */
    const playbackFetcher = useFetcher<RoomActionData>();
    const tokenFetcher = useFetcher<RoomActionData>();
    const songs = useQueueStore((state) => state.songs);
    const { isConnected, castDeviceName } = useCasting(roomId);

    // Granular store subscriptions
    const isPlaying = usePlaybackStore((state) => state.isPlaying);
    const currentSongFromStore = usePlaybackStore((state) => state.currentSong);
    const setPlaybackState = usePlaybackStore(
      (state) => state.setPlaybackState,
    );
    const resetPlaybackState = usePlaybackStore(
      (state) => state.resetPlaybackState,
    );
    const hasLocalPlaybackChanges = usePlaybackStore(
      (state) => state.hasLocalPlaybackChanges,
    );
    const setLocalPlaybackAligned = usePlaybackStore(
      (state) => state.setLocalPlaybackAligned,
    );
    const setLocalPlayingState = usePlaybackStore(
      (state) => state.setLocalPlayingState,
    );
    const isAdmin = useRoomStore((state) => state.isAdmin);

    /* 2. State & Computed */
    const currentSong =
      currentSongFromStore || initialPlayback?.currentSong || null;
    const hasHostPlaybackAuthority =
      displayRoom?.mode === 'host' &&
      (isAdmin ||
        (!!displayRoom.userId && displayRoom.hostId === displayRoom.userId));
    const canControlRoomPlayback =
      displayRoom?.mode !== 'host' || hasHostPlaybackAuthority;

    const hasSpotifySongs = useMemo(
      () => songs.some((s) => s.sourceType === 'spotify'),
      [songs],
    );

    const currentSourceType = currentSong?.sourceType ?? null;
    const needsSpotifyPlayer = currentSourceType === 'spotify';
    const needsSoundCloudPlayer = currentSourceType === 'soundcloud';
    const needsVideoPlayer =
      currentSourceType !== null &&
      currentSourceType !== 'spotify' &&
      currentSourceType !== 'soundcloud';
    const enabledSources = displayRoom?.settings.enabledSources ?? [];
    const shouldPrepareSpotifyPlayer =
      needsSpotifyPlayer ||
      (providers.includes('spotify') && enabledSources.includes('spotify'));
    const shouldPrepareSoundCloudPlayer =
      needsSoundCloudPlayer ||
      (providers.includes('soundcloud') &&
        enabledSources.includes('soundcloud'));
    const shouldPrepareVideoPlayer =
      needsVideoPlayer ||
      (providers.includes('youtube') && enabledSources.includes('youtube'));
    const preloadSpotifySong =
      songs.find((song) => song.sourceType === 'spotify') ?? null;
    const preloadSoundCloudSong =
      songs.find((song) => song.sourceType === 'soundcloud') ?? null;
    const preloadVideoSong =
      songs.find((song) => song.sourceType === 'youtube') ?? null;

    const [SpotifyPlayerComponent, setSpotifyPlayerComponent] =
      useState<PlayerComponent | null>(null);
    const [SoundCloudPlayerComponent, setSoundCloudPlayerComponent] =
      useState<PlayerComponent | null>(null);
    const [VideoPlayerComponent, setVideoPlayerComponent] =
      useState<PlayerComponent | null>(null);
    const [isPlaybackBlocked, setIsPlaybackBlocked] = useState(false);
    const [isSkipPending, setIsSkipPending] = useState(false);
    const [spotifyToken, setSpotifyToken] = useState<string | null>(null);
    const [tokenError, setTokenError] = useState<string | null>(null);
    const spotifyTokenAttemptedRef = useRef(false);
    const [playerLoadErrors, setPlayerLoadErrors] = useState<PlayerLoadErrors>({
      spotify: null,
      soundcloud: null,
      video: null,
    });
    const debugMountRef = useRef(false);

    /* 3. Handlers */
    const performPlaybackAction = useCallback(
      (action: 'pause' | 'play') => {
        if (displayRoom?.mode) {
          setLocalPlayingState(action === 'play', displayRoom.mode);
        }
        playbackFetcher.submit(
          { action, intent: 'playback' },
          { encType: 'application/json', method: 'post' },
        );
      },
      [displayRoom?.mode, playbackFetcher, setLocalPlayingState],
    );

    const play = useCallback(() => {
      performPlaybackAction('play');
    }, [performPlaybackAction]);

    const pause = useCallback(() => {
      performPlaybackAction('pause');
    }, [performPlaybackAction]);

    const handleLocalPause = useCallback(() => {
      if (displayRoom?.mode === 'host') {
        pause();
        return;
      }
      if (displayRoom?.mode === 'server') {
        setLocalPlayingState(false, displayRoom.mode);
      }
    }, [displayRoom?.mode, pause, setLocalPlayingState]);

    const handleLocalPlay = useCallback(() => {
      if (displayRoom?.mode === 'host') {
        play();
        return;
      }
      if (displayRoom?.mode === 'server') {
        setLocalPlayingState(true, displayRoom.mode);
      }
    }, [displayRoom?.mode, play, setLocalPlayingState]);

    const seek = useCallback(
      (positionMs: number) => {
        playbackFetcher.submit(
          { action: 'seek', intent: 'playback', positionMs },
          { encType: 'application/json', method: 'post' },
        );
      },
      [playbackFetcher],
    );

    const skip = useCallback(
      (shouldShowFeedback = true) => {
        if (shouldShowFeedback) {
          setIsSkipPending(true);
        }
        playbackFetcher.submit(
          { intent: 'skip' },
          { encType: 'application/json', method: 'post' },
        );
      },
      [playbackFetcher],
    );

    const handleEnded = useCallback(() => {
      skip(false);
    }, [skip]);

    const reset = useCallback(() => {
      playbackFetcher.submit(
        { intent: 'resetPlayback' },
        { encType: 'application/json', method: 'post' },
      );
    }, [playbackFetcher]);

    useMediaSession({
      canPlay:
        canControlRoomPlayback && Boolean(currentSong || songs.length > 0),
      canSkip: Boolean(currentSong),
      currentSong,
      isPlaying: isPlaying && !isPlaybackBlocked,
      onPause: pause,
      onPlay: play,
      onSkip: skip,
    });

    const requestProviderToken = useCallback(
      (provider: 'spotify', force = false) => {
        if (!force && spotifyTokenAttemptedRef.current) return;
        spotifyTokenAttemptedRef.current = true;
        tokenFetcher.submit(
          { force, intent: 'providerToken', provider },
          { encType: 'application/json', method: 'post' },
        );
      },
      [tokenFetcher],
    );

    const handleConnectSpotify = useCallback(() => {
      const width = 600;
      const height = 800;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;

      const popup = window.open(
        '/api/v1/authorizations/spotify',
        'SpotifyAuth',
        `width=${width},height=${height},left=${left},top=${top}`,
      );

      const handleMessage = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;
        if (!popup || event.source !== popup) return;
        if (
          event.data?.type === 'oauth-success' &&
          event.data?.provider === 'spotify'
        ) {
          requestProviderToken('spotify', true);
          popup?.close();
          window.removeEventListener('message', handleMessage);
        }
      };

      window.addEventListener('message', handleMessage);

      const timer = setInterval(() => {
        if (popup?.closed) {
          window.removeEventListener('message', handleMessage);
          clearInterval(timer);
          requestProviderToken('spotify', true);
        }
      }, 1000);
    }, [requestProviderToken]);

    /* 4. Effects */
    useEffect(() => {
      setPlayerLoadErrors((prev) => ({
        ...prev,
        spotify: currentSong?.sourceType === 'spotify' ? null : prev.spotify,
        soundcloud:
          currentSong?.sourceType === 'soundcloud' ? null : prev.soundcloud,
        video:
          currentSong &&
          currentSong.sourceType !== 'spotify' &&
          currentSong.sourceType !== 'soundcloud'
            ? null
            : prev.video,
      }));
    }, [currentSong?.sourceType]);

    useEffect(() => {
      if (playbackFetcher.state !== 'idle' || !playbackFetcher.data) return;
      const response = playbackFetcher.data;
      if (response.intent === 'skip') {
        setIsSkipPending(false);
      }
      if (response.error) {
        showToast(response.error, 'error');
        return;
      }
      if (response.playback) {
        if (response.intent === 'resetPlayback') {
          resetPlaybackState(response.playback, displayRoom?.mode);
        } else {
          setPlaybackState(response.playback, displayRoom?.mode);
        }
      }
      if (response.skip) {
        if (response.skip.skipped) {
          showToast('Skipped song', 'success');
        } else if (response.skip.alreadyVoted) {
          showToast(
            `Skip vote already counted (${response.skip.currentVotes}/${response.skip.requiredVotes})`,
            'info',
          );
        } else if (response.skip.voted) {
          showToast(
            `Skip vote added (${response.skip.currentVotes}/${response.skip.requiredVotes})`,
            'info',
          );
        }
      }
    }, [
      displayRoom?.mode,
      playbackFetcher.data,
      playbackFetcher.state,
      resetPlaybackState,
      setPlaybackState,
    ]);

    useEffect(() => {
      if (tokenFetcher.state !== 'idle' || !tokenFetcher.data) return;
      if (tokenFetcher.data.intent !== 'providerToken') return;
      if (tokenFetcher.data.error || !tokenFetcher.data.providerToken) {
        setTokenError(tokenFetcher.data.error ?? 'Failed to fetch token');
        return;
      }
      setTokenError(null);
      if (tokenFetcher.data.provider === 'spotify') {
        setSpotifyToken(tokenFetcher.data.providerToken.accessToken);
      }
    }, [tokenFetcher.data, tokenFetcher.state]);

    /* 5. Render */

    useEffect(() => {
      if (!shouldPrepareSpotifyPlayer || SpotifyPlayerComponent) return;

      let isMounted = true;
      const loadSpotifyPlayer = async () => {
        const [loadErr, module] = await safeWrapAsync(
          import('@vibes/ui/player/SpotifyPlayer'),
        );
        const resolvedComponent = module?.SpotifyPlayer;
        if (!isMounted || loadErr || !resolvedComponent) {
          if (loadErr) {
            console.error('[RoomPlayer] Spotify player load failed', loadErr);
            setPlayerLoadErrors((prev) => ({
              ...prev,
              spotify: 'Failed to load Spotify player',
            }));
          } else if (!resolvedComponent) {
            setPlayerLoadErrors((prev) => ({
              ...prev,
              spotify: 'Spotify player unavailable',
            }));
          }
          return;
        }
        setSpotifyPlayerComponent(() => resolvedComponent);
      };

      loadSpotifyPlayer();

      return () => {
        isMounted = false;
      };
    }, [shouldPrepareSpotifyPlayer, SpotifyPlayerComponent]);

    useEffect(() => {
      if (!shouldPrepareSoundCloudPlayer || SoundCloudPlayerComponent) return;

      let isMounted = true;
      const loadSoundCloudPlayer = async () => {
        const [loadErr, module] = await safeWrapAsync(
          import('@vibes/ui/player/SoundCloudPlayer'),
        );
        const resolvedComponent = module?.SoundCloudPlayer;
        if (!isMounted || loadErr || !resolvedComponent) {
          if (loadErr) {
            console.error(
              '[RoomPlayer] SoundCloud player load failed',
              loadErr,
            );
            setPlayerLoadErrors((prev) => ({
              ...prev,
              soundcloud: 'Failed to load SoundCloud player',
            }));
          } else if (!resolvedComponent) {
            setPlayerLoadErrors((prev) => ({
              ...prev,
              soundcloud: 'SoundCloud player unavailable',
            }));
          }
          return;
        }
        setSoundCloudPlayerComponent(() => resolvedComponent);
      };

      loadSoundCloudPlayer();

      return () => {
        isMounted = false;
      };
    }, [shouldPrepareSoundCloudPlayer, SoundCloudPlayerComponent]);

    useEffect(() => {
      if (!shouldPrepareVideoPlayer || VideoPlayerComponent) return;

      let isMounted = true;
      const loadVideoPlayer = async () => {
        const [loadErr, module] = await safeWrapAsync(
          import('@vibes/ui/player/VideoPlayer'),
        );
        const resolvedComponent = module?.VideoPlayer;
        if (!isMounted || loadErr || !resolvedComponent) {
          if (loadErr) {
            console.error('[RoomPlayer] Video player load failed', loadErr);
            setPlayerLoadErrors((prev) => ({
              ...prev,
              video: 'Failed to load video player',
            }));
          } else if (!resolvedComponent) {
            setPlayerLoadErrors((prev) => ({
              ...prev,
              video: 'Video player unavailable',
            }));
          }
          return;
        }
        setVideoPlayerComponent(() => resolvedComponent);
      };

      loadVideoPlayer();

      return () => {
        isMounted = false;
      };
    }, [shouldPrepareVideoPlayer, VideoPlayerComponent]);

    useEffect(() => {
      if (debugMountRef.current) return;
      debugMountRef.current = true;
      console.log('[RoomPlayer] mount', { roomId });
      return () => {
        console.log('[RoomPlayer] unmount', { roomId });
      };
    }, [roomId]);

    const isSpotifyTrack = currentSong?.sourceType === 'spotify';
    const isSoundCloudTrack = currentSong?.sourceType === 'soundcloud';
    const isVideoTrack = currentSong
      ? currentSong.sourceType !== 'spotify' &&
        currentSong.sourceType !== 'soundcloud'
      : false;
    const isPlayerMissing =
      (isSpotifyTrack && !SpotifyPlayerComponent) ||
      (isSoundCloudTrack && !SoundCloudPlayerComponent) ||
      (isVideoTrack && !VideoPlayerComponent);
    const currentPlayerError = isSpotifyTrack
      ? playerLoadErrors.spotify
      : isSoundCloudTrack
        ? playerLoadErrors.soundcloud
        : isVideoTrack
          ? playerLoadErrors.video
          : null;

    return (
      <div className="space-y-6 lg:flex lg:h-full lg:flex-col">
        <AutoSkipHandler
          currentSong={currentSong}
          isPlaying={isPlaying}
          skip={skip}
          {...(hasHostPlaybackAuthority && { mode: 'host' })}
        />
        {/* Player - Reserve height to prevent CLS */}
        <div className="crt-frame relative flex min-h-player-min w-full overflow-hidden rounded-player bg-black sm:min-h-player-sm-min lg:aspect-auto lg:min-h-0 lg:min-h-player-lg-min lg:flex-1">
          {VideoPlayerComponent && (
            <div
              className={classNames(
                'absolute inset-0 flex items-center justify-center bg-black',
                !isVideoTrack && 'pointer-events-none opacity-0',
              )}
            >
              <VideoPlayerComponent
                onLocalAlignmentChange={setLocalPlaybackAligned}
                {...((hasHostPlaybackAuthority ||
                  displayRoom?.mode === 'server') && {
                  onLocalPause: handleLocalPause,
                  onLocalPlay: handleLocalPlay,
                })}
                {...(hasHostPlaybackAuthority && {
                  onEnded: handleEnded,
                  onLocalSeek: seek,
                })}
                isVisible={!isConnected && isVideoTrack}
                onNeedsUserGestureChange={setIsPlaybackBlocked}
                appContext="platform"
                preloadSong={preloadVideoSong}
              />
            </div>
          )}
          {isConnected && castDeviceName && (
            <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center">
              <div className="panel-surface flex items-center gap-3 rounded-full px-5 py-2 text-sm text-theme shadow-playback-badge">
                <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-primary" />
                <span className="font-medium">Casting to {castDeviceName}</span>
              </div>
            </div>
          )}
          {currentSong && isPlayerMissing && (
            <div className="min-h-player-min">
              <div className="absolute inset-0 flex items-center justify-center bg-black">
                {/* SIGNAL CRT */}
                <div className="pointer-events-none absolute inset-0 z-1 overflow-hidden">
                  <div className="vhs-scanlines h-full w-full opacity-20 mix-blend-overlay" />
                  <div className="crt-overlay !absolute !z-2 pointer-events-none inset-0 opacity-10" />
                </div>
                <div className="relative z-10 text-center">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full border border-theme bg-theme-surface">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-theme border-t-primary" />
                  </div>
                  <p className="text-sm text-theme-muted">
                    {currentPlayerError ?? 'Loading player...'}
                  </p>
                </div>
              </div>
            </div>
          )}
          {SpotifyPlayerComponent && (
            <div
              className={classNames(
                'absolute inset-0',
                (!isSpotifyTrack || isConnected) &&
                  'pointer-events-none opacity-0',
              )}
            >
              <SpotifyPlayerComponent
                onLocalAlignmentChange={setLocalPlaybackAligned}
                {...((hasHostPlaybackAuthority ||
                  displayRoom?.mode === 'server') && {
                  onLocalPause: handleLocalPause,
                  onLocalPlay: handleLocalPlay,
                })}
                {...(hasHostPlaybackAuthority && {
                  onEnded: handleEnded,
                  onLocalSeek: seek,
                })}
                isVisible={!isConnected && isSpotifyTrack}
                accessToken={spotifyToken}
                isFetchingToken={tokenFetcher.state !== 'idle'}
                onRequestToken={requestProviderToken}
                preloadSong={preloadSpotifySong}
                tokenError={tokenError}
              />
            </div>
          )}
          {SoundCloudPlayerComponent && (
            <div
              className={classNames(
                'absolute inset-0',
                (!isSoundCloudTrack || isConnected) &&
                  'pointer-events-none opacity-0',
              )}
            >
              <SoundCloudPlayerComponent
                onLocalAlignmentChange={setLocalPlaybackAligned}
                {...((hasHostPlaybackAuthority ||
                  displayRoom?.mode === 'server') && {
                  onLocalPause: handleLocalPause,
                  onLocalPlay: handleLocalPlay,
                })}
                {...(hasHostPlaybackAuthority && {
                  onEnded: handleEnded,
                  onLocalSeek: seek,
                })}
                isVisible={!isConnected && isSoundCloudTrack}
                preloadSong={preloadSoundCloudSong}
              />
            </div>
          )}
          {!currentSong && songs.length > 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-black">
              {/* SIGNAL CRT */}
              <div className="pointer-events-none absolute inset-0 z-1 overflow-hidden">
                <div className="vhs-scanlines h-full w-full opacity-20 mix-blend-overlay" />
                <div className="crt-overlay !absolute !z-2 pointer-events-none inset-0 opacity-10" />
              </div>
              <div className="relative z-10 text-center">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full border border-theme bg-theme-surface">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-theme border-t-primary" />
                </div>
                <p className="text-sm text-theme-muted">Loading song...</p>
              </div>
            </div>
          )}
          {!currentSong && songs.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center overflow-hidden bg-black">
              {/* SIGNAL CRT */}
              <div className="pointer-events-none absolute inset-0 z-1 overflow-hidden">
                <div className="vhs-scanlines h-full w-full opacity-20 mix-blend-overlay" />
                <div className="crt-overlay !absolute !z-2 pointer-events-none inset-0 opacity-10" />
              </div>
              <div className="relative z-10 text-center">
                <div className="mb-6 inline-flex items-center rounded-full border border-theme px-4 py-2 text-2xs text-theme-muted tracking-label">
                  NO SIGNAL
                </div>
                <h3 className="mb-2 font-display text-base text-theme">
                  Add a song to light up the room
                </h3>
                <p className="text-theme-muted text-xs">
                  Tap "Add Song" to start the music flow.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Controls (always below video) */}
        <PlayerControls
          isPlaying={isPlaying && !isPlaybackBlocked}
          canPlay={
            canControlRoomPlayback && Boolean(currentSong || songs.length > 0)
          }
          canSkip={canControlRoomPlayback && Boolean(currentSong)}
          isSkipping={isSkipPending}
          showReset={Boolean(currentSong) && hasLocalPlaybackChanges}
          onPlay={play}
          onPause={pause}
          onSkip={skip}
          onReset={reset}
          onAddSong={onAddSong}
          onOpenCast={onOpenCast}
          isCasting={isConnected}
          castDeviceName={castDeviceName}
          showSpotifyConnect={hasSpotifySongs && !spotifyToken}
          onConnectSpotify={handleConnectSpotify}
          addSongLeadingAction={addSongLeadingAction}
        />
      </div>
    );
  },
);
