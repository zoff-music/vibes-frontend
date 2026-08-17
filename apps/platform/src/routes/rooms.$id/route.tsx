import { useSSE } from '@vibes/api';
import type { RoomGenerationUpdate } from '@vibes/models';
import {
  classNames,
  type Song,
  safeWrapAsync,
  showToast,
  synchronizeServerClock,
  usePlaybackStore,
  useQueueStore,
  useRoomStore,
} from '@vibes/shared';
import { Button, PlusIcon } from '@vibes/ui/web';
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
  useSearchParams,
} from 'react-router';
import { useKonamiMode } from '../../components/konami/KonamiModeContext';
import { useRemoteControl } from '../../components/remote/RemoteControlProvider';
import { useThemeDisplay } from '../../hooks/useThemeDisplay';
import { useCastStore } from '../../stores/castStore';
import { useThemeStore } from '../../stores/themeStore';
import { clientAction, type RoomActionData } from './action';
import { clientLoader } from './clientLoader';
import { PartyScreenJoinCard } from './components/PartyScreenJoinCard';
import { RoomErrorView } from './components/RoomErrorView';
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

const GENERATION_REFRESH_DELAY_MS = 5 * 60 * 1000;

interface PublicRoomError {
  isRoomNotFound: boolean;
  message: string;
}

function normalizeRouteError(routeError: unknown): PublicRoomError {
  if (isRouteErrorResponse(routeError)) {
    if (routeError.status === 404) {
      return {
        isRoomNotFound: true,
        message: 'This room could not be found.',
      };
    }
    if (routeError.status === 429) {
      return {
        isRoomNotFound: false,
        message: 'Too many requests. Wait a moment, then try again.',
      };
    }
  }
  return {
    isRoomNotFound: false,
    message: 'Could not load this room. Please try again.',
  };
}

