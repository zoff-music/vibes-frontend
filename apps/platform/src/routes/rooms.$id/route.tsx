import { useSSE } from '@vibes/api';
import type { RoomGenerationUpdate } from '@vibes/models';
import {
  type Song,
  safeWrapAsync,
  showToast,
  usePlaybackStore,
  useQueueStore,
  useRoomStore,
} from '@vibes/shared';
import { motion, type Transition, useReducedMotion } from 'framer-motion';
import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  isRouteErrorResponse,
  useFetcher,
  useLoaderData,
  useNavigate,
  useNavigationType,
  useParams,
  useRevalidator,
  useRouteError,
} from 'react-router';
import { useThemeDisplay } from '../../hooks/useThemeDisplay';
import { useThemeStore } from '../../stores/themeStore';
import { clientAction, type RoomActionData } from './action';
import { clientLoader } from './clientLoader';
import { RoomErrorView } from './components/RoomErrorView';
import { RoomGenerationMenu } from './components/RoomGenerationMenu';
import { RoomGenerationProgress } from './components/RoomGenerationProgress';
import { RoomHeader } from './components/RoomHeader';
import { RoomPlayer } from './components/RoomPlayer';
import { RoomQueue } from './components/RoomQueue';
import type { RoomLoaderData } from './loader';
import { loader } from './loader';
import { roomMeta } from './meta';
import {
  createRoomShareDescription,
  createRoomShareTitle,
  createRoomShareUrl,
} from './share';
import { shouldRevalidate } from './shouldRevalidate';

export {
  clientAction,
  clientLoader,
  loader,
  roomMeta as meta,
  shouldRevalidate,
};

const GENERATION_RELOAD_DELAY_MS = 5 * 60 * 1000;

function normalizeRouteError(routeError: unknown): Error {
  if (routeError instanceof Error) {
    return routeError;
  }
  if (isRouteErrorResponse(routeError)) {
    return new Error(
      routeError.statusText ||
        `Could not load this room (${routeError.status})`,
    );
  }
  return new Error('Could not load this room. Please try again.');
}

export function ErrorBoundary() {
  const routeError = useRouteError();
  const { id = '' } = useParams<{ id: string }>();
  const revalidator = useRevalidator();

  return (
    <div className="relative z-10 flex min-h-screen">
      <RoomErrorView
        error={normalizeRouteError(routeError)}
        roomId={id}
        onRetry={revalidator.revalidate}
      />
    </div>
  );
}

const LazyDeviceSelector = lazy(async () => {
  const module = await import('../../components/cast/DeviceSelector');
  return { default: module.DeviceSelector };
});

const LazyAddToQueueModal = lazy(async () => {
  const module = await import('../../components/queue/AddToQueueModal');
  return { default: module.AddToQueueModal };
});

interface DeferredModalLoadingProps {
  label: string;
}

function DeferredModalLoading({ label }: DeferredModalLoadingProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div
        className="panel-strong flex items-center gap-3 rounded-2xl border border-theme px-5 py-4 text-theme shadow-2xl"
        role="status"
      >
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-theme border-t-primary" />
        <span className="font-pixel text-theme-muted text-xs">{label}</span>
      </div>
    </div>
  );
}

