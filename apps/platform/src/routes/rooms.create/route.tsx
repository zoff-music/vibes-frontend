import { showToast } from '@vibes/shared';
import {
  AlertCircleIcon,
  Button,
  CheckIcon,
  CloseIcon,
  DiceIcon,
  SoundCloudIcon,
  SpotifyIcon,
  Toggle,
  YouTubeIcon,
} from '@vibes/ui';
import React, { useEffect, useState } from 'react';
import {
  Link,
  useFetcher,
  useLoaderData,
  useNavigate,
  useSearchParams,
} from 'react-router';
import { ArrowLeftIcon } from '../../components/icons/ArrowLeftIcon';
import { ArrowRightIcon } from '../../components/icons/ArrowRightIcon';
import { useThemeStore } from '../../stores/themeStore';
import type { RoomsCreateActionData } from './action';
import { clientAction } from './action';
import { clientLoader } from './clientLoader';
import type { RoomsCreateLoaderData } from './loader';

export { loader } from './loader';
export { clientAction, clientLoader };

const DEFAULT_SETTINGS = {
  skipAllowed: true,
  democraticSkip: true,
  loopQueue: true,
  removeOnPlay: false,
  allowDuplicates: false,
  enabledSources: ['youtube', 'spotify', 'soundcloud'],
  onlyAdminAddSongs: false,
};

type RoomNameAvailabilityState =
  | 'idle'
  | 'checking'
  | 'available'
  | 'taken'
  | 'error';

