import type { Providers, Room, RoomSettings, RoomUpdate } from '@vibes/models';
import { classNames, useRoomStore } from '@vibes/shared';
import {
  TerminalButton,
  TerminalLoading,
  TerminalToolbar,
  useTerminalShortcuts,
} from '@vibes/ui/konami';
import {
  ArrowLeftIcon,
  Button,
  CastIcon,
  CircleHalfIcon,
  MoonIcon,
  SettingsIcon,
  ShareIcon,
  SunIcon,
  Tooltip,
} from '@vibes/ui/web';
import { AnimatePresence, motion } from 'framer-motion';
import React, {
  lazy,
  type RefObject,
  Suspense,
  useCallback,
  useEffect,
} from 'react';
import { useFetcher } from 'react-router';
import {
  RemoteControlButton,
  useRemoteControl,
} from '../../../components/remote/RemoteControlProvider';
import type { Theme } from '../../../stores/themeStore';
import type { RoomActionData } from '../action';
import { UserCount } from './UserCount';

const LazyRoomSettingsMenu = lazy(async () => {
  const module = await import('./RoomSettingsMenu');
  return { default: module.RoomSettingsMenu };
});

const LazyRoomSharePanel = lazy(async () => {
  const module = await import('./RoomSharePanel');
  return { default: module.RoomSharePanel };
});

