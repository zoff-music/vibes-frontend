import { useSSE } from '@vibes/api';
import type { RoomGenerationUpdate } from '@vibes/models';
import {
  type Song,
  showToast,
  usePlaybackStore,
  useQueueStore,
  useRoomStore,
} from '@vibes/shared';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  useFetcher,
  useLoaderData,
  useNavigate,
  useParams,
} from 'react-router';
import { DeviceSelector } from '../../components/cast/DeviceSelector';
import { AddToQueueModal } from '../../components/queue/AddToQueueModal';
import { useThemeDisplay } from '../../hooks/useThemeDisplay';
import { useThemeStore } from '../../stores/themeStore';
import { clientAction, type RoomActionData } from './action';
import { clientLoader } from './clientLoader';
import { RoomGenerationProgress } from './components/RoomGenerationProgress';
import { RoomHeader } from './components/RoomHeader';
import { RoomPlayer } from './components/RoomPlayer';
import { RoomQueue } from './components/RoomQueue';
import type { RoomLoaderData } from './loader';
import { loader } from './loader';

export { clientAction, clientLoader, loader };

export default function Room() {
  const loaderData = useLoaderData() as RoomLoaderData;
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
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
  const songs = useQueueStore((state) => state.songs);
  const setSongs = useQueueStore((state) => state.setSongs);
  const setPlaybackState = usePlaybackStore((state) => state.setPlaybackState);
  const currentSongId = usePlaybackStore((state) => state.currentSong?.id);

  const [isSSR, setIsSSR] = useState(true);
  const { themeId, currentTheme } = useThemeDisplay();
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showDeviceSelector, setShowDeviceSelector] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [isGenerating, setIsGenerating] = useState(
    loaderData.room.isGenerating,
  );
  const [generationError, setGenerationError] = useState<string>();

  const shareUrl = typeof window === 'undefined' ? '' : window.location.href;
  const displayRoom = useMemo(
    () => room ?? loaderData.room,
    [loaderData.room, room],
  );
  const isAuthenticating = adminFetcher.state !== 'idle';
  const showGenerationProgress = isGenerating && songs.length <= 2;

  const handleGenerationUpdate = useCallback((update: RoomGenerationUpdate) => {
    if (update.status === 'generating') {
      setIsGenerating(true);
      return;
    }

    setIsGenerating(false);
    if (update.status === 'failed') {
      setGenerationError(
        update.error ?? 'Could not finish generating this playlist.',
      );
    }
  }, []);

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

  const handleCopyShareLink = useCallback(() => {
    if (!shareUrl) return;
    void navigator.clipboard.writeText(shareUrl);
    showToast('Link copied!', 'success');
    setShowShare(false);
  }, [shareUrl]);

  const handleJoinAdmin = useCallback(() => {
    if (!adminPassword) return;
    adminFetcher.submit(
      { intent: 'joinRoom', password: adminPassword },
      { encType: 'application/json', method: 'post' },
    );
  }, [adminFetcher, adminPassword]);

  const handleLeave = useCallback(() => {
    navigate('/', { state: { fromRoom: true } });
  }, [navigate]);

  useEffect(() => {
    setIsSSR(false);
    setRoom(loaderData.room);
    setSongs(loaderData.songs);
    setIsGenerating(loaderData.room.isGenerating);
    if (loaderData.playback) {
      setPlaybackState(loaderData.playback, loaderData.room.mode);
    }
  }, [loaderData, setPlaybackState, setRoom, setSongs]);

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

  return (
    <div
      className={`relative min-h-screen overflow-x-hidden lg:h-screen lg:overflow-hidden ${
        !isSSR ? 'animate-fade-in' : ''
      }`}
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
          onCopyShareLink={handleCopyShareLink}
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
                  initialPlayback={loaderData.playback}
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

        <DeviceSelector isOpen={showDeviceSelector} onClose={handleCloseCast} />
        <AddToQueueModal
          room={displayRoom}
          providers={loaderData.providers}
          isVisible={isAddModalVisible}
          onClose={handleCloseAddSong}
        />
      </div>
    </div>
  );
}
