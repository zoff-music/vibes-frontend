import {
  isSourceType,
  type Providers,
  type Room,
  type RoomSettings,
  type RoomUpdate,
  type SourceType,
} from '@vibes/models';
import { classNames } from '@vibes/shared';
import {
  Button,
  ChevronDownIcon,
  CircleHalfIcon,
  MoonIcon,
  RemoteIcon,
  ShareIcon,
  SoundCloudIcon,
  SpotifyIcon,
  SunIcon,
  Toggle,
  YouTubeIcon,
} from '@vibes/ui/web';
import { motion } from 'framer-motion';
import {
  type ComponentType,
  type MouseEvent,
  type RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useRemoteControl } from '../../../components/remote/RemoteControlProvider';
import type { Theme } from '../../../stores/themeStore';

interface RoomSettingsMenuProps {
  adminError: string | null;
  showSettings: boolean;
  onClose: () => void;
  themeId: string;
  currentTheme: Theme;
  onToggleDarkMode: () => void;
  onShareRoom: () => void;
  room: Room | null;
  displayRoom: Room | null;
  isAdmin: boolean;
  updateRoomSettings: (settings: RoomSettings) => void;
  updateRoom: (data: RoomUpdate) => void;
  adminPassword: string;
  onAdminPasswordChange: (value: string) => void;
  onJoinAdmin: () => void;
  isAuthenticating: boolean;
  settingsMenuRef?: RefObject<HTMLDivElement | null>;
  providers: Providers;
}

