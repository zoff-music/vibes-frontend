import type { Room, RoomSettings, RoomUpdate } from '@vibes/models';
import { useRoomStore } from '@vibes/shared';
import {
  ArrowLeftIcon,
  Button,
  CircleHalfIcon,
  MoonIcon,
  SettingsIcon,
  ShareIcon,
  SunIcon,
  Tooltip,
} from '@vibes/ui';
import React, {
  lazy,
  type RefObject,
  Suspense,
  useCallback,
  useEffect,
} from 'react';
import { useFetcher } from 'react-router';
import type { Theme } from '../../../stores/themeStore';
import type { RoomActionData } from '../action';

import { RoomGenerationMenu } from './RoomGenerationMenu';
import { UserCount } from './UserCount';

const LazyRoomSettingsMenu = lazy(async () => {
  const module = await import('./RoomSettingsMenu');
  return { default: module.RoomSettingsMenu };
});

const LazyRoomSharePanel = lazy(async () => {
  const module = await import('./RoomSharePanel');
  return { default: module.RoomSharePanel };
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
  onCopyShareLink: () => void;
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
  isGenerating: boolean;
  onGenerationStarted: () => void;
  onLeave: () => void;
  songCount: number;
  providers: string[];
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
    onCopyShareLink,
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
    isGenerating,
    onGenerationStarted,
    onLeave,
    songCount,
    providers,
  }: RoomHeaderProps) => {
    const settingsFetcher = useFetcher<RoomActionData>();
    const isAdmin = useRoomStore((state) => state.isAdmin);
    const setRoom = useRoomStore((state) => state.setRoom);

    const handleOpenGeneration = useCallback(() => {
      onCloseSettings();
      if (showShare) {
        onToggleShare();
      }
    }, [onCloseSettings, onToggleShare, showShare]);

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

    return (
      <div
        ref={headerRef}
        className="panel-surface sticky top-0 z-20 border-theme border-b px-4 py-3 sm:py-4"
      >
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center">
            <Button className="shrink-0" onClick={onLeave} variant="ghost">
              <ArrowLeftIcon className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
              <span className="text-2xs tracking-label">Leave</span>
            </Button>

            <div className="min-w-0 flex-1 px-2 text-center sm:px-4">
              <h1
                className="block w-full truncate whitespace-nowrap text-theme text-xs sm:text-sm"
                title={displayRoom?.name}
              >
                {displayRoom?.name || 'Loading...'}
              </h1>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <UserCount />

              <div className="hidden sm:block">
                <Tooltip
                  className="inline-flex"
                  content={`Theme: ${currentTheme.name}`}
                  side="bottom"
                >
                  <Button
                    onClick={onToggleDarkMode}
                    variant={themeId !== 'light' ? 'secondary' : 'tertiary'}
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

                {showShare && (
                  <div
                    ref={sharePanelRef}
                    className="panel-strong absolute right-0 z-50 mt-3 w-96 animate-scale-in rounded-3xl p-4 shadow-2xl"
                  >
                    <Suspense
                      fallback={
                        <DeferredHeaderLoading label="Loading sharing..." />
                      }
                    >
                      <LazyRoomSharePanel
                        url={shareUrl}
                        roomId={roomId || ''}
                        onCopy={onCopyShareLink}
                      />
                    </Suspense>
                  </div>
                )}
              </div>

              <RoomGenerationMenu
                generationCount={displayRoom?.generationCount ?? 0}
                roomGenerationMaxDailyCount={
                  displayRoom?.roomGenerationMaxDailyCount ?? 0
                }
                roomGenerationMaxExistingSongs={
                  displayRoom?.roomGenerationMaxExistingSongs ?? 0
                }
                hasGenerationPermission={
                  displayRoom ? !displayRoom.hasPassword || isAdmin : false
                }
                isGenerating={isGenerating}
                onGenerationStarted={onGenerationStarted}
                onOpen={handleOpenGeneration}
                songCount={songCount}
              />

              <div className="relative ml-1">
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
                      showShare={showShare}
                      onToggleShare={onToggleShare}
                      themeId={themeId}
                      currentTheme={currentTheme}
                      onToggleDarkMode={onToggleDarkMode}
                      room={displayRoom}
                      displayRoom={displayRoom}
                      isAdmin={isAdmin}
                      updateRoomSettings={updateRoomSettings}
                      updateRoom={updateRoom}
                      adminPassword={adminPassword}
                      onAdminPasswordChange={onAdminPasswordChange}
                      onJoinAdmin={onJoinAdmin}
                      isAuthenticating={isAuthenticating}
                      shareUrl={shareUrl}
                      onCopyShareLink={onCopyShareLink}
                      roomId={roomId}
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