export function ErrorBoundary() {
  const routeError = useRouteError();
  const { id = '' } = useParams<{ id: string }>();
  const revalidator = useRevalidator();
  const publicError = normalizeRouteError(routeError);

  return (
    <div className="relative z-10 flex min-h-screen">
      <RoomErrorView
        isRoomNotFound={publicError.isRoomNotFound}
        message={publicError.message}
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

const LazyTerminalShell = lazy(async () => {
  const module = await import('@vibes/ui/konami');
  return { default: module.TerminalShell };
});

const LazyTerminalLoading = lazy(async () => {
  const module = await import('@vibes/ui/konami');
  return { default: module.TerminalLoading };
});

interface DeferredModalLoadingProps {
  label: string;
  terminalMode?: boolean;
}

function DeferredModalLoading({
  label,
  terminalMode = false,
}: DeferredModalLoadingProps) {
  if (terminalMode) {
    return (
      <Suspense fallback={null}>
        <LazyTerminalLoading label={label} overlay />
      </Suspense>
    );
  }

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
  const [searchParams, setSearchParams] = useSearchParams();
  const revalidate = useRevalidator().revalidate;
  const adminFetcher = useFetcher<RoomActionData>();
  const { setMachineRoomId } = useRemoteControl();
  const terminalMode = useKonamiMode();

  const headerRef = useRef<HTMLDivElement | null>(null);
  const shareButtonRef = useRef<HTMLButtonElement | null>(null);
  const sharePanelRef = useRef<HTMLDivElement | null>(null);
  const settingsButtonRef = useRef<HTMLButtonElement | null>(null);
  const settingsMenuRef = useRef<HTMLDivElement | null>(null);

  const toggleDarkMode = useThemeStore((state) => state.toggleDarkMode);
  const room = useRoomStore((state) => state.room);
  const isAdmin = useRoomStore((state) => state.isAdmin);
  const setRoom = useRoomStore((state) => state.setRoom);
  const setHost = useRoomStore((state) => state.setHost);
  const setSession = useRoomStore((state) => state.setSession);
  const setUsersCount = useRoomStore((state) => state.setUsersCount);
  const usersCount = useRoomStore((state) => state.usersCount);
  const songs = useQueueStore((state) => state.songs);
  const setSongs = useQueueStore((state) => state.setSongs);
  const addSong = useQueueStore((state) => state.addSong);
  const setPlaybackState = usePlaybackStore((state) => state.setPlaybackState);
  const currentSong = usePlaybackStore((state) => state.currentSong);
  const initializeCast = useCastStore((state) => state.initialize);
  const isCastInitialized = useCastStore((state) => state.isInitialized);
  const isCasting = useCastStore((state) => state.isConnected);
  const castDeviceName = useCastStore(
    (state) => state.currentSession?.deviceName ?? null,
  );

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
  const adminError =
    adminFetcher.data?.intent === 'joinRoom'
      ? (adminFetcher.data.error ?? null)
      : null;
  const showGenerationProgress =
    isGenerating && isGenerationProgressVisible && songs.length <= 2;
  const isPartyScreen = searchParams.get('view') === 'party';

  useEffect(() => {
    setMachineRoomId(loaderData.room.id);
    return () => setMachineRoomId('');
  }, [loaderData.room.id, setMachineRoomId]);

  useEffect(() => {
    if (isCastInitialized) return;

    void initializeCast();
  }, [initializeCast, isCastInitialized]);

  const handleGenerationUpdate = useCallback((update: RoomGenerationUpdate) => {
    if (update.status === 'generating') {
      setIsGenerating(true);
      return;
    }

    setIsGenerating(false);
    setIsGenerationProgressVisible(false);
    if (update.status === 'failed') {
      setGenerationError(
        update.error ?? 'Could not finish generating this playlist.',
      );
    }
  }, []);

  const sseCallbacks = useMemo(
    () => ({
      onConnected: synchronizeServerClock,
      onGenerationUpdate: handleGenerationUpdate,
      onHostUpdate: ({ userId }: { userId: string }) => setHost(userId),
      onPlaybackUpdate: (playback: RoomLoaderData['playback']) => {
        if (!playback) return;
        setPlaybackState(playback, useRoomStore.getState().room?.mode);
      },
      onReconnect: revalidate,
      onRoomUpdate: setRoom,
      onSongAdded: (song: Song) => {
        addSong(song);
        showToast(`"${song.title}" added to queue`, 'success');
      },
      onSongsUpdate: setSongs,
      onUsersUpdate: setUsersCount,
    }),
    [
      addSong,
      handleGenerationUpdate,
      revalidate,
      setHost,
      setPlaybackState,
      setRoom,
      setSongs,
      setUsersCount,
    ],
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

  const handleOpenPartyScreen = useCallback(() => {
    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.set('view', 'party');
    setSearchParams(nextSearchParams, { replace: true });
    setShowShare(false);
  }, [searchParams, setSearchParams]);

  const handleExitPartyScreen = useCallback(() => {
    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.delete('view');
    setSearchParams(nextSearchParams, { replace: true });
  }, [searchParams, setSearchParams]);

  const handleToggleSettings = useCallback(() => {
    setShowSettings((current) => !current);
  }, []);

  const handleCloseSettings = useCallback(() => {
    setShowSettings(false);
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
      void revalidate();
    }, GENERATION_REFRESH_DELAY_MS);

    return () => window.clearTimeout(timeout);
  }, [isGenerating, revalidate]);

  useEffect(() => {
    if (adminFetcher.state !== 'idle' || !adminFetcher.data) return;
    if (adminFetcher.data.intent !== 'joinRoom') return;

    if (adminFetcher.data.error || !adminFetcher.data.session) {
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
  }, [isPartyScreen]);

  useEffect(() => {
    document.title = createRoomShareTitle(displayRoom.name, currentSong);
  }, [currentSong, displayRoom.name]);

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

  if (terminalMode) {
    return (
      <Suspense fallback={null}>
        <LazyTerminalShell
          channel="ROOM CONTROL"
          title={displayRoom.name}
          footer={
            <>
              <span>ROOM {id.toUpperCase()} / SSE ONLINE</span>
              <span>{usersCount.toString().padStart(3, '0')} USERS LINKED</span>
            </>
          }
        >
          <RoomHeader
            adminError={adminError}
            key="terminal-room-header"
            headerRef={headerRef}
            displayRoom={displayRoom}
            roomId={id}
            showShare={showShare}
            onToggleShare={handleToggleShare}
            shareButtonRef={shareButtonRef}
            sharePanelRef={sharePanelRef}
            shareUrl={shareUrl}
            onShareRoom={handleShareRoom}
            onOpenPartyScreen={handleOpenPartyScreen}
            onOpenCast={handleOpenCast}
            isCasting={isCasting}
            castDeviceName={castDeviceName}
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
            terminalMode
          />

          {showGenerationProgress && (
            <RoomGenerationProgress isFailed={false} terminalMode />
          )}
          {!showGenerationProgress && (
            <div className="grid min-h-0 flex-1 content-start items-start gap-4 lg:grid-cols-5">
              <RoomPlayer
                roomId={id}
                displayRoom={displayRoom}
                onAddSong={handleAddSong}
                onOpenCast={handleOpenCast}
                initialPlayback={loaderData.playback}
                providers={loaderData.providers}
                terminalMode
              />
              <RoomQueue
                roomId={id}
                isSSR={isSSR}
                isAdmin={isAdmin}
                initialPlayback={loaderData.playback}
                initialSongs={loaderData.songs}
                terminalMode
              />
            </div>
          )}

          {generationError && (
            <RoomGenerationProgress
              error={generationError}
              isFailed
              terminalMode
            />
          )}

          {showDeviceSelector && (
            <Suspense
              fallback={
                <DeferredModalLoading
                  label="Loading cast devices..."
                  terminalMode
                />
              }
            >
              <LazyDeviceSelector
                isOpen={showDeviceSelector}
                onClose={handleCloseCast}
                terminalMode
              />
            </Suspense>
          )}
          {isAddModalVisible && (
            <Suspense
              fallback={
                <DeferredModalLoading
                  label="Loading song search..."
                  terminalMode
                />
              }
            >
              <LazyAddToQueueModal
                room={displayRoom}
                providers={loaderData.providers}
                isVisible={isAddModalVisible}
                onClose={handleCloseAddSong}
                generationCount={displayRoom.generationCount}
                roomGenerationMaxDailyCount={
                  displayRoom.roomGenerationMaxDailyCount
                }
                roomGenerationMaxExistingSongs={
                  displayRoom.roomGenerationMaxExistingSongs
                }
                hasGenerationPermission={!displayRoom.hasPassword || isAdmin}
                isGenerating={isGenerating}
                onGenerationStarted={handleGenerationStarted}
                terminalMode
              />
            </Suspense>
          )}
        </LazyTerminalShell>
      </Suspense>
    );
  }

  return (
    <>
      <motion.div
        animate={roomEntryVisibleState}
        className={classNames(
          'room-entry relative min-h-screen overflow-x-hidden lg:h-screen lg:overflow-hidden',
          isPartyScreen && 'bg-theme',
        )}
        initial={roomEntryInitial}
        transition={roomEntryTransition}
      >
        <div className="relative z-10 flex min-h-screen flex-col overflow-x-hidden lg:h-screen lg:overflow-hidden">
          {!isPartyScreen && (
            <RoomHeader
              adminError={adminError}
              key="room-header"
              headerRef={headerRef}
              displayRoom={displayRoom}
              roomId={id}
              showShare={showShare}
              onToggleShare={handleToggleShare}
              shareButtonRef={shareButtonRef}
              sharePanelRef={sharePanelRef}
              shareUrl={shareUrl}
              onShareRoom={handleShareRoom}
              onOpenPartyScreen={handleOpenPartyScreen}
              onOpenCast={handleOpenCast}
              isCasting={isCasting}
              castDeviceName={castDeviceName}
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
          )}

          <div
            key="room-content"
            className="flex-1 overflow-visible lg:overflow-hidden"
          >
            {showGenerationProgress && (
              <RoomGenerationProgress isFailed={false} />
            )}
            {!showGenerationProgress && (
              <>
                {generationError && (
                  <RoomGenerationProgress error={generationError} isFailed />
                )}
                <div
                  className={classNames(
                    'mx-auto items-start gap-8 px-4 lg:grid',
                    !isPartyScreen &&
                      'max-w-7xl py-8 lg:h-[calc(100vh-var(--room-header-height,73px))] lg:grid-cols-5 lg:py-6',
                    isPartyScreen &&
                      'max-w-none py-4 lg:h-screen lg:grid-cols-5 lg:p-6',
                  )}
                >
                  <RoomPlayer
                    roomId={id}
                    displayRoom={displayRoom}
                    onAddSong={handleAddSong}
                    onOpenCast={handleOpenCast}
                    initialPlayback={loaderData.playback}
                    providers={loaderData.providers}
                  />
                  {!isPartyScreen && (
                    <RoomQueue
                      roomId={id}
                      isSSR={isSSR}
                      isAdmin={isAdmin}
                      initialPlayback={loaderData.playback}
                      initialSongs={loaderData.songs}
                    />
                  )}
                  {isPartyScreen && (
                    <div className="min-h-0 min-w-0 lg:col-span-2 lg:flex lg:h-full lg:flex-col">
                      <div className="min-h-0 lg:flex-1 lg:overflow-hidden">
                        <RoomQueue
                          roomId={id}
                          isSSR={isSSR}
                          isAdmin={isAdmin}
                          initialPlayback={loaderData.playback}
                          initialSongs={loaderData.songs}
                        />
                      </div>
                      <PartyScreenJoinCard
                        initialListenerCount={displayRoom.userCount ?? 0}
                        onExit={handleExitPartyScreen}
                        roomId={id}
                        roomName={displayRoom.name}
                        url={shareUrl}
                      />
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {showDeviceSelector && (
            <Suspense
              fallback={
                <DeferredModalLoading label="Loading cast devices..." />
              }
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
                generationCount={displayRoom.generationCount}
                roomGenerationMaxDailyCount={
                  displayRoom.roomGenerationMaxDailyCount
                }
                roomGenerationMaxExistingSongs={
                  displayRoom.roomGenerationMaxExistingSongs
                }
                hasGenerationPermission={!displayRoom.hasPassword || isAdmin}
                isGenerating={isGenerating}
                onGenerationStarted={handleGenerationStarted}
              />
            </Suspense>
          )}
        </div>
      </motion.div>
      {!isAddModalVisible && (
        <div className="sm:hidden">
          <Button
            aria-label="Add Song"
            className="fixed right-5 bottom-5 z-40 h-14 w-14 rounded-full p-0 shadow-primary-popover"
            onClick={handleAddSong}
            size="none"
            title="Add Song"
            variant="primary"
          >
            <PlusIcon className="h-6 w-6" />
          </Button>
        </div>
      )}
    </>
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
