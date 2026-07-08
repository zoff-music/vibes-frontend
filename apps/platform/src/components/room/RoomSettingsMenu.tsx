import type { Room, RoomSettings, RoomUpdate } from '@vibes/models';
import {
  Button,
  CircleHalfIcon,
  MoonIcon,
  ShareIcon,
  SoundCloudIcon,
  SpotifyIcon,
  SunIcon,
  Toggle,
  YouTubeIcon,
} from '@vibes/ui';
import { AnimatePresence, motion } from 'framer-motion';
import { type RefObject, useEffect, useRef, useState } from 'react';
import type { Theme } from '../../stores/themeStore';
import { RoomSharePanel } from './RoomSharePanel';

interface RoomSettingsMenuProps {
  showSettings: boolean;
  onClose: () => void;
  showShare: boolean;
  onToggleShare: () => void;
  themeId: string;
  currentTheme: Theme;
  onToggleDarkMode: () => void;
  room: Room | null;
  displayRoom: Room | null;
  isAdmin: boolean;
  updateRoomSettings: (settings: RoomSettings) => void;
  updateRoom: (data: RoomUpdate) => Promise<Room | null> | null;
  adminPassword: string;
  onAdminPasswordChange: (value: string) => void;
  onJoinAdmin: () => void;
  isAuthenticating: boolean;
  shareUrl: string;
  onCopyShareLink: () => void;
  roomId?: string;
  settingsMenuRef?: RefObject<HTMLDivElement | null>;
}