export const RoomSettingsMenu = ({
  adminError,
  showSettings,
  onClose,
  themeId,
  currentTheme,
  onToggleDarkMode,
  onShareRoom,
  room,
  displayRoom,
  isAdmin,
  updateRoomSettings,
  updateRoom,
  adminPassword,
  onAdminPasswordChange,
  onJoinAdmin,
  isAuthenticating,
  settingsMenuRef,
  providers,
}: RoomSettingsMenuProps) => {
  const { openRemoteControl } = useRemoteControl();
  const [wobblePassword, setWobblePassword] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);
  const adminSectionRef = useRef<HTMLDivElement>(null);
  const scrollPanelRef = useRef<HTMLDivElement>(null);
  const canChangePublicRoom = Boolean(room?.hasPassword && isAdmin);

  let publicRoomDescription = 'Listed only while listeners are active';
  if (!room?.hasPassword) {
    publicRoomDescription = 'Add a password before making this room public';
  } else if (!isAdmin) {
    publicRoomDescription = 'Admin access is required to change visibility';
  }

  const handleSourceToggle = (event: MouseEvent<HTMLButtonElement>) => {
    if (!room) {
      return;
    }

    const source = event.currentTarget.value;
    if (!isSourceType(source)) {
      return;
    }
    const isEnabled = room.settings.enabledSources.includes(source);
    const enabledSources = isEnabled
      ? room.settings.enabledSources.filter(
          (enabledSource) => enabledSource !== source,
        )
      : [...room.settings.enabledSources, source];
    updateRoomSettings({
      ...room.settings,
      enabledSources,
    });
  };

  const handlePublicRoomChange = (checked: boolean) => {
    if (!room) {
      return;
    }

    updateRoomSettings({
      ...room.settings,
      public: checked,
    });
  };

  const handleShareRoom = () => {
    onClose();
    onShareRoom();
  };

  const handleOpenRemoteControl = () => {
    onClose();
    openRemoteControl();
  };

  const updateScrollCue = useCallback(() => {
    const panel = scrollPanelRef.current;
    if (!panel) return;

    const remainingScroll =
      panel.scrollHeight - panel.scrollTop - panel.clientHeight;
    setCanScrollDown(remainingScroll > 8);
  }, []);

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

    const scrollPosition = window.scrollY;
    const previousOverflow = document.body.style.overflow;
    const previousPosition = document.body.style.position;
    const previousTop = document.body.style.top;
    const previousWidth = document.body.style.width;

    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollPosition}px`;
    document.body.style.width = '100%';

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.position = previousPosition;
      document.body.style.top = previousTop;
      document.body.style.width = previousWidth;
      window.scrollTo(0, scrollPosition);
    };
  }, [showSettings]);

  useEffect(() => {
    if (!showSettings) return;

    const panel = scrollPanelRef.current;
    if (!panel) return;

    const animationFrame = requestAnimationFrame(updateScrollCue);
    const resizeObserver = new ResizeObserver(updateScrollCue);
    resizeObserver.observe(panel);

    if (panel.firstElementChild) {
      resizeObserver.observe(panel.firstElementChild);
    }

    const visualViewport = window.visualViewport;
    const handleViewportResize = () => {
      const activeElement = document.activeElement;
      if (
        activeElement instanceof HTMLElement &&
        panel.contains(activeElement)
      ) {
        activeElement.scrollIntoView({
          block: 'center',
        });
      }
      updateScrollCue();
    };
    visualViewport?.addEventListener('resize', handleViewportResize);

    return () => {
      cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      visualViewport?.removeEventListener('resize', handleViewportResize);
    };
  }, [showSettings, updateScrollCue]);

  if (!showSettings) {
    return null;
  }

  return (
    <div className="fixed top-(--room-header-height) right-0 bottom-0 left-0 z-40 sm:contents">
      <Button
        type="button"
        variant="ghost"
        size="none"
        className="absolute inset-0 h-full w-full sm:hidden"
        onClick={onClose}
        aria-label="Close settings"
      />
      <motion.div
        ref={settingsMenuRef}
        initial={{ opacity: 0, scale: 0.96, y: -8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 440, damping: 34 }}
        className="fixed top-(--room-header-height) right-0 left-0 z-10 h-[calc(100dvh-var(--room-header-height))] w-full origin-top-right overflow-hidden border-theme border-t bg-theme-surface text-theme shadow-2xl sm:absolute sm:top-full sm:right-0 sm:left-auto sm:mt-3 sm:h-auto sm:max-h-settings-max sm:w-80 sm:rounded-3xl sm:border lg:w-96"
      >
        <div
          ref={scrollPanelRef}
          onScroll={updateScrollCue}
          className="h-full overflow-y-scroll overscroll-contain p-5 sm:max-h-settings-max"
        >
          <div className="space-y-4">
            <div className="space-y-3 sm:hidden">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={handleShareRoom}
                  variant="tertiary"
                  className="w-full gap-2 font-pixel text-xs"
                >
                  <ShareIcon className="h-4 w-4" />
                  Share room
                </Button>
                <Button
                  onClick={handleOpenRemoteControl}
                  variant="tertiary"
                  className="w-full gap-2 font-pixel text-xs"
                >
                  <RemoteIcon className="h-4 w-4" />
                  Remote control
                </Button>
              </div>
              <div className="flex items-center">
                <Button
                  onClick={onToggleDarkMode}
                  variant={themeId === 'auto' ? 'tertiary' : 'secondary'}
                  className="w-full gap-2 font-pixel text-xs"
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
            </div>

            <h4 className="border-theme border-b pb-2 font-pixel text-2xs text-theme-muted tracking-label">
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
                  In host mode, only the host can skip songs. Skip settings are
                  disabled.
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
                  if (room && checked && !room.hasPassword && !adminPassword) {
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

            <div className="rounded-xl border border-secondary/25 bg-secondary/5 p-3">
              <Toggle
                label="Public Room"
                description={publicRoomDescription}
                disabled={!canChangePublicRoom}
                checked={room?.settings.public ?? false}
                onChange={handlePublicRoomChange}
                variant="plain-full"
              />
              {room?.settings.public && (
                <p className="mt-2 text-3xs text-theme-subtle">
                  This room can appear under Live now while someone is
                  listening.
                </p>
              )}
            </div>

            <div className="border-theme border-t pt-4">
              <h5 className="mb-3 font-pixel text-2xs text-theme-muted tracking-label">
                Sources
              </h5>
              <div
                className={classNames(
                  'grid gap-2',
                  providers.length === 1 && 'grid-cols-1',
                  providers.length === 2 && 'grid-cols-2',
                  providers.length >= 3 && 'grid-cols-3',
                )}
              >
                {providerOptions
                  .filter(({ id }) => providers.includes(id))
                  .map(({ id, Icon, variant }) => {
                    const isEnabled =
                      room?.settings.enabledSources.includes(id) ?? true;
                    return (
                      <Button
                        key={id}
                        value={id}
                        disabled={room?.hasPassword && !isAdmin}
                        onClick={handleSourceToggle}
                        variant={isEnabled ? variant : 'tertiary'}
                        aria-pressed={isEnabled}
                        className="w-full py-3"
                        title={`${isEnabled ? 'Disable' : 'Enable'} ${id}`}
                      >
                        <Icon className="h-6 w-6" />
                      </Button>
                    );
                  })}
              </div>
            </div>

            <div className="border-theme border-t pt-4">
              <h5 className="mb-3 font-pixel text-2xs text-theme-muted tracking-label">
                Room Mode
              </h5>

              <div className="space-y-2">
                <Button
                  disabled={room?.hasPassword && !isAdmin}
                  onClick={() => room && updateRoom({ mode: 'server' })}
                  className="min-h-22 w-full flex-col items-start gap-1 px-4 py-3 text-left"
                  variant={room?.mode === 'server' ? 'cyan' : 'tertiary'}
                  aria-pressed={room?.mode === 'server'}
                >
                  <div className="w-full text-left font-pixel text-current text-sm leading-snug">
                    Server Mode
                  </div>
                  <div className="w-full text-left text-caption text-current leading-relaxed opacity-75">
                    Auto-play music 24/7. Perfect for radio stations.
                  </div>
                </Button>

                <Button
                  disabled={room?.hasPassword && !isAdmin}
                  onClick={() => room && updateRoom({ mode: 'host' })}
                  className="min-h-22 w-full flex-col items-start gap-1 px-4 py-3 text-left"
                  variant={room?.mode === 'host' ? 'magenta' : 'tertiary'}
                  aria-pressed={room?.mode === 'host'}
                >
                  <div className="w-full text-left font-pixel text-current text-sm leading-snug">
                    Host Mode
                  </div>
                  <div className="w-full text-left text-caption text-current leading-relaxed opacity-75">
                    Host controls playback. Great for parties.
                  </div>
                </Button>
              </div>
            </div>

            {!isAdmin && (
              <div
                ref={adminSectionRef}
                className={classNames(
                  'group mt-6 flex flex-col gap-2 border-theme border-t pt-4 text-theme transition-all duration-300',
                  wobblePassword && 'rounded-xl border-red-500',
                )}
              >
                <span
                  className={classNames(
                    'font-pixel text-sm transition-colors',
                    wobblePassword && 'animate-bounce text-red-500',
                  )}
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
                    className={classNames(
                      'flex-1 rounded-xl border bg-theme-surface px-3 py-2 text-base text-theme outline-hidden transition-all focus:border-secondary/60 sm:text-sm',
                      wobblePassword && 'border-red-500 ring-2 ring-red-500/50',
                      !wobblePassword && 'border-theme',
                    )}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') onJoinAdmin();
                    }}
                  />
                  <Button
                    onClick={onJoinAdmin}
                    disabled={isAuthenticating || !adminPassword}
                    variant="primary"
                  >
                    {isAuthenticating ? '...' : 'Go'}
                  </Button>
                </div>
                {adminError && (
                  <p
                    aria-live="polite"
                    className="rounded-xl border border-error/30 bg-error/10 px-3 py-2 text-error text-sm"
                    role="alert"
                  >
                    {adminError}
                  </p>
                )}
              </div>
            )}

            {isAdmin && (
              <div className="group mt-6 border-theme border-t pt-4 text-center">
                <span className="text-secondary text-sm">
                  ✓ You are an Admin
                </span>
              </div>
            )}

            <p className="pt-2 text-center text-2xs text-theme-muted italic">
              Settings sync enabled
            </p>
          </div>
        </div>

        {canScrollDown && (
          <div className="pointer-events-none absolute right-0 bottom-0 left-0 z-20 flex justify-center bg-gradient-to-t from-theme-surface via-theme-surface/95 pt-12 pb-4">
            <div className="flex animate-bounce items-center gap-1 rounded-full border border-white/40 bg-primary px-3 py-1.5 font-pixel text-3xs text-white shadow-primary-button">
              Scroll for more
              <ChevronDownIcon className="h-3 w-3" />
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

interface ProviderOption {
  Icon: ComponentType<{ className?: string }>;
  id: SourceType;
  variant: 'green' | 'orange' | 'red';
}

const providerOptions: ProviderOption[] = [
  { id: 'youtube', Icon: YouTubeIcon, variant: 'red' },
  { id: 'spotify', Icon: SpotifyIcon, variant: 'green' },
  { id: 'soundcloud', Icon: SoundCloudIcon, variant: 'orange' },
];
