import { useFetcher } from '@kasperrt/smolter/preact';
import type {
  Providers,
  RoomSettingsV2,
  RoomUpdateV2,
  RoomV2,
} from '@vibes/models';
import { useRoomStore } from '@vibes/shared';
import {
  ArrowLeftIcon,
  CastIcon,
  IconButton,
  IconLinkButton,
  SettingsIcon,
  ShareIcon,
  Tooltip,
} from '@vibes/ui/web';
import { AnimatePresence, m as motion } from 'framer-motion';
import React, {
  lazy,
  type RefObject,
  Suspense,
  useCallback,
  useEffect,
} from 'preact/compat';
import { RemoteControlButton } from '../../../components/remote/RemoteControlProvider';
import { useRoomPanel } from '../hooks/useRoomPanel';
import type { RoomActionData } from '../utils/actions/clientAction';

const LazyRoomSettingsMenu = lazy(async () => {
  const module = await import('./RoomSettingsMenu');

  return {
    default: module.RoomSettingsMenu,
  };
});

const LazyRoomSharePanel = lazy(async () => {
  const module = await import('./RoomSharePanel');

  return {
    default: module.RoomSharePanel,
  };
});

interface DeferredHeaderLoadingProps {
  label: string;
}

function DeferredHeaderLoading({ label }: DeferredHeaderLoadingProps) {
  return (
    <div
      className="flex min-h-24 items-center justify-center gap-3 text-theme"
      role="status"
    >
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-theme border-t-primary" />
      <span className="font-pixel text-2xs text-theme-muted">{label}</span>
    </div>
  );
}

function DeferredSettingsLoading() {
  return (
    <div className="fixed top-(--room-header-height) right-0 bottom-0 left-0 z-40 sm:contents">
      <div className="fixed top-(--room-header-height) right-0 left-0 h-[calc(100dvh-var(--room-header-height))] w-full border-theme border-t bg-theme-surface shadow-2xl sm:absolute sm:top-full sm:right-0 sm:left-auto sm:mt-3 sm:h-auto sm:min-h-40 sm:w-72 sm:rounded-3xl sm:border">
        <DeferredHeaderLoading label="Loading settings..." />
      </div>
    </div>
  );
}

interface RoomHeaderProps {
  headerRef: RefObject<HTMLDivElement | null>;
  displayRoom: RoomV2 | null;
  roomId: string;
  showShare: boolean;
  shareButtonRef: RefObject<HTMLAnchorElement | null>;
  sharePanelRef: RefObject<HTMLDivElement | null>;
  shareUrl: string;
  onShareRoom: () => void;
  onOpenPartyScreen: () => void;
  showCast: boolean;
  isCasting: boolean;
  castDeviceName?: string | null;
  showSettings: boolean;
  onToggleSettings: () => void;
  onCloseSettings: () => void;
  settingsButtonRef: RefObject<HTMLAnchorElement | null>;
  settingsMenuRef: RefObject<HTMLDivElement | null>;
  adminError: string | null;
  adminPassword: string;
  focusAdminLogin: boolean;
  onAdminPasswordChange: (value: string) => void;
  onJoinAdmin: () => void;
  isAuthenticating: boolean;
  onLeave: () => void;
  providers: Providers;
}