const LazyTerminalRoomSettings = lazy(async () => {
  const module = await import('./TerminalRoomSettings');
  return { default: module.TerminalRoomSettings };
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
  displayRoom: Room | null;
  roomId: string;
  showShare: boolean;
  onToggleShare: () => void;
  shareButtonRef: RefObject<HTMLButtonElement | null>;
  sharePanelRef: RefObject<HTMLDivElement | null>;
  shareUrl: string;
  onShareRoom: () => void;
  onOpenPartyScreen: () => void;
  onOpenCast: () => void;
  isCasting: boolean;
  castDeviceName?: string | null;
  themeId: string;
  currentTheme: Theme;
  onToggleDarkMode: () => void;
  showSettings: boolean;
  onToggleSettings: () => void;
  onCloseSettings: () => void;
  settingsButtonRef: RefObject<HTMLButtonElement | null>;
  settingsMenuRef: RefObject<HTMLDivElement | null>;
  adminPassword: string;
  onAdminPasswordChange: (value: string) => void;
  onJoinAdmin: () => void;
  isAuthenticating: boolean;
  onLeave: () => void;
  providers: Providers;
  terminalMode?: boolean;
}

export const RoomHeader = React.memo(
  ({
    headerRef,
    displayRoom,
    roomId,
    showShare,
    onToggleShare,
    shareButtonRef,
    sharePanelRef,
    shareUrl,
    onShareRoom,
    onOpenPartyScreen,
    onOpenCast,
    isCasting,
    castDeviceName,
    themeId,
    currentTheme,
    onToggleDarkMode,
    showSettings,
    onToggleSettings,
    onCloseSettings,
    settingsButtonRef,
    settingsMenuRef,
    adminPassword,
    onAdminPasswordChange,
    onJoinAdmin,
    isAuthenticating,
    onLeave,
    providers,
    terminalMode = false,
  }: RoomHeaderProps) => {
    const settingsFetcher = useFetcher<RoomActionData>();
    const isAdmin = useRoomStore((state) => state.isAdmin);
    const setRoom = useRoomStore((state) => state.setRoom);
    const { openRemoteControl } = useRemoteControl();

    const updateRoom = useCallback(
      (room: RoomUpdate) => {
        settingsFetcher.submit(
          { intent: 'updateRoom', room },
          { encType: 'application/json', method: 'post' },
        );
      },
      [settingsFetcher],
    );

    const updateRoomSettings = useCallback(
      (settings: RoomSettings) => {
        updateRoom({ settings });
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

    useTerminalShortcuts(
      [
        { key: 'Escape', onTrigger: onLeave },
        { key: 'F10', onTrigger: onToggleSettings },
      ],
      { enabled: terminalMode },
    );

    if (terminalMode) {
      return (
        <div ref={headerRef} className="relative z-30 mb-4">
          <TerminalToolbar
            actions={
              <>
                <TerminalButton onClick={onShareRoom}>[SHARE]</TerminalButton>
                <RemoteControlButton terminalMode showLabel />
                <TerminalButton
                  aria-keyshortcuts="F10"
                  onClick={onToggleSettings}
                >
                  [F10] {showSettings ? 'CLOSE' : 'CONFIG'}
                </TerminalButton>
              </>
            }
            description={`MODE ${displayRoom?.mode || 'UNKNOWN'} / CHANNEL ${roomId}`}
            leading={
              <TerminalButton aria-keyshortcuts="Escape" onClick={onLeave}>
                [ESC] LEAVE
              </TerminalButton>
            }
            title={`ROOM / ${displayRoom?.name || 'LOADING'}`}
          />
          {showSettings && (
            <Suspense
              fallback={<TerminalLoading label="Loading config.sys" overlay />}
            >
              <LazyTerminalRoomSettings
                adminPassword={adminPassword}
                currentTheme={currentTheme}
                displayRoom={displayRoom}
                isAdmin={isAdmin}
                isAuthenticating={isAuthenticating}
                onAdminPasswordChange={onAdminPasswordChange}
                onClose={onCloseSettings}
                onJoinAdmin={onJoinAdmin}
                onOpenRemoteControl={openRemoteControl}
                onShareRoom={onShareRoom}
                onToggleDarkMode={onToggleDarkMode}
                providers={providers}
                room={displayRoom}
                settingsMenuRef={settingsMenuRef}
                updateRoom={updateRoom}
                updateRoomSettings={updateRoomSettings}
              />
            </Suspense>
          )}
        </div>
      );
    }

    return (
      <div
        ref={headerRef}
        className="panel-surface sticky top-0 z-20 border-theme border-b px-4 py-3 sm:py-4"
      >
        <div className="mx-auto max-w-7xl">
          <div className="relative flex items-center">
            <Button className="shrink-0" onClick={onLeave} variant="ghost">
              <ArrowLeftIcon className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
              <span className="text-2xs tracking-label">Leave</span>
            </Button>

            <div className="pointer-events-none absolute left-1/2 w-1/2 min-w-0 -translate-x-1/2 text-center sm:pointer-events-auto sm:static sm:w-auto sm:flex-1 sm:translate-x-0 sm:px-4">
              <h1
                className="block w-full truncate whitespace-nowrap text-theme text-xs sm:text-sm"
                title={displayRoom?.name}
              >
                {displayRoom?.name || 'Loading...'}
              </h1>
            </div>

            <div className="ml-auto flex shrink-0 items-center gap-2">
              <div className="hidden sm:block">
                <UserCount
                  initialCount={displayRoom?.userCount ?? 0}
                  roomId={roomId}
                />
              </div>

              <div className="hidden sm:block">
                <Tooltip
                  className="inline-flex"
                  content={`Theme: ${currentTheme.name}`}
                  side="bottom"
                >
                  <Button
                    onClick={onToggleDarkMode}
                    variant={themeId === 'auto' ? 'tertiary' : 'secondary'}
                    size="icon"
                    aria-label={`Theme: ${currentTheme.name}`}
                  >
                    {themeId === 'light' && <SunIcon className="h-5 w-5" />}
                    {themeId === 'dark' && <MoonIcon className="h-5 w-5" />}
                    {themeId === 'auto' && (
                      <CircleHalfIcon className="h-5 w-5" />
                    )}
                  </Button>
                </Tooltip>
              </div>

              <div className="relative hidden sm:block">
                <Tooltip
                  className="inline-flex"
                  content="Share Room"
                  side="bottom"
                >
                  <Button
                    ref={shareButtonRef}
                    onClick={onToggleShare}
                    variant={showShare ? 'tertiary-active' : 'tertiary'}
                    size="icon"
                    aria-label="Share Room"
                  >
                    <ShareIcon className="h-5 w-5" />
                  </Button>
                </Tooltip>

                <AnimatePresence>
                  {showShare && (
                    <motion.div
                      key="share-panel"
                      ref={sharePanelRef}
                      initial={{ opacity: 0, scale: 0.92, y: -8 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.96, y: -6 }}
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
                          onShare={onShareRoom}
                          onOpenPartyScreen={onOpenPartyScreen}
                        />
                      </Suspense>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="hidden sm:block">
                <RemoteControlButton />
              </div>

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
                  <Button
                    onClick={onOpenCast}
                    variant={isCasting ? 'secondary' : 'tertiary'}
                    size="icon"
                    aria-label={
                      isCasting && castDeviceName
                        ? `Casting to ${castDeviceName}`
                        : 'Cast'
                    }
                  >
                    <CastIcon
                      className={classNames(
                        'h-5 w-5 transition-colors',
                        isCasting && 'text-primary',
                        !isCasting &&
                          'text-theme-muted group-hover:text-primary',
                      )}
                      showDot={isCasting}
                    />
                  </Button>
                </Tooltip>
              </div>

              <div className="relative sm:ml-1">
                <Tooltip
                  className="inline-flex"
                  content="Room Settings"
                  side="bottom"
                >
                  <Button
                    ref={settingsButtonRef}
                    onClick={onToggleSettings}
                    variant={showSettings ? 'tertiary-active' : 'tertiary'}
                    size="icon"
                    aria-label="Room Settings"
                  >
                    <SettingsIcon className="h-5 w-5" />
                  </Button>
                </Tooltip>

                {showSettings && (
                  <Suspense fallback={<DeferredSettingsLoading />}>
                    <LazyRoomSettingsMenu
                      showSettings={showSettings}
                      onClose={onCloseSettings}
                      themeId={themeId}
                      currentTheme={currentTheme}
                      onToggleDarkMode={onToggleDarkMode}
                      onShareRoom={onShareRoom}
                      room={displayRoom}
                      displayRoom={displayRoom}
                      isAdmin={isAdmin}
                      updateRoomSettings={updateRoomSettings}
                      updateRoom={updateRoom}
                      adminPassword={adminPassword}
                      onAdminPasswordChange={onAdminPasswordChange}
                      onJoinAdmin={onJoinAdmin}
                      isAuthenticating={isAuthenticating}
                      settingsMenuRef={settingsMenuRef}
                      providers={providers}
                    />
                  </Suspense>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },
);