const CreateRoom: React.FC = () => {
  const loaderData = useLoaderData() as RoomsCreateLoaderData;
  const createFetcher = useFetcher<RoomsCreateActionData>();
  const suggestionFetcher = useFetcher<RoomsCreateLoaderData>();
  const availabilityFetcher = useFetcher<RoomsCreateLoaderData>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setIsWarping } = useThemeStore();

  // Initialize name - prioritize SSR data, then URL params
  const [name, setName] = useState(() => {
    // During SSR, use the initial data if available
    if (loaderData.createRoomName) {
      return loaderData.createRoomName;
    }

    // During client-side, try URL params (but only if we're not in SSR)
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const urlName = urlParams.get('name');
      if (urlName) {
        return urlName;
      }
    }

    return '';
  });

  const [mode, setMode] = useState<'server' | 'host'>('server');
  const [password, setPassword] = useState('');
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [error, setError] = useState<string | null>(null);
  const [nameAvailability, setNameAvailability] =
    useState<RoomNameAvailabilityState>('idle');
  const [nameAvailabilityError, setNameAvailabilityError] = useState<
    string | null
  >(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [wobblePassword, setWobblePassword] = useState(false);
  const passwordRef = React.useRef<HTMLDivElement>(null);
  const availabilityTimerRef = React.useRef<number | null>(null);

  const checkRoomNameAvailability = React.useCallback(
    (roomName: string) => {
      setNameAvailability('checking');
      setNameAvailabilityError(null);

      const params = new URLSearchParams({
        intent: 'check-room-name',
        name: roomName,
      });
      void availabilityFetcher.load(`/rooms/create?${params.toString()}`);
    },
    [availabilityFetcher],
  );

  // Reset wobble after animation
  useEffect(() => {
    if (wobblePassword) {
      const timer = setTimeout(() => setWobblePassword(false), 500);
      return () => clearTimeout(timer);
    }
  }, [wobblePassword]);

  // Auto-disable "Only Admin Add" if password is cleared
  useEffect(() => {
    if (!password && settings.onlyAdminAddSongs) {
      updateSetting('onlyAdminAddSongs', false);
    }
  }, [password, settings.onlyAdminAddSongs]);

  // Handle hydration
  useEffect(() => {
    setIsHydrated(true);

    // Fix hydration mismatch: ensure client state matches server state
    if (loaderData.createRoomName && name !== loaderData.createRoomName) {
      setName(loaderData.createRoomName);
      return; // Don't check URL params if we have SSR data
    }

    // After hydration, check if we need to update from URL params (only if no SSR data)
    if (!loaderData.createRoomName) {
      const urlParams = new URLSearchParams(window.location.search);
      const urlName = urlParams.get('name');

      if (urlName && urlName !== name) {
        setName(urlName);
      }
    }
  }, []); // Run only once on mount

  // Handle client-side URL changes (for navigation)
  useEffect(() => {
    if (!isHydrated) return; // Wait for hydration

    // Only update from URL if we don't have SSR data
    if (loaderData.createRoomName) {
      return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const urlName = urlParams.get('name');

    if (urlName && urlName !== name) {
      setName(urlName);
    }
  }, [searchParams, isHydrated, loaderData.createRoomName, name]);

  useEffect(() => {
    if (availabilityTimerRef.current !== null) {
      window.clearTimeout(availabilityTimerRef.current);
      availabilityTimerRef.current = null;
    }

    const trimmedName = name.trim();
    if (!trimmedName) {
      setNameAvailability('idle');
      setNameAvailabilityError(null);
      return;
    }

    setNameAvailability('checking');
    setNameAvailabilityError(null);
    availabilityTimerRef.current = window.setTimeout(() => {
      availabilityTimerRef.current = null;
      void checkRoomNameAvailability(trimmedName);
    }, 500);

    return () => {
      if (availabilityTimerRef.current !== null) {
        window.clearTimeout(availabilityTimerRef.current);
        availabilityTimerRef.current = null;
      }
    };
  }, [name, checkRoomNameAvailability]);

  useEffect(() => {
    const data = availabilityFetcher.data;
    if (!data || data.checkedName !== name.trim()) return;

    if (data.rateLimitMessage) {
      showToast(data.rateLimitMessage, 'warning', 6000);
    }
    if (data.error) {
      setNameAvailability('error');
      setNameAvailabilityError(data.error);
      return;
    }
    if (data.roomNameExists === undefined) return;

    setNameAvailability(data.roomNameExists ? 'taken' : 'available');
    setNameAvailabilityError(null);
  }, [availabilityFetcher.data, name]);

  useEffect(() => {
    const data = suggestionFetcher.data;
    if (!data) return;

    if (data.rateLimitMessage) {
      showToast(data.rateLimitMessage, 'warning', 6000);
    }
    if (data.error) {
      setError(data.error);
      return;
    }
    if (!data.roomNameSuggestion) return;

    setName(data.roomNameSuggestion);
  }, [suggestionFetcher.data]);

  const isLoading = createFetcher.state !== 'idle';
  const isGeneratingName = suggestionFetcher.state !== 'idle';

  const handleNameBlur = () => {
    const trimmedName = name.trim();
    if (!trimmedName) return;

    if (availabilityTimerRef.current !== null) {
      window.clearTimeout(availabilityTimerRef.current);
      availabilityTimerRef.current = null;
    }

    void checkRoomNameAvailability(trimmedName);
  };

  const handleGenerateName = () => {
    if (isGeneratingName || isLoading) return;

    setError(null);
    void suggestionFetcher.load('/rooms/create?intent=suggest-room-name');
  };

  const handleCreate = () => {
    if (!name.trim() || isLoading || nameAvailability !== 'available') {
      return;
    }

    setIsWarping(true);
    setError(null);

    const formData = new FormData();
    formData.set('name', name.trim());
    formData.set('password', password);
    formData.set('mode', mode);
    formData.set('skipAllowed', String(settings.skipAllowed));
    formData.set('democraticSkip', String(settings.democraticSkip));
    formData.set('loopQueue', String(settings.loopQueue));
    formData.set('removeOnPlay', String(settings.removeOnPlay));
    formData.set('allowDuplicates', String(settings.allowDuplicates));
    formData.set('onlyAdminAddSongs', String(settings.onlyAdminAddSongs));
    settings.enabledSources.forEach((source) => {
      formData.append('enabledSources', source);
    });
    createFetcher.submit(formData, { method: 'post' });
  };

  useEffect(() => {
    if (!createFetcher.data) return;
    if (createFetcher.data.rateLimitMessage) {
      showToast(createFetcher.data.rateLimitMessage, 'warning', 6000);
      setError(null);
      setIsWarping(false);
      return;
    }
    if (createFetcher.data.error) {
      setError(createFetcher.data.error);
      setIsWarping(false);
      return;
    }
    if (!createFetcher.data.room) return;

    navigate(`/rooms/${createFetcher.data.room.id}`, { replace: true });
  }, [createFetcher.data, navigate, setIsWarping]);

  const updateSetting = <K extends keyof typeof settings>(
    key: K,
    value: (typeof settings)[K],
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-start overflow-hidden">
      <div className="relative z-10 mx-auto mt-[min(26.5vh_,_230px)] flex w-full max-w-6xl flex-col px-6 pb-24">
        <div className="mb-8 flex items-center justify-between">
          <Link
            to="/"
            className="group inline-flex cursor-pointer items-center gap-2 text-theme-muted transition-colors hover:text-theme"
          >
            <ArrowLeftIcon className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
            <span className="font-pixel text-xs tracking-label">Back</span>
          </Link>
          <div className="text-right font-pixel text-theme-muted text-xs tracking-label">
            CREATE A SESSION
          </div>
        </div>

        <div className="crt-frame rounded-frame p-6 sm:p-10">
          <div className="mb-10 text-center">
            <h1 className="font-pixel text-3xl text-theme sm:text-4xl">
              CREATE A SESSION
            </h1>
            <p className="mt-3 font-pixel text-sm text-theme-muted">
              Build a listening room in seconds.
            </p>
            <p className="jp-art mt-2 text-theme-subtle text-xs">
              セッションを作成
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
            <div className="space-y-6">
              {/* 1. SESSION NAME */}
              <div className="panel-surface rounded-3xl p-6">
                <label className="mb-3 block font-pixel text-2xs text-theme-muted tracking-label">
                  SESSION NAME
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Friday Night Vibes"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onBlur={handleNameBlur}
                    onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                    className="w-full rounded-2xl border border-theme bg-theme-surface py-4 pr-24 pl-4 text-base text-theme placeholder:text-theme-subtle focus:border-secondary focus:outline-hidden focus:ring-2 focus:ring-secondary/30"
                    autoFocus
                  />
                  {nameAvailability === 'checking' && (
                    <span className="absolute top-1/2 right-14 h-5 w-5 -translate-y-1/2 animate-spin rounded-full border-2 border-theme-muted border-t-transparent" />
                  )}
                  {nameAvailability === 'available' && (
                    <CheckIcon className="absolute top-1/2 right-14 h-5 w-5 -translate-y-1/2 text-green-500" />
                  )}
                  {nameAvailability === 'taken' && (
                    <CloseIcon className="absolute top-1/2 right-14 h-5 w-5 -translate-y-1/2 text-error" />
                  )}
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={handleGenerateName}
                    disabled={isGeneratingName || isLoading}
                    aria-label="Generate a memorable room name"
                    title="Generate a memorable room name"
                    className="absolute top-1/2 right-2 -translate-y-1/2 text-theme-muted hover:text-secondary"
                  >
                    {isGeneratingName && (
                      <DiceIcon className="h-5 w-5 animate-dice-roll" />
                    )}
                    {!isGeneratingName && <DiceIcon className="h-5 w-5" />}
                  </Button>
                </div>
                <p className="mt-3 text-theme-subtle text-xs">
                  Use the dice for an available name that is easy to remember
                  and share.
                </p>
                <div className="mt-2 min-h-5 text-xs" aria-live="polite">
                  {nameAvailability === 'checking' && (
                    <span className="text-theme-subtle">
                      Checking availability...
                    </span>
                  )}
                  {nameAvailability === 'available' && (
                    <span className="text-secondary">
                      This name is available.
                    </span>
                  )}
                  {nameAvailability === 'taken' && (
                    <span className="text-error">
                      A room with this name already exists.
                    </span>
                  )}
                  {nameAvailability === 'error' && nameAvailabilityError && (
                    <span className="text-theme-muted">
                      {nameAvailabilityError}
                    </span>
                  )}
                </div>
              </div>

              {/* 2. ADMIN PASSWORD */}
              <div
                ref={passwordRef}
                className={`panel-surface rounded-3xl p-6 transition-all duration-300 ${wobblePassword ? 'border-red-500 shadow-error ring-2 ring-red-500/50' : ''}`}
              >
                <label
                  className={`mb-3 block font-pixel text-2xs tracking-label transition-colors ${wobblePassword ? 'animate-bounce text-red-500' : 'text-theme-muted'}`}
                >
                  ADMIN PASSWORD
                  <span className="ml-2 text-theme-subtle">(optional)</span>
                </label>
                <input
                  type="password"
                  placeholder="For room control"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full rounded-2xl border bg-theme-surface px-4 py-4 text-base text-theme placeholder:text-theme-subtle focus:outline-hidden focus:ring-2 ${wobblePassword ? 'border-red-500 focus:border-red-500 focus:ring-red-500/30' : 'border-theme focus:border-primary focus:ring-primary/30'}`}
                />
                <p
                  className={`mt-3 text-xs transition-colors ${wobblePassword ? 'font-bold text-red-400' : 'text-theme-subtle'}`}
                >
                  {wobblePassword
                    ? 'Password required for "Only Admin Add Songs"'
                    : 'Leave empty to allow anyone to control playback.'}
                </p>
              </div>

              {/* 3. ALLOWED SOURCES */}
              <div className="panel-surface rounded-3xl p-6">
                <label className="mb-4 block font-pixel text-2xs text-theme-muted tracking-label">
                  ALLOWED SOURCES
                </label>
                <div className="flex gap-2">
                  {[
                    {
                      id: 'youtube',
                      Icon: YouTubeIcon,
                      variant: 'red' as const,
                    },
                    {
                      id: 'spotify',
                      Icon: SpotifyIcon,
                      variant: 'green' as const,
                    },
                    {
                      id: 'soundcloud',
                      Icon: SoundCloudIcon,
                      variant: 'orange' as const,
                    },
                  ].map(({ id, Icon, variant }) => {
                    const isEnabled = settings.enabledSources.includes(id);
                    return (
                      <Button
                        key={id}
                        onClick={() => {
                          const newSources = isEnabled
                            ? settings.enabledSources.filter((s) => s !== id)
                            : [...settings.enabledSources, id];
                          updateSetting('enabledSources', newSources);
                        }}
                        variant={isEnabled ? variant : 'tertiary'}
                        aria-pressed={isEnabled}
                        className="h-10 w-full flex-1"
                        title={`${isEnabled ? 'Disable' : 'Enable'} ${id}`}
                      >
                        <Icon className="h-5 w-5" />
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* 4. ROOM MODE */}
              <div className="panel-surface rounded-3xl p-6">
                <label className="mb-4 block font-pixel text-2xs text-theme-muted tracking-label">
                  ROOM MODE
                </label>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Button
                    type="button"
                    onClick={() => setMode('server')}
                    className="w-full flex-col items-start px-4 py-4 text-left"
                    variant={mode === 'server' ? 'cyan' : 'tertiary'}
                    aria-pressed={mode === 'server'}
                  >
                    <div className="mb-2 font-pixel text-current text-xs tracking-display">
                      SERVER MODE
                    </div>
                    <div className="text-current text-xs opacity-75">
                      Auto-play music 24/7 for radio rooms.
                    </div>
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setMode('host')}
                    className="w-full flex-col items-start px-4 py-4 text-left"
                    variant={mode === 'host' ? 'magenta' : 'tertiary'}
                    aria-pressed={mode === 'host'}
                  >
                    <div className="mb-2 font-pixel text-current text-xs tracking-display">
                      HOST MODE
                    </div>
                    <div className="text-current text-xs opacity-75">
                      Host controls playback for parties.
                    </div>
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="panel-surface rounded-3xl p-6">
                <div className="mb-6">
                  <h2 className="font-pixel text-caption text-theme-muted tracking-banner">
                    PLAYBACK SETTINGS
                  </h2>
                </div>

                <div className="space-y-4">
                  <Toggle
                    label="ALLOW SKIP"
                    description="Anyone can skip songs"
                    checked={settings.skipAllowed}
                    onChange={(checked) =>
                      updateSetting('skipAllowed', checked)
                    }
                  />

                  <Toggle
                    label="DEMOCRATIC SKIP"
                    description="Require votes to skip"
                    checked={settings.democraticSkip}
                    onChange={(checked) =>
                      updateSetting('democraticSkip', checked)
                    }
                  />

                  <Toggle
                    label="LOOP QUEUE"
                    description="Restart when queue ends"
                    checked={settings.loopQueue}
                    onChange={(checked) => updateSetting('loopQueue', checked)}
                  />

                  <Toggle
                    label="REMOVE PLAYED"
                    description="Removed after play"
                    checked={settings.removeOnPlay}
                    onChange={(checked) =>
                      updateSetting('removeOnPlay', checked)
                    }
                  />

                  <Toggle
                    label="ALLOW DUPLICATES"
                    description="Same song multiple times"
                    checked={settings.allowDuplicates}
                    onChange={(checked) =>
                      updateSetting('allowDuplicates', checked)
                    }
                  />

                  <Toggle
                    label="ADMINS ONLY ADD"
                    description="Only admins can add songs"
                    checked={settings.onlyAdminAddSongs}
                    onChange={(checked) => {
                      if (checked && !password) {
                        setWobblePassword(true);
                        passwordRef.current?.scrollIntoView({
                          behavior: 'smooth',
                          block: 'center',
                        });
                        // Don't enable it if password is missing
                        return;
                      }
                      updateSetting('onlyAdminAddSongs', checked);
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mt-6 rounded-2xl border border-error/40 bg-error/10 p-5 text-error text-sm">
              <div className="flex items-start gap-3">
                <AlertCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-error" />
                <p className="flex-1">{error}</p>
              </div>
            </div>
          )}

          {/* Create button */}
          <Button
            onClick={handleCreate}
            disabled={
              !name.trim() || isLoading || nameAvailability !== 'available'
            }
            variant="primary"
            className="mt-8 w-full gap-3 px-6 py-4 font-pixel text-sm"
          >
            {isLoading && (
              <>
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                <span>Creating...</span>
              </>
            )}
            {!isLoading && (
              <>
                <span>Start Session</span>
                <ArrowRightIcon className="h-5 w-5" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateRoom;
