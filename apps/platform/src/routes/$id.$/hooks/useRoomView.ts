import {
  useFetcher,
  useLoaderData,
  useNavigate,
  useNavigationType,
  useParams,
  useRevalidator,
  useSearchParams,
} from '@kasperrt/smolter/preact';
import { useRoomEventsV3 } from '@vibes/api';
import {
  type PlaylistItemIdUpdate,
  type PlaylistItemPositionUpdate,
  type RoomGenerationUpdate,
  type RoomHostUpdate,
} from '@vibes/models';
import {
  type PlaylistItem,
  safeWrapAsync,
  showToast,
  synchronizeServerClock,
  usePlaybackStore,
  useQueueStore,
  useRoomStore,
} from '@vibes/shared';
import { useReducedMotion } from 'framer-motion';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'preact/compat';
import { useRemoteControl } from '../../../components/remote/RemoteControlProvider';
import { useRememberRoom } from '../../../hooks/useRememberRoom';
import { useCastStore } from '../../../stores/castStore';
import { canUseViewTransition } from '../../../utils/viewTransition';
import type { clientLoader } from '../clientLoader';
import {
  GENERATION_REFRESH_DELAY_MS,
  roomEntryInitialState,
} from '../constants';
import type { RoomLoaderData } from '../loader';
import type { RoomActionData } from '../utils/actions/clientAction';
import { retainRoomData } from '../utils/roomPanel';
import {
  createRoomShareDescription,
  createRoomShareTitle,
  createRoomShareUrl,
} from '../utils/share';
import { useRoomPanel } from './useRoomPanel';

