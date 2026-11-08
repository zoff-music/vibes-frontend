import { Link, useFetcher } from '@kasperrt/smolter/preact';
import {
  type PlaybackStateV2,
  type PlaylistItem,
  type Providers,
  type RoomV2,
} from '@vibes/models';
import {
  browserDebugLog,
  classNames,
  safeWrapAsync,
  showToast,
  useMediaSession,
  usePlaybackStore,
  useQueueStore,
  useRoomStore,
} from '@vibes/shared';
import {
  markPlaybackGestureUnlocked,
  PlayerControls,
  PlaylistItemArtwork,
} from '@vibes/ui/web';
import React, {
  type ComponentType,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'preact/compat';
import { useCasting } from '../../../hooks/useCasting';
import { usePersistentPlayerVolume } from '../../../hooks/usePersistentPlayerVolume';
import { useCastStore } from '../../../stores/castStore';
import type { RoomActionData } from '../utils/actions/clientAction';

const importSoundCloudPlayer = () =>
  import('@vibes/ui/web/player/SoundCloudPlayer');
const importVideoPlayer = () => import('@vibes/ui/web/player/VideoPlayer');

interface RoomPlayerProps {
  minimized?: boolean;
  roomId: string;
  displayRoom: RoomV2 | null;
  addPlaylistItemHref: string;
  castHref: string;
  initialPlayback?: PlaybackStateV2;
  initialPreloadPlaylistItems?: PlaylistItem[];
  providers: Providers;
}

interface PlayerProps {
  allowUnmutedAutoplay?: boolean;
  isVisible?: boolean;
  onEnded?: () => void;
  fill?: boolean;
  onNeedsUserGestureChange?: (needsGesture: boolean) => void;
  onVideoVisibleChange?: (visible: boolean) => void;
  appContext?: 'platform' | 'cast';
  preloadPlaylistItem?: PlaylistItem | null;
  onLocalPause?: () => void;
  onLocalPlay?: () => void;
  onLocalSeek?: (positionMs: number) => void;
  onLocalAlignmentChange?: (isAligned: boolean) => void;
  showInitialPlaybackOverlay?: boolean;
  volume?: number;
}

type PlayerComponent = ComponentType<PlayerProps>;

interface PlayerLoadErrors {
  soundcloud: string | null;
  video: string | null;
}

interface AutoSkipHandlerProps {
  currentPlaylistItem: PlaylistItem | null;
  isPlaying: boolean;
  skip: (shouldShowToast?: boolean) => void;
  mode?: string;
}

const AutoSkipHandler = ({
  currentPlaylistItem,
  isPlaying,
  skip,
  mode,
}: AutoSkipHandlerProps) => {
  const actualPositionMs = usePlaybackStore((state) => state.actualPositionMs);
  const autoSkipRef = useRef<string | null>(null);

  useEffect(() => {
    if (!currentPlaylistItem?.id) {
      autoSkipRef.current = null;

      return;
    }

    if (mode !== 'host') return;

    if (!isPlaying || !currentPlaylistItem.duration) return;

    const durationMs = currentPlaylistItem.duration * 1000;
    const shouldAutoSkip = actualPositionMs >= durationMs - 750;

    if (shouldAutoSkip && autoSkipRef.current !== currentPlaylistItem.id) {
      autoSkipRef.current = currentPlaylistItem.id;
      skip(false);
    }
  }, [
    actualPositionMs,
    currentPlaylistItem?.id,
    currentPlaylistItem?.duration,
    mode,
    isPlaying,
    skip,
  ]);

  return null;
};

export const RoomPlayer = React.memo(
  ({
    minimized = false,
    roomId,
    displayRoom,
    addPlaylistItemHref,
    castHref,
    initialPlayback,
    initialPreloadPlaylistItems = [],
    providers,
  }: RoomPlayerProps) => {
    /* 1. Hooks */
    const playbackFetcher = useFetcher<RoomActionData>();
    const submittedRoom = useRef<string | null>(null);
    const playlistItems = useQueueStore((state) => state.playlistItems);
    const { isConnected, castDeviceName } = useCasting(roomId);
    const showCast = useCastStore((state) => state.isInitialized);
    const { volume, setVolume, toggleMuted } = usePersistentPlayerVolume();

    // Granular store subscriptions
    const isPlaying = usePlaybackStore((state) => state.isPlaying);
    const currentPlaylistItemFromStore = usePlaybackStore(
      (state) => state.currentPlaylistItem,
    );
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
    const setLocalPlaybackPosition = usePlaybackStore(
      (state) => state.setLocalPlaybackPosition,
    );
    const isAdmin = useRoomStore((state) => state.isAdmin);

    /* 2. State & Computed */
    const currentPlaylistItem =
      currentPlaylistItemFromStore ||
      initialPlayback?.currentPlaylistItem ||
      null;
    const isHost = Boolean(
      displayRoom?.mode === 'host' &&
        displayRoom.userId &&
        displayRoom.hostId === displayRoom.userId,
    );
    const hasHostPlaybackAuthority = isHost;
    const canControlRoomPlayback =
      displayRoom?.mode !== 'host' || hasHostPlaybackAuthority;
    const canSkipPlaylistItem =
      (canControlRoomPlayback || isAdmin) &&
      (isAdmin || Boolean(displayRoom?.settings.skipAllowed));

    const currentSourceType = currentPlaylistItem?.sourceType ?? null;
    const needsSoundCloudPlayer = currentSourceType === 'soundcloud';
    const needsVideoPlayer = currentSourceType === 'youtube';
    const enabledSources = displayRoom?.settings.enabledSources ?? [];
    const shouldPrepareSoundCloudPlayer =
      needsSoundCloudPlayer ||
      (providers.includes('soundcloud') &&
        enabledSources.includes('soundcloud'));
    const shouldPrepareVideoPlayer =
      needsVideoPlayer ||
      (providers.includes('youtube') && enabledSources.includes('youtube'));
    const preloadSoundCloudPlaylistItem =
      playlistItems.find(
        (playlistItem) => playlistItem.sourceType === 'soundcloud',
      ) ??
      initialPreloadPlaylistItems.find(
        (playlistItem) => playlistItem.sourceType === 'soundcloud',
      ) ??
      null;
    const preloadVideoPlaylistItem =
      playlistItems.find(
        (playlistItem) => playlistItem.sourceType === 'youtube',
      ) ??
      initialPreloadPlaylistItems.find(
        (playlistItem) => playlistItem.sourceType === 'youtube',
      ) ??
      null;

    const [SoundCloudPlayerComponent, setSoundCloudPlayerComponent] =
      useState<PlayerComponent | null>(null);
    const [VideoPlayerComponent, setVideoPlayerComponent] =
      useState<PlayerComponent | null>(null);
    const [isPlaybackBlocked, setIsPlaybackBlocked] = useState(false);
    const [isVideoVisible, setIsVideoVisible] = useState(false);
    const [isSkipPending, setIsSkipPending] = useState(false);
    useLayoutEffect(() => {
      if (submittedRoom.current === roomId) return;
      submittedRoom.current = null;
      setIsSkipPending(false);
    }, [roomId]);
    const [playerLoadErrors, setPlayerLoadErrors] = useState<PlayerLoadErrors>({
      soundcloud: null,
      video: null,
    });
    const debugMountRef = useRef(false);

    /* 3. Handlers */
    const roomMode = displayRoom?.mode;
    const performPlaybackAction = useCallback(
      (action: 'pause' | 'play') => {
        if (!roomMode) return;

        if (roomMode === 'host' && !hasHostPlaybackAuthority) return;

        setLocalPlayingState(action === 'play', roomMode);

        if (roomMode === 'server') return;

        submittedRoom.current = roomId;
        playbackFetcher.submit(
          {
            action,
            intent: 'playback',
          },
          {
            action: `/${encodeURIComponent(roomId)}`,
            encType: 'application/json',
            method: 'post',
          },
        );
      },
      [
        roomMode,
        roomId,
        playbackFetcher,
        setLocalPlayingState,
        hasHostPlaybackAuthority,
      ],
    );

    const play = useCallback(() => {
      markPlaybackGestureUnlocked();
      performPlaybackAction('play');
    }, [performPlaybackAction]);

    const pause = useCallback(() => {
      performPlaybackAction('pause');
    }, [performPlaybackAction]);

    useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (
          event.code !== 'Space' ||
          event.repeat ||
          event.altKey ||
          event.ctrlKey ||
          event.metaKey ||
          event.shiftKey
        ) {
          return;
        }

        const target = event.target;

        if (
          target instanceof HTMLElement &&
          target.closest(
            'input, textarea, select, button, a, [contenteditable]:not([contenteditable="false"]), [role="button"], [role="slider"]',
          )
        ) {
          return;
        }

        const canPlay =
          canControlRoomPlayback &&
          Boolean(currentPlaylistItem || playlistItems.length > 0);

        if (!canPlay) return;

        event.preventDefault();

        if (isPlaying && !isPlaybackBlocked) {
          pause();

          return;
        }

        play();
      };

      window.addEventListener('keydown', handleKeyDown);

      return () => window.removeEventListener('keydown', handleKeyDown);
    }, [
      canControlRoomPlayback,
      currentPlaylistItem,
      isPlaybackBlocked,
      isPlaying,
      pause,
      play,
      playlistItems.length,
    ]);

    const handleLocalPause = useCallback(() => {
      if (roomMode === 'host') {
        pause();

        return;
      }

      if (roomMode === 'server') {
        setLocalPlayingState(false, roomMode);
      }
    }, [roomMode, pause, setLocalPlayingState]);

    const handleLocalPlay = useCallback(() => {
      if (roomMode === 'host') {
        if (usePlaybackStore.getState().isPlaying) return;

        play();

        return;
      }

      if (roomMode === 'server') {
        setLocalPlayingState(true, roomMode);
      }
    }, [roomMode, play, setLocalPlayingState]);

    const seek = useCallback(
      (positionMs: number) => {
        if (!hasHostPlaybackAuthority) return;

        submittedRoom.current = roomId;
        playbackFetcher.submit(
          {
            action: 'seek',
            intent: 'playback',
            positionMs,
          },
          {
            action: `/${encodeURIComponent(roomId)}`,
            encType: 'application/json',
            method: 'post',
          },
        );
      },
      [playbackFetcher, roomId, hasHostPlaybackAuthority],
    );

    const handleLocalSeek = useCallback(
      (positionMs: number) => {
        if (hasHostPlaybackAuthority) {
          seek(positionMs);

          return;
        }

        setLocalPlaybackPosition(positionMs);
      },
      [hasHostPlaybackAuthority, seek, setLocalPlaybackPosition],
    );

    const skip = useCallback(
      (shouldShowFeedback = true) => {
        if (shouldShowFeedback) {
          setIsSkipPending(true);
        }

        submittedRoom.current = roomId;
        playbackFetcher.submit(
          {
            intent: 'skip',
          },
          {
            action: `/${encodeURIComponent(roomId)}`,
            encType: 'application/json',
            method: 'post',
          },
        );
      },
      [playbackFetcher, roomId],
    );

    const handleEnded = useCallback(() => {
      skip(false);
    }, [skip]);

    const reset = useCallback(() => {
      submittedRoom.current = roomId;
      playbackFetcher.submit(
        {
          intent: 'resetPlayback',
        },
        {
          action: `/${encodeURIComponent(roomId)}`,
          encType: 'application/json',
          method: 'post',
        },
      );
    }, [playbackFetcher, roomId]);

    useMediaSession({
      canPlay:
        canControlRoomPlayback &&
        Boolean(currentPlaylistItem || playlistItems.length > 0),
      canSkip: canSkipPlaylistItem && Boolean(currentPlaylistItem),
      currentPlaylistItem,
      isPlaying: isPlaying && !isPlaybackBlocked,
      onPause: pause,
      onPlay: play,
      onSkip: skip,
      onPrevious: () =>
        showToast('No rewinds here. The next banger awaits.', 'info'),
    });

    /* 4. Effects */
    useEffect(() => {
      setPlayerLoadErrors((prev) => ({
        ...prev,
        soundcloud:
          currentPlaylistItem?.sourceType === 'soundcloud'
            ? null
            : prev.soundcloud,
        video:
          currentPlaylistItem && currentPlaylistItem.sourceType === 'youtube'
            ? null
            : prev.video,
      }));
    }, [currentPlaylistItem?.sourceType, currentPlaylistItem]);

    useEffect(() => {
      if (playbackFetcher.state !== 'idle' || !playbackFetcher.data) return;
      if (submittedRoom.current !== roomId) return;

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
      roomId,
      resetPlaybackState,
      setPlaybackState,
    ]);

    /* 5. Render */

    useEffect(() => {
      if (!shouldPrepareSoundCloudPlayer || SoundCloudPlayerComponent) return;

      let isMounted = true;
      const loadSoundCloudPlayer = async () => {
        const [loadErr, module] = await safeWrapAsync(importSoundCloudPlayer());
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
        const [loadErr, module] = await safeWrapAsync(importVideoPlayer());
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
      browserDebugLog('[RoomPlayer] mount', {
        roomId,
      });

      return () => {
        browserDebugLog('[RoomPlayer] unmount', {
          roomId,
        });
      };
    }, [roomId]);

    const isSoundCloudTrack = currentPlaylistItem?.sourceType === 'soundcloud';
    const isVideoTrack = currentPlaylistItem
      ? currentPlaylistItem.sourceType === 'youtube'
      : false;
    const isPlayerMissing =
      (isSoundCloudTrack && !SoundCloudPlayerComponent) ||
      (isVideoTrack && !VideoPlayerComponent);
    // Server-rendered now playing stays up until the video itself is on screen, so first paint
    // shows what is playing (not an empty frame); it steps aside for click-to-play.
    const showNowPlayingPanel =
      !isConnected &&
      (isPlayerMissing ||
        (isVideoTrack && !isVideoVisible && !isPlaybackBlocked));
    const currentPlayerError = isSoundCloudTrack
      ? playerLoadErrors.soundcloud
      : isVideoTrack
        ? playerLoadErrors.video
        : null;

    return (
      <div
        data-room-player-surface
        className={classNames(
          'flex min-w-0 shrink-0 origin-top-left flex-col gap-6 lg:col-span-3 lg:grid lg:h-full lg:min-h-0 lg:grid-rows-[minmax(0,1fr)_auto]',
          minimized && '!block',
        )}
      >
        <AutoSkipHandler
          currentPlaylistItem={currentPlaylistItem}
          isPlaying={isPlaying}
          skip={skip}
          {...(hasHostPlaybackAuthority && {
            mode: 'host',
          })}
        />

        {/* Player - Reserve height to prevent CLS */}
        <div
          className={classNames(
            'crt-frame backdrop-filter-none! relative isolate flex min-h-player-min w-full overflow-hidden rounded-player bg-black sm:min-h-player-sm-min lg:aspect-auto lg:min-h-0',
            minimized && '!aspect-video !min-h-[202px] !rounded-none',
          )}
        >
          {minimized && (
            <Link
              aria-label={`Return to ${displayRoom?.name ?? 'room'}`}
              className="focus-visible:ring-secondary absolute inset-0 z-40 focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset"
              to={`/${encodeURIComponent(roomId)}`}
              prefetch="intent"
            >
              <span className="sr-only">Return to room</span>
            </Link>
          )}
          {VideoPlayerComponent && !isConnected && (
            <div
              className={classNames(
                'absolute inset-0 flex items-center justify-center bg-black',
                !isVideoTrack && 'pointer-events-none opacity-0',
              )}
            >
              <VideoPlayerComponent
                allowUnmutedAutoplay
                fill
                onLocalAlignmentChange={setLocalPlaybackAligned}
                {...((hasHostPlaybackAuthority ||
                  displayRoom?.mode === 'server') && {
                  onLocalPause: handleLocalPause,
                  onLocalPlay: handleLocalPlay,
                })}
                {...((hasHostPlaybackAuthority ||
                  displayRoom?.mode === 'server') && {
                  onLocalSeek: handleLocalSeek,
                })}
                {...(hasHostPlaybackAuthority && {
                  onEnded: handleEnded,
                })}
                isVisible={!isConnected && isVideoTrack}
                onNeedsUserGestureChange={setIsPlaybackBlocked}
                onVideoVisibleChange={setIsVideoVisible}
                appContext="platform"
                preloadPlaylistItem={preloadVideoPlaylistItem}
                volume={volume}
              />
            </div>
          )}
          {isConnected && castDeviceName && (
            <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center">
              <div className="panel-surface text-theme shadow-playback-badge flex items-center gap-3 rounded-full px-5 py-2 text-sm">
                <span className="bg-primary h-2.5 w-2.5 animate-pulse rounded-full" />
                <span className="font-medium">Casting to {castDeviceName}</span>
              </div>
            </div>
          )}
          {currentPlaylistItem && showNowPlayingPanel && (
            <div className="min-h-player-min">
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black">
                {/* SIGNAL CRT */}
                <div className="pointer-events-none absolute inset-0 z-1 overflow-hidden">
                  <div className="vhs-scanlines h-full w-full animate-none! opacity-20 mix-blend-overlay" />
                  <div className="crt-overlay pointer-events-none !absolute inset-0 !z-2 opacity-10" />
                </div>
                {/* Server-rendered now playing: visible at first paint while the provider player loads. */}
                <div
                  role="status"
                  className="relative z-10 flex max-w-full flex-col items-center gap-2 px-6 text-center"
                >
                  {/* Same preloaded artwork as the now-playing card, revealed before hydration. */}
                  <PlaylistItemArtwork
                    thumbnailUrl={currentPlaylistItem.thumbnailUrl}
                    width={320}
                    height={180}
                    fetchPriority="high"
                    className="mb-2 aspect-video w-36 rounded-xl border border-white/10 object-cover shadow-lg transition-opacity duration-300 sm:w-56"
                  />
                  <p className="font-display line-clamp-2 text-2xl text-white sm:text-3xl">
                    {currentPlaylistItem.title}
                  </p>
                  {currentPlaylistItem.publisher && (
                    <p className="line-clamp-1 text-sm text-white/70">
                      {currentPlaylistItem.publisher}
                    </p>
                  )}
                  <p className="text-2xs mt-2 inline-flex items-center gap-2 tracking-widest text-white/60 uppercase">
                    <span
                      aria-hidden="true"
                      className="border-t-primary h-3 w-3 rounded-full border-2 border-white/30 motion-safe:animate-spin"
                    />
                    {currentPlayerError ?? 'Loading player...'}
                  </p>
                </div>
              </div>
            </div>
          )}
          {SoundCloudPlayerComponent && !isConnected && (
            <div
              className={classNames(
                'absolute inset-0',
                (!isSoundCloudTrack || isConnected) &&
                  'pointer-events-none opacity-0',
              )}
            >
              <SoundCloudPlayerComponent
                allowUnmutedAutoplay
                fill
                onLocalAlignmentChange={setLocalPlaybackAligned}
                {...((hasHostPlaybackAuthority ||
                  displayRoom?.mode === 'server') && {
                  onLocalPlay: handleLocalPlay,
                })}
                onNeedsUserGestureChange={setIsPlaybackBlocked}
                {...(hasHostPlaybackAuthority && {
                  onEnded: handleEnded,
                })}
                isVisible={!isConnected && isSoundCloudTrack}
                preloadPlaylistItem={preloadSoundCloudPlaylistItem}
                showInitialPlaybackOverlay
                volume={volume}
              />
            </div>
          )}
          {!currentPlaylistItem && playlistItems.length > 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-black">
              {/* SIGNAL CRT */}
              <div className="pointer-events-none absolute inset-0 z-1 overflow-hidden">
                <div className="vhs-scanlines h-full w-full animate-none! opacity-20 mix-blend-overlay" />
                <div className="crt-overlay pointer-events-none !absolute inset-0 !z-2 opacity-10" />
              </div>
              <div className="relative z-10 text-center">
                <div className="border-theme bg-theme-surface mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full border">
                  <div className="border-theme border-t-primary h-6 w-6 animate-spin rounded-full border-2" />
                </div>
                <p className="text-theme-muted text-sm">Loading song...</p>
              </div>
            </div>
          )}
          {!currentPlaylistItem && playlistItems.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center overflow-hidden bg-black">
              {/* SIGNAL CRT */}
              <div className="pointer-events-none absolute inset-0 z-1 overflow-hidden">
                <div className="vhs-scanlines h-full w-full animate-none! opacity-20 mix-blend-overlay" />
                <div className="crt-overlay pointer-events-none !absolute inset-0 !z-2 opacity-10" />
              </div>
              <div className="relative z-10 text-center">
                <div className="border-theme text-2xs text-theme-muted tracking-label mb-6 inline-flex items-center rounded-full border px-4 py-2">
                  NO SIGNAL
                </div>
                <h3 className="font-display text-theme mb-2 text-base">
                  Add a {displayRoom?.roomType === 'WATCH' ? 'video' : 'song'}{' '}
                  to light up the room
                </h3>
                <p className="text-theme-muted text-xs">
                  {displayRoom?.roomType === 'WATCH'
                    ? 'Pick a video and watch together.'
                    : 'Pick a song and listen together.'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Controls (always below video) */}

        <PlayerControls
          compact={minimized}
          roomType={displayRoom?.roomType ?? 'MUSIC'}
          isPlaying={isPlaying && !isPlaybackBlocked}
          canPlay={
            canControlRoomPlayback &&
            Boolean(currentPlaylistItem || playlistItems.length > 0)
          }
          canSkip={canSkipPlaylistItem && Boolean(currentPlaylistItem)}
          isSkipping={isSkipPending}
          showReset={
            Boolean(currentPlaylistItem) && hasLocalPlaybackChanges && !isHost
          }
          onPlay={play}
          onPause={pause}
          onSkip={skip}
          onReset={reset}
          addPlaylistItemHref={addPlaylistItemHref}
          castHref={castHref}
          showCast={showCast}
          isCasting={isConnected}
          castDeviceName={castDeviceName}
          volume={volume}
          onVolumeChange={setVolume}
          onToggleMuted={toggleMuted}
        />
      </div>
    );
  },
);