export const RoomHeader = React.memo(
  ({
    headerRef,
    displayRoom,
    roomId,
    showShare,
    shareButtonRef,
    sharePanelRef,
    shareUrl,
    onShareRoom,
    onOpenPartyScreen,
    showCast,
    isCasting,
    castDeviceName,
    showSettings,
    onToggleSettings,
    onCloseSettings,
    settingsButtonRef,
    settingsMenuRef,
    adminError,
    adminPassword,
    focusAdminLogin,
    onAdminPasswordChange,
    onJoinAdmin,
    isAuthenticating,
    onLeave,
    providers,
  }: RoomHeaderProps) => {
    const { href } = useRoomPanel();
    const settingsFetcher = useFetcher<RoomActionData>();
    const isAdmin = useRoomStore((state) => state.isAdmin);
    const setRoom = useRoomStore((state) => state.setRoom);

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
        document.documentElement.style.removeProperty('--room-header-height');
      };
    }, [headerRef]);

    const updateRoom = useCallback(
      (room: RoomUpdateV2) => {
        settingsFetcher.submit(
          {
            intent: 'updateRoom',
            room,
          },
          {
            encType: 'application/json',
            method: 'post',
          },
        );
      },
      [settingsFetcher],
    );

    const updateRoomSettings = useCallback(
      (settings: RoomSettingsV2) => {
        updateRoom({
          settings,
        });
      },
      [updateRoom],
    );

    useEffect(() => {
      if (
        settingsFetcher.state === 'idle' &&
        settingsFetcher.data?.intent === 'updateRoom' &&
        settingsFetcher.data.room
      ) {
        setRoom(settingsFetcher.data.room);
      }
    }, [setRoom, settingsFetcher.data, settingsFetcher.state]);

    return (
      <div
        ref={headerRef}
        className="sticky top-0 z-20 mx-auto w-full max-w-7xl shrink-0 px-2 py-2 sm:px-4 sm:py-3"
      >
        <div className="w-full rounded-full border border-theme bg-theme-surface p-1 shadow-lg">
          <div className="relative grid min-w-0 grid-cols-[1fr_minmax(0,1fr)_1fr] items-center gap-1">
            <IconButton
              className="group justify-self-start"
              onClick={onLeave}
              variant="ghost"
              aria-label="Leave room"
              title="Leave room"
            >
              <ArrowLeftIcon className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
            </IconButton>

            <div className="min-w-0 px-1 text-center">
              <h1
                className="block w-full truncate whitespace-nowrap text-theme text-xs sm:text-sm"
                title={displayRoom?.name}
              >
                {displayRoom?.name || 'Loading...'}
              </h1>
            </div>

            <div className="flex shrink-0 items-center gap-1 justify-self-end">
              <div className="relative hidden sm:block">
                <Tooltip
                  className="inline-flex"
                  content="Share Room"
                  side="bottom"
                >
                  <IconLinkButton
                    ref={shareButtonRef}
                    to={href(showShare ? '' : 'share')}
                    replace
                    preventScrollReset
                    viewTransition={false}
                    prefetch="intent"
                    prefetchData
                    variant={showShare ? 'tertiary-active' : 'ghost'}
                    aria-expanded={showShare}
                    aria-label="Share Room"
                  >
                    <ShareIcon className="h-5 w-5" />
                  </IconLinkButton>
                </Tooltip>

                <AnimatePresence initial={false}>
                  {showShare && (
                    <motion.div
                      key="share-panel"
                      ref={sharePanelRef}
                      initial={{
                        opacity: 0,
                        scale: 0.92,
                        y: -8,
                      }}
                      animate={{
                        opacity: 1,
                        scale: 1,
                        y: 0,
                      }}
                      exit={{
                        opacity: 0,
                        scale: 0.96,
                        y: -6,
                      }}
                      transition={{
                        type: 'spring',
                        stiffness: 450,
                        damping: 32,
                      }}
                      className="panel-strong absolute right-0 z-50 mt-3 w-96 origin-top-right rounded-3xl p-4 shadow-2xl"
                    >
                      <Suspense
                        fallback={
                          <DeferredHeaderLoading label="Loading sharing..." />
                        }
                      >
                        <LazyRoomSharePanel
                          url={shareUrl}
                          roomId={roomId || ''}
                          roomType={displayRoom?.roomType ?? 'MUSIC'}
                          onShare={onShareRoom}
                          onOpenPartyScreen={onOpenPartyScreen}
                        />
                      </Suspense>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="hidden sm:block">
                <RemoteControlButton variant="ghost" />
              </div>

              {showCast && (
                <div className="sm:hidden">
                  <Tooltip
                    className="inline-flex"
                    content={
                      isCasting && castDeviceName
                        ? `Casting to ${castDeviceName}`
                        : 'Cast'
                    }
                    side="bottom"
                  >
                    <IconLinkButton
                      to={href('cast')}
                      replace
                      preventScrollReset
                      viewTransition={false}
                      prefetch="intent"
                      prefetchData
                      variant={isCasting ? 'tertiary-active' : 'ghost'}
                      aria-label={
                        isCasting && castDeviceName
                          ? `Casting to ${castDeviceName}`
                          : 'Cast'
                      }
                    >
                      <CastIcon
                        className="h-5 w-5 transition-colors"
                        showDot={isCasting}
                      />
                    </IconLinkButton>
                  </Tooltip>
                </div>
              )}

              <div className="relative">
                <Tooltip
                  className="inline-flex"
                  content="Room Settings"
                  side="bottom"
                >
                  <IconLinkButton
                    ref={settingsButtonRef}
                    to={href(showSettings ? '' : 'settings')}
                    replace
                    preventScrollReset
                    viewTransition={false}
                    prefetch="intent"
                    prefetchData
                    onClick={onToggleSettings}
                    variant={showSettings ? 'tertiary-active' : 'ghost'}
                    aria-expanded={showSettings}
                    aria-label="Room Settings"
                  >
                    <SettingsIcon className="h-5 w-5" />
                  </IconLinkButton>
                </Tooltip>

                <AnimatePresence initial={false}>
                  {showSettings && (
                    <Suspense fallback={<DeferredSettingsLoading />}>
                      <LazyRoomSettingsMenu
                        adminError={adminError}
                        showSettings={showSettings}
                        onClose={onCloseSettings}
                        onShareRoom={onShareRoom}
                        room={displayRoom}
                        displayRoom={displayRoom}
                        isAdmin={isAdmin}
                        updateRoomSettings={updateRoomSettings}
                        updateRoom={updateRoom}
                        adminPassword={adminPassword}
                        focusAdminLogin={focusAdminLogin}
                        onAdminPasswordChange={onAdminPasswordChange}
                        onJoinAdmin={onJoinAdmin}
                        isAuthenticating={isAuthenticating}
                        settingsMenuRef={settingsMenuRef}
                        providers={providers}
                      />
                    </Suspense>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },
);