export const RoomSettingsMenu = ({
  showSettings,
  onClose,
  showShare,
  onToggleShare,
  themeId,
  currentTheme,
  onToggleDarkMode,
  room,
  displayRoom,
  isAdmin,
  updateRoomSettings,
  updateRoom,
  adminPassword,
  onAdminPasswordChange,
  onJoinAdmin,
  isAuthenticating,
  shareUrl,
  onCopyShareLink,
  roomId,
  settingsMenuRef,
}: RoomSettingsMenuProps) => {
  const [wobblePassword, setWobblePassword] = useState(false);
  const adminSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (wobblePassword) {
      const timer = setTimeout(() => setWobblePassword(false), 500);
      return () => clearTimeout(timer);
    }
  }, [wobblePassword]);

  // Auto-disable "Only Admin Add" if password input is cleared (only for rooms without password)
  useEffect(() => {
    if (
      !room?.hasPassword &&
      !adminPassword &&
      room?.settings.onlyAdminAddSongs
    ) {
      updateRoomSettings({
        ...room.settings,
        onlyAdminAddSongs: false,
      });
    }
  }, [
    adminPassword,
    room?.hasPassword,
    room?.settings.onlyAdminAddSongs,
    room,
    updateRoomSettings,
  ]);

  useEffect(() => {
    if (!showSettings) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [showSettings]);

  return (
    <AnimatePresence>
      {showSettings && (
        <div className="fixed top-[var(--room-header-height)] right-0 bottom-0 left-0 z-40">
          <Button
            type="button"
            variant="settings-backdrop"
            onClick={onClose}
            aria-label="Close settings"
          />
          <motion.div
            ref={settingsMenuRef}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="fixed top-[var(--room-header-height)] right-0 left-0 z-10 h-[calc(100dvh-var(--room-header-height))] w-full overflow-y-auto overscroll-contain border-theme border-t bg-theme-surface p-5 text-theme shadow-2xl sm:absolute sm:top-auto sm:right-0 sm:left-auto sm:mt-3 sm:max-h-[70vh] sm:w-72 sm:overflow-y-auto sm:rounded-3xl sm:border"
          >
            <div className="space-y-4">
              <div className="space-y-3 sm:hidden">
                <div className="flex items-center gap-3">
                  <Button
                    onClick={onToggleShare}
                    variant={showShare ? 'menu-toggle-active' : 'menu-toggle'}
                    title="Share Room"
                  >
                    <ShareIcon className="h-4 w-4" />
                    Share
                  </Button>

                  <Button
                    onClick={onToggleDarkMode}
                    variant={
                      themeId !== 'light' ? 'menu-theme-active' : 'menu-toggle'
                    }
                    title={`Theme: ${currentTheme.name}`}
                  >
                    <div className="flex h-4 w-4 items-center justify-center">
                      {themeId === 'light' && <SunIcon className="h-4 w-4" />}
                      {themeId === 'dark' && <MoonIcon className="h-4 w-4" />}
                      {themeId === 'auto' && (
                        <CircleHalfIcon className="h-4 w-4" />
                      )}
                    </div>
                    {currentTheme.name}
                  </Button>
                </div>

                {showShare && (
                  <div className="rounded-2xl border border-theme bg-theme-surface p-4">
                    <RoomSharePanel
                      url={shareUrl}
                      roomId={roomId || ''}
                      onCopy={onCopyShareLink}
                    />
                  </div>
                )}
              </div>

              <h4 className="border-theme border-b pb-2 font-pixel text-[10px] text-theme-muted tracking-[0.3em]">
                Room Control
              </h4>

              {room?.mode === 'host' && (
                <div className="rounded-lg border border-secondary/30 bg-secondary/10 p-3">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-secondary"></div>
                    <span className="font-pixel text-secondary text-sm">
                      Host Mode Active
                    </span>
                  </div>
                  <p className="mt-1 text-theme-muted text-xs">
                    In host mode, only the host can skip songs. Skip settings
                    are disabled.
                  </p>
                </div>
              )}

              <div className="group flex items-center justify-between">
                <Toggle
                  label="Allow Skip"
                  description={
                    room?.mode === 'host'
                      ? 'Host controls skipping'
                      : 'Anyone can skip'
                  }
                  disabled={
                    (room?.hasPassword && !isAdmin) || room?.mode === 'host'
                  }
                  checked={room?.settings.skipAllowed ?? false}
                  onChange={(checked) =>
                    room &&
                    updateRoomSettings({
                      ...room.settings,
                      skipAllowed: checked,
                    })
                  }
                  variant="plain-full"
                />
              </div>

              <div className="group flex items-center justify-between">
                <Toggle
                  label="Democratic Skip"
                  description={
                    room?.mode === 'host'
                      ? 'Host decides skipping'
                      : 'Require votes'
                  }
                  disabled={
                    (room?.hasPassword && !isAdmin) || room?.mode === 'host'
                  }
                  checked={room?.settings.democraticSkip ?? false}
                  onChange={(checked) =>
                    room &&
                    updateRoomSettings({
                      ...room.settings,
                      democraticSkip: checked,
                    })
                  }
                  variant="plain-full"
                />
              </div>

              <div className="group flex items-center justify-between">
                <Toggle
                  label="Loop Queue"
                  description="Cycled back to end"
                  disabled={room?.hasPassword && !isAdmin}
                  checked={room?.settings.loopQueue ?? false}
                  onChange={(checked) =>
                    room &&
                    updateRoomSettings({
                      ...room.settings,
                      loopQueue: checked,
                    })
                  }
                  variant="plain-full"
                />
              </div>

              <div className="group flex items-center justify-between">
                <Toggle
                  label="Allow Duplicates"
                  description="Same song multiple times"
                  disabled={room?.hasPassword && !isAdmin}
                  checked={room?.settings.allowDuplicates ?? false}
                  onChange={(checked) =>
                    room &&
                    updateRoomSettings({
                      ...room.settings,
                      allowDuplicates: checked,
                    })
                  }
                  variant="plain-full"
                />
              </div>

              <div className="group flex items-center justify-between">
                <Toggle
                  label="Remove Played"
                  description="Removed after play"
                  disabled={room?.hasPassword && !isAdmin}
                  checked={room?.settings.removeOnPlay ?? false}
                  onChange={(checked) =>
                    room &&
                    updateRoomSettings({
                      ...room.settings,
                      removeOnPlay: checked,
                    })
                  }
                  variant="plain-full"
                />
              </div>

              <div className="group flex items-center justify-between">
                <Toggle
                  label="Admins Only Add"
                  description="Only admins add songs"
                  disabled={room?.hasPassword && !isAdmin}
                  checked={room?.settings.onlyAdminAddSongs ?? false}
                  onChange={(checked) => {
                    if (
                      room &&
                      checked &&
                      !room.hasPassword &&
                      !adminPassword
                    ) {
                      setWobblePassword(true);
                      adminSectionRef.current?.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center',
                      });
                      return;
                    }

                    room &&
                      updateRoomSettings({
                        ...room.settings,
                        onlyAdminAddSongs: checked,
                      });
                  }}
                  variant="plain-full"
                />
              </div>

              <div className="border-theme border-t pt-4">
                <h5 className="mb-3 font-pixel text-[10px] text-theme-muted tracking-[0.3em]">
                  Sources
                </h5>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    {
                      id: 'youtube',
                      Icon: YouTubeIcon,
                      variant: 'settings-source-youtube-active' as const,
                    },
                    {
                      id: 'spotify',
                      Icon: SpotifyIcon,
                      variant: 'settings-source-spotify-active' as const,
                    },
                    {
                      id: 'soundcloud',
                      Icon: SoundCloudIcon,
                      variant: 'settings-source-soundcloud-active' as const,
                    },
                  ].map(({ id, Icon, variant }) => {
                    const isEnabled =
                      room?.settings.enabledSources.includes(id) ?? true;
                    return (
                      <Button
                        key={id}
                        disabled={room?.hasPassword && !isAdmin}
                        onClick={() => {
                          if (!room) return;
                          const newSources = isEnabled
                            ? room.settings.enabledSources.filter(
                                (s) => s !== id,
                              )
                            : [...room.settings.enabledSources, id];
                          updateRoomSettings({
                            ...room.settings,
                            enabledSources: newSources,
                          });
                        }}
                        variant={
                          isEnabled ? variant : 'settings-source-disabled'
                        }
                        title={`${isEnabled ? 'Disable' : 'Enable'} ${id}`}
                      >
                        <Icon className="h-6 w-6" />
                      </Button>
                    );
                  })}
                </div>
              </div>

              <div className="border-theme border-t pt-4">
                <h5 className="mb-3 font-pixel text-[10px] text-theme-muted tracking-[0.3em]">
                  Room Mode
                </h5>

                <div className="space-y-2">
                  <Button
                    disabled={room?.hasPassword && !isAdmin}
                    onClick={() => room && updateRoom({ mode: 'server' })}
                    variant={
                      room?.mode === 'server'
                        ? 'settings-room-mode-server-active'
                        : 'settings-room-mode-inactive'
                    }
                  >
                    <div className="mb-1 font-pixel text-sm text-theme">
                      Server Mode
                    </div>
                    <div className="text-[10px] text-theme-muted">
                      Auto-play music 24/7. Perfect for radio stations.
                    </div>
                  </Button>

                  <Button
                    disabled={room?.hasPassword && !isAdmin}
                    onClick={() => room && updateRoom({ mode: 'host' })}
                    variant={
                      room?.mode === 'host'
                        ? 'settings-room-mode-host-active'
                        : 'settings-room-mode-inactive'
                    }
                  >
                    <div className="mb-1 font-pixel text-sm text-theme">
                      Host Mode
                    </div>
                    <div className="text-[10px] text-theme-muted">
                      Host controls playback. Great for parties.
                    </div>
                  </Button>
                </div>
              </div>

              {!isAdmin && (
                <div
                  ref={adminSectionRef}
                  className={`group mt-6 flex flex-col gap-2 border-theme border-t pt-4 text-theme transition-all duration-300 ${wobblePassword ? 'rounded-xl border-red-500' : ''}`}
                >
                  <span
                    className={`font-pixel text-sm transition-colors ${wobblePassword ? 'animate-bounce text-red-500' : ''}`}
                  >
                    {wobblePassword ? 'Password required!' : 'Admin Access'}
                  </span>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      value={adminPassword}
                      onChange={(e) => onAdminPasswordChange(e.target.value)}
                      placeholder={
                        displayRoom?.hasPassword
                          ? 'Login as admin'
                          : 'Add password'
                      }
                      className={`flex-1 rounded-xl border bg-theme-surface px-3 py-2 text-sm text-theme outline-none transition-all focus:border-secondary/60 ${wobblePassword ? 'border-red-500 ring-2 ring-red-500/50' : 'border-theme'}`}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') onJoinAdmin();
                      }}
                    />
                    <Button
                      onClick={onJoinAdmin}
                      disabled={isAuthenticating || !adminPassword}
                      variant="settings-admin-go"
                    >
                      {isAuthenticating ? '...' : 'Go'}
                    </Button>
                  </div>
                </div>
              )}

              {isAdmin && (
                <div className="group mt-6 border-theme border-t pt-4 text-center">
                  <span className="text-secondary text-sm">
                    ✓ You are an Admin
                  </span>
                </div>
              )}

              <p className="pt-2 text-center text-[10px] text-theme-muted italic">
                Settings sync enabled
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