export default function Room() {
  const loaderData = useLoaderData() as RoomLoaderData;
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const navigationType = useNavigationType();
  const revalidate = useRevalidator().revalidate;
  const adminFetcher = useFetcher<RoomActionData>();

  const headerRef = useRef<HTMLDivElement | null>(null);
  const shareButtonRef = useRef<HTMLButtonElement | null>(null);
  const sharePanelRef = useRef<HTMLDivElement | null>(null);
  const settingsButtonRef = useRef<HTMLButtonElement | null>(null);
  const settingsMenuRef = useRef<HTMLDivElement | null>(null);
  const originalTitleRef = useRef<string | null>(null);

  const { toggleDarkMode } = useThemeStore();
  const room = useRoomStore((state) => state.room);
  const isAdmin = useRoomStore((state) => state.isAdmin);
  const setRoom = useRoomStore((state) => state.setRoom);
  const setSession = useRoomStore((state) => state.setSession);
  const usersCount = useRoomStore((state) => state.usersCount);
  const songs = useQueueStore((state) => state.songs);
  const setSongs = useQueueStore((state) => state.setSongs);
  const setPlaybackState = usePlaybackStore((state) => state.setPlaybackState);
  const currentSongId = usePlaybackStore((state) => state.currentSong?.id);
  const currentSong = usePlaybackStore((state) => state.currentSong);

  const [isSSR, setIsSSR] = useState(true);
  const shouldReduceMotion = useReducedMotion();
  const { themeId, currentTheme } = useThemeDisplay();
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showDeviceSelector, setShowDeviceSelector] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [isGenerating, setIsGenerating] = useState(
    loaderData.room.isGenerating,
  );
  const [isGenerationProgressVisible, setIsGenerationProgressVisible] =
    useState(loaderData.room.isGenerating && loaderData.songs.length === 0);
  const [generationError, setGenerationError] = useState<string | undefined>(
    loaderData.room.generationError,
  );

  const displayRoom = useMemo(
    () => room ?? loaderData.room,
    [loaderData.room, room],
  );
  const shareUrl = useMemo(
    () =>
      createRoomShareUrl(
        typeof window === 'undefined'
          ? loaderData.pageUrl
          : window.location.href,
        id,
        currentSong,
        usersCount,
      ),
    [currentSong, id, loaderData.pageUrl, usersCount],
  );
  const shareTitle = createRoomShareTitle(displayRoom.name, currentSong);
  const shareText = createRoomShareDescription(
    displayRoom.name,
    currentSong,
    usersCount,
  );
  const isAuthenticating = adminFetcher.state !== 'idle';
  const showGenerationProgress =
    isGenerating && isGenerationProgressVisible && songs.length <= 2;

  const handleGenerationUpdate = useCallback(
    (update: RoomGenerationUpdate) => {
      if (update.status === 'generating') {
        setIsGenerating(true);
        return;
      }

      setIsGenerating(false);
      setIsGenerationProgressVisible(false);
      void revalidate();
      if (update.status === 'failed') {
        setGenerationError(
          update.error ?? 'Could not finish generating this playlist.',
        );
      }
    },
    [revalidate],
  );

  const sseCallbacks = useMemo(
    () => ({ onGenerationUpdate: handleGenerationUpdate }),
    [handleGenerationUpdate],
  );
  useSSE(id, sseCallbacks);

  const handleToggleDarkMode = useCallback(() => {
    toggleDarkMode();
  }, [toggleDarkMode]);

  const handleAddSong = useCallback(() => {
    setIsAddModalVisible(true);
  }, []);

  const handleCloseAddSong = useCallback(() => {
    setIsAddModalVisible(false);
  }, []);

  const handleOpenCast = useCallback(() => {
    setShowDeviceSelector(true);
  }, []);

  const handleCloseCast = useCallback(() => {
    setShowDeviceSelector(false);
  }, []);

  const handleToggleShare = useCallback(() => {
    setShowShare((current) => !current);
  }, []);

  const handleToggleSettings = useCallback(() => {
    setShowSettings((current) => !current);
  }, []);

  const handleCloseSettings = useCallback(() => {
    setShowSettings(false);
  }, []);

  const handleOpenGenerationMenu = useCallback(() => {
    setShowSettings(false);
    setShowShare(false);
  }, []);

  const handleGenerationStarted = useCallback(() => {
    setGenerationError(undefined);
    setIsGenerating(true);
    setIsGenerationProgressVisible(false);
    setShowSettings(false);
    if (displayRoom) {
      setRoom({
        ...displayRoom,
        generationCount: displayRoom.generationCount + 1,
      });
    }
  }, [displayRoom, setRoom]);

  const handleShareRoom = useCallback(async () => {
    if (!shareUrl) return;

    if (navigator.share) {
      const [err] = await safeWrapAsync(
        navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        }),
      );
      if (!err) {
        setShowShare(false);
        setShowSettings(false);
        return;
      }
      if (err instanceof DOMException && err.name === 'AbortError') {
        return;
      }
    }

    const [err] = await safeWrapAsync(navigator.clipboard.writeText(shareUrl));
    if (err) {
      showToast('Could not share this room. Please try again.', 'error');
      return;
    }

    showToast('Share link copied!', 'success');
    setShowShare(false);
    setShowSettings(false);
  }, [shareText, shareTitle, shareUrl]);

  const handleJoinAdmin = useCallback(() => {
    if (!adminPassword) return;
    adminFetcher.submit(
      { intent: 'joinRoom', password: adminPassword },
      { encType: 'application/json', method: 'post' },
    );
  }, [adminFetcher, adminPassword]);

  const handleLeave = useCallback(() => {
    navigate('/', { state: { fromRoom: true }, viewTransition: true });
  }, [navigate]);

  useEffect(() => {
    setIsSSR(false);
    setRoom(loaderData.room);
    setSongs(loaderData.songs);
    setIsGenerating(loaderData.room.isGenerating);
    setGenerationError(loaderData.room.generationError);
    setIsGenerationProgressVisible(
      loaderData.room.isGenerating && loaderData.songs.length === 0,
    );
    if (loaderData.playback) {
      setPlaybackState(loaderData.playback, loaderData.room.mode);
    }
  }, [loaderData, setPlaybackState, setRoom, setSongs]);

  useEffect(() => {
    if (!isGenerating) {
      return;
    }

    const timeout = window.setTimeout(() => {
      window.location.reload();
    }, GENERATION_RELOAD_DELAY_MS);

    return () => window.clearTimeout(timeout);
  }, [isGenerating]);

  useEffect(() => {
    if (adminFetcher.state !== 'idle' || !adminFetcher.data) return;
    if (adminFetcher.data.intent !== 'joinRoom') return;

    if (adminFetcher.data.error || !adminFetcher.data.session) {
      showToast('Failed to authenticate. Incorrect password?', 'error');
      return;
    }

    const session = adminFetcher.data.session;
    setSession(
      session.sessionId || session.userId,
      session.isAdmin,
      session.nickname ?? undefined,
    );
    setRoom(session.room);
    setAdminPassword('');
    showToast(
      displayRoom.hasPassword
        ? 'Logged in as admin!'
        : 'Password set and admin granted!',
      'success',
    );
  }, [
    adminFetcher.data,
    adminFetcher.state,
    displayRoom.hasPassword,
    setRoom,
    setSession,
  ]);

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    const updateHeaderHeight = () => {
      document.documentElement.style.setProperty(
        '--room-header-height',
        `${header.getBoundingClientRect().height}px`,
      );
    };
    updateHeaderHeight();

    const resizeObserver = new ResizeObserver(updateHeaderHeight);
    resizeObserver.observe(header);
    window.addEventListener('resize', updateHeaderHeight);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateHeaderHeight);
    };
  }, []);

  useEffect(() => {
    if (!originalTitleRef.current) {
      originalTitleRef.current = document.title;
    }
    const currentSong = usePlaybackStore.getState().currentSong;
    document.title = currentSong?.title
      ? `${currentSong.title} · ${displayRoom.name}`
      : originalTitleRef.current;

    return () => {
      if (originalTitleRef.current) {
        document.title = originalTitleRef.current;
      }
    };
  }, [currentSongId, displayRoom.name]);

  useEffect(() => {
    const handleSongAdded = (event: Event) => {
      const song = (event as CustomEvent<Song>).detail;
      showToast(`"${song.title}" added to queue`, 'success');
    };
    window.addEventListener('song-added', handleSongAdded);
    return () => window.removeEventListener('song-added', handleSongAdded);
  }, []);

  useEffect(() => {
    if (!showShare) return;
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (target instanceof Element && target.closest('[role="dialog"]'))
        return;
      if (sharePanelRef.current?.contains(target)) return;
      if (shareButtonRef.current?.contains(target)) return;
      if (settingsMenuRef.current?.contains(target)) return;
      setShowShare(false);
    };
    const timeout = window.setTimeout(
      () => document.addEventListener('click', handleOutsideClick),
      0,
    );
    return () => {
      window.clearTimeout(timeout);
      document.removeEventListener('click', handleOutsideClick);
    };
  }, [showShare]);

  useEffect(() => {
    if (!showSettings) return;
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (target instanceof Element && target.closest('[role="dialog"]'))
        return;
      if (settingsMenuRef.current?.contains(target)) return;
      if (settingsButtonRef.current?.contains(target)) return;
      setShowSettings(false);
      setShowShare(false);
    };
    const timeout = window.setTimeout(
      () => document.addEventListener('click', handleOutsideClick),
      0,
    );
    return () => {
      window.clearTimeout(timeout);
      document.removeEventListener('click', handleOutsideClick);
    };
  }, [showSettings]);

  const roomEntryInitial =
    navigationType === 'PUSH' && !shouldReduceMotion
      ? roomEntryInitialState
      : false;

  return (
    <motion.div
      animate={roomEntryVisibleState}
      className="room-entry relative min-h-screen overflow-x-hidden lg:h-screen lg:overflow-hidden"
      initial={roomEntryInitial}
      transition={roomEntryTransition}
    >
      <div className="relative z-10 flex min-h-screen flex-col overflow-x-hidden lg:h-screen lg:overflow-hidden">
        <RoomHeader
          headerRef={headerRef}
          displayRoom={displayRoom}
          roomId={id}
          showShare={showShare}
          onToggleShare={handleToggleShare}
          shareButtonRef={shareButtonRef}
          sharePanelRef={sharePanelRef}
          shareUrl={shareUrl}
          onShareRoom={handleShareRoom}
          themeId={themeId}
          currentTheme={currentTheme}
          onToggleDarkMode={handleToggleDarkMode}
          showSettings={showSettings}
          onToggleSettings={handleToggleSettings}
          onCloseSettings={handleCloseSettings}
          settingsButtonRef={settingsButtonRef}
          settingsMenuRef={settingsMenuRef}
          adminPassword={adminPassword}
          onAdminPasswordChange={setAdminPassword}
          onJoinAdmin={handleJoinAdmin}
          isAuthenticating={isAuthenticating}
          onLeave={handleLeave}
          providers={loaderData.providers}
        />

        <div className="flex-1 overflow-visible lg:overflow-hidden">
          {showGenerationProgress && (
            <RoomGenerationProgress isFailed={false} />
          )}
          {!showGenerationProgress && (
            <>
              {generationError && (
                <RoomGenerationProgress error={generationError} isFailed />
              )}
              <div className="mx-auto max-w-7xl items-start gap-8 px-4 py-8 lg:grid lg:h-[calc(100vh-var(--room-header-height,73px))] lg:grid-cols-[1.3fr_0.7fr] lg:py-6">
                <RoomPlayer
                  roomId={id}
                  displayRoom={displayRoom}
                  onAddSong={handleAddSong}
                  onOpenCast={handleOpenCast}
                  addSongLeadingAction={
                    <RoomGenerationMenu
                      generationCount={displayRoom.generationCount}
                      roomGenerationMaxDailyCount={
                        displayRoom.roomGenerationMaxDailyCount
                      }
                      roomGenerationMaxExistingSongs={
                        displayRoom.roomGenerationMaxExistingSongs
                      }
                      hasGenerationPermission={
                        !displayRoom.hasPassword || isAdmin
                      }
                      isGenerating={isGenerating}
                      onGenerationStarted={handleGenerationStarted}
                      onOpen={handleOpenGenerationMenu}
                      side="top"
                      songCount={songs.length}
                    />
                  }
                  initialPlayback={loaderData.playback}
                  providers={loaderData.providers}
                />
                <RoomQueue
                  roomId={id}
                  isSSR={isSSR}
                  isAdmin={isAdmin}
                  initialPlayback={loaderData.playback}
                  initialSongs={loaderData.songs}
                />
              </div>
            </>
          )}
        </div>

        {showDeviceSelector && (
          <Suspense
            fallback={<DeferredModalLoading label="Loading cast devices..." />}
          >
            <LazyDeviceSelector
              isOpen={showDeviceSelector}
              onClose={handleCloseCast}
            />
          </Suspense>
        )}
        {isAddModalVisible && (
          <Suspense
            fallback={<DeferredModalLoading label="Loading song search..." />}
          >
            <LazyAddToQueueModal
              room={displayRoom}
              providers={loaderData.providers}
              isVisible={isAddModalVisible}
              onClose={handleCloseAddSong}
            />
          </Suspense>
        )}
      </div>
    </motion.div>
  );
}

const roomEntryInitialState = {
  filter: 'blur(6px)',
  opacity: 0,
  scale: 1.012,
  y: 14,
};

const roomEntryTransition: Transition = {
  damping: 34,
  mass: 0.8,
  stiffness: 270,
  type: 'spring',
};

const roomEntryVisibleState = {
  filter: 'blur(0px)',
  opacity: 1,
  scale: 1,
  y: 0,
};