export function useRoomView() {
  const loaderData = useLoaderData<typeof clientLoader>();

  useRememberRoom(loaderData.room.id);
  const { panel, open, href } = useRoomPanel();
  useEffect(() => retainRoomData(loaderData), [loaderData]);

  const { id = '' } = useParams<{
    id: string;
  }>();
  const navigate = useNavigate();
  const navigationType = useNavigationType();
  const [searchParams, setSearchParams] = useSearchParams();
  const revalidate = useRevalidator();
  const adminFetcher = useFetcher<RoomActionData>();
  const { setMachineRoomId } = useRemoteControl();
  const headerRef = useRef<HTMLDivElement>(null);
  const shareButtonRef = useRef<HTMLAnchorElement>(null);
  const sharePanelRef = useRef<HTMLDivElement>(null);
  const settingsButtonRef = useRef<HTMLAnchorElement>(null);
  const settingsMenuRef = useRef<HTMLDivElement>(null);
  const room = useRoomStore((state) => state.room);
  const isAdmin = useRoomStore((state) => state.isAdmin);
  const setRoom = useRoomStore((state) => state.setRoom);
  const setHost = useRoomStore((state) => state.setHost);
  const setSession = useRoomStore((state) => state.setSession);
  const setUsersCount = useRoomStore((state) => state.setUsersCount);
  const usersCount = useRoomStore((state) => state.usersCount);
  const playlistItems = useQueueStore((state) => state.playlistItems);
  const setPlaylistItems = useQueueStore((state) => state.setPlaylistItems);
  const positionPlaylistItem = useQueueStore(
    (state) => state.positionPlaylistItem,
  );
  const removePlaylistItem = useQueueStore((state) => state.removePlaylistItem);
  const addPlaylistItem = useQueueStore((state) => state.addPlaylistItem);
  const setPlaybackState = usePlaybackStore((state) => state.setPlaybackState);
  const currentPlaylistItem = usePlaybackStore(
    (state) => state.currentPlaylistItem,
  );
  const initializeCast = useCastStore((state) => state.initialize);
  const isCastSupported = useCastStore((state) => state.isSupported);
  const isCastInitialized = useCastStore((state) => state.isInitialized);
  const isCasting = useCastStore((state) => state.isConnected);
  const castDeviceName = useCastStore(
    (state) => state.currentSession?.deviceName ?? null,
  );
  const [isSSR, setIsSSR] = useState(true);
  const [queueSnapshotRoomId, setQueueSnapshotRoomId] = useState<string | null>(
    null,
  );
  const queuePreviewProps =
    (isSSR || queueSnapshotRoomId !== id) &&
    loaderData.queuedPlaylistItemCount !== undefined
      ? {
          initialQueuedPlaylistItemCount: loaderData.queuedPlaylistItemCount,
        }
      : {};
  const playerPreloadProps =
    (isSSR || queueSnapshotRoomId !== id) && loaderData.preloadPlaylistItems
      ? {
          initialPreloadPlaylistItems: loaderData.preloadPlaylistItems,
        }
      : {};
  const shouldReduceMotion = useReducedMotion();
  const isAddModalVisible = panel === 'add';
  const showShare = panel === 'share' || panel === 'share/embed';
  const showSettings = panel === 'settings' || panel === 'settings/device';
  const [focusAdminLogin, setFocusAdminLogin] = useState(false);
  const showDeviceSelector = panel === 'cast';
  const [adminPassword, setAdminPassword] = useState('');
  const [isGenerating, setIsGenerating] = useState(
    loaderData.room.isGenerating,
  );
  const [isGenerationProgressVisible, setIsGenerationProgressVisible] =
    useState(
      loaderData.room.isGenerating && loaderData.playlistItems.length === 0,
    );
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
        currentPlaylistItem,
        usersCount,
      ),
    [currentPlaylistItem, id, loaderData.pageUrl, usersCount],
  );
  const shareTitle = createRoomShareTitle(
    displayRoom.name,
    currentPlaylistItem,
  );
  const shareText = createRoomShareDescription(
    displayRoom.name,
    currentPlaylistItem,
    usersCount,
    displayRoom.roomType,
  );
  const isAuthenticating = adminFetcher.state !== 'idle';
  const adminError =
    adminFetcher.data?.intent === 'joinRoom'
      ? (adminFetcher.data.error ?? null)
      : null;
  const showGenerationProgress =
    isGenerating && isGenerationProgressVisible && playlistItems.length <= 2;
  const isPartyScreen = searchParams.get('view') === 'party';

  useEffect(() => {
    setMachineRoomId(loaderData.room.id);

    return () => setMachineRoomId('');
  }, [loaderData.room.id, setMachineRoomId]);

  useEffect(() => {
    if (!isCastSupported || isCastInitialized) return;

    void initializeCast();
  }, [initializeCast, isCastInitialized, isCastSupported]);

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
      onHostUpdate: ({ userId, message }: RoomHostUpdate) => {
        const currentRoom = useRoomStore.getState().room;

        if (currentRoom?.hostId === userId) return;

        setHost(userId);
        showToast(
          userId && userId === currentRoom?.userId
            ? 'Host left, you are the new host.'
            : message,
          'info',
        );
      },
      onPlaybackUpdate: (playback: RoomLoaderData['playback']) => {
        if (!playback) return;

        setPlaybackState(playback, useRoomStore.getState().room?.mode);
      },
      onReconnect: revalidate,
      onRoomUpdate: setRoom,
      onPlaylistItemAdded: (playlistItem: PlaylistItem) => {
        addPlaylistItem(playlistItem);
        showToast(`"${playlistItem.title}" added to queue`, 'success');
      },
      onPlaylistItemRemoved: ({ id: playlistItemId }: PlaylistItemIdUpdate) =>
        removePlaylistItem(playlistItemId),
      onPlaylistItemUpdated: ({
        playlistItem,
        position,
      }: PlaylistItemPositionUpdate) => {
        const isNewPlaylistItem = !useQueueStore
          .getState()
          .playlistItems.some((item) => item.id === playlistItem.id);
        positionPlaylistItem(playlistItem, position);

        if (isNewPlaylistItem) {
          showToast(`"${playlistItem.title}" added to queue`, 'success');
        }
      },
      onPlaylistItemsUpdate: (items: PlaylistItem[]) => {
        setPlaylistItems(items);
        setQueueSnapshotRoomId(id);
      },
      onUsersUpdate: setUsersCount,
    }),
    [
      addPlaylistItem,
      handleGenerationUpdate,
      id,
      positionPlaylistItem,
      revalidate,
      removePlaylistItem,
      setHost,
      setPlaybackState,
      setRoom,
      setPlaylistItems,
      setUsersCount,
    ],
  );

  useRoomEventsV3(isSSR ? undefined : id, sseCallbacks);

  const chatOpen = panel === 'chat';
  const handleCloseAddPlaylistItem = useCallback(() => open(''), [open]);
  const handleCloseCast = useCallback(() => open(''), [open]);
  const handleOpenPartyScreen = useCallback(() => {
    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.set('view', 'party');
    navigate(`/${encodeURIComponent(id)}?${nextSearchParams}`, {
      replace: true,
      preventScrollReset: true,
    });
  }, [id, navigate, searchParams]);
  const handleExitPartyScreen = useCallback(() => {
    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.delete('view');
    setSearchParams(nextSearchParams, { replace: true });
  }, [searchParams, setSearchParams]);
  const handleToggleSettings = useCallback(() => {
    setFocusAdminLogin(false);
  }, []);
  const handleOpenAdminLogin = useCallback(() => {
    setFocusAdminLogin(true);
    open('settings');
  }, [open]);
  const handleCloseSettings = useCallback(() => open(''), [open]);
  const handleGenerationStarted = useCallback(() => {
    setGenerationError(undefined);
    setIsGenerating(true);
    setIsGenerationProgressVisible(false);
    if (showSettings) open('');

    if (displayRoom) {
      setRoom({
        ...displayRoom,
        generationCount: displayRoom.generationCount + 1,
      });
    }
  }, [displayRoom, setRoom, showSettings, open]);
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
        open('');

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
    open('');
  }, [shareText, shareTitle, shareUrl, open]);
  const handleJoinAdmin = useCallback(() => {
    if (!adminPassword) return;

    adminFetcher.submit(
      {
        intent: 'joinRoom',
        password: adminPassword,
      },
      {
        encType: 'application/json',
        method: 'post',
      },
    );
  }, [adminFetcher, adminPassword]);
  const handleLeave = useCallback(() => {
    navigate(
      displayRoom.roomType === 'WATCH' ? '/features/watch' : '/features/music',
      {
        state: {
          fromRoom: true,
        },
        viewTransition: canUseViewTransition(),
      },
    );
  }, [navigate, displayRoom.roomType]);

  useEffect(() => {
    setIsSSR(false);
    setRoom(loaderData.room);
    setPlaylistItems(loaderData.playlistItems);
    setIsGenerating(loaderData.room.isGenerating);
    setGenerationError(loaderData.room.generationError);
    setIsGenerationProgressVisible(
      loaderData.room.isGenerating && loaderData.playlistItems.length === 0,
    );

    if (loaderData.playback) {
      setPlaybackState(loaderData.playback, loaderData.room.mode);
    }
  }, [loaderData, setPlaybackState, setRoom, setPlaylistItems]);

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
    document.title = createRoomShareTitle(
      displayRoom.name,
      currentPlaylistItem,
    );
  }, [currentPlaylistItem, displayRoom.name]);

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

      if (settingsButtonRef.current?.contains(target)) return;

      if (window.location.pathname !== `/${encodeURIComponent(id)}/share`)
        return;

      open('');
    };
    const timeout = window.setTimeout(
      () => document.addEventListener('click', handleOutsideClick),
      0,
    );

    return () => {
      window.clearTimeout(timeout);
      document.removeEventListener('click', handleOutsideClick);
    };
  }, [showShare, open, id]);

  useEffect(() => {
    if (!showSettings) return;

    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node | null;

      if (!target) return;

      if (target instanceof Element && target.closest('[role="dialog"]'))
        return;

      if (settingsMenuRef.current?.contains(target)) return;

      if (settingsButtonRef.current?.contains(target)) return;

      if (shareButtonRef.current?.contains(target)) return;

      if (window.location.pathname !== `/${encodeURIComponent(id)}/settings`)
        return;

      open('');
    };
    const timeout = window.setTimeout(
      () => document.addEventListener('click', handleOutsideClick),
      0,
    );

    return () => {
      window.clearTimeout(timeout);
      document.removeEventListener('click', handleOutsideClick);
    };
  }, [showSettings, open, id]);

  const roomEntryInitial =
    navigationType === 'PUSH' && !shouldReduceMotion
      ? roomEntryInitialState
      : false;

  return {
    loaderData,
    panelHref: href,
    id,
    headerRef,
    shareButtonRef,
    sharePanelRef,
    settingsButtonRef,
    settingsMenuRef,
    room,
    isAdmin,
    playlistItems,
    isCastInitialized,
    isCasting,
    castDeviceName,
    isSSR,
    queuePreviewProps,
    playerPreloadProps,
    isAddModalVisible,
    showShare,
    showSettings,
    focusAdminLogin,
    showDeviceSelector,
    adminPassword,
    setAdminPassword,
    isGenerating,
    generationError,
    displayRoom,
    shareUrl,
    isAuthenticating,
    adminError,
    showGenerationProgress,
    isPartyScreen,
    chatOpen,
    handleCloseAddPlaylistItem,
    handleCloseCast,
    handleOpenPartyScreen,
    handleExitPartyScreen,
    handleToggleSettings,
    handleOpenAdminLogin,
    handleCloseSettings,
    handleGenerationStarted,
    handleShareRoom,
    handleJoinAdmin,
    handleLeave,
    roomEntryInitial,
  };
}
