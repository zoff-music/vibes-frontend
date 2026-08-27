import {
  isSourceType,
  type RoomNameReservation,
  type SourceType,
} from '@vibes/models';
import {
  classNames,
  DEFAULT_ROOM_SETTINGS,
  showRateLimitMessageToast,
} from '@vibes/shared';
import {
  AlertCircleIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  Button,
  CheckIcon,
  CloseIcon,
  DiceIcon,
  SegmentedToggle,
  SoundCloudIcon,
  YouTubeIcon,
} from '@vibes/ui/web';
import React, { lazy, Suspense, useEffect, useState } from 'react';
import {
  Link,
  useFetcher,
  useLoaderData,
  useNavigate,
  useSearchParams,
} from 'react-router';
import { useKonamiMode } from '../../components/konami/KonamiModeContext';
import { useThemeStore } from '../../stores/themeStore';
import type { RoomsCreateActionData } from './action';
import { clientAction } from './action';
import { clientLoader } from './clientLoader';
import type { RoomsCreateLoaderData } from './loader';

export { loader } from './loader';
export { clientAction, clientLoader };

const LazyTerminalCreateRoom = lazy(() =>
  import('@vibes/ui/konami').then((module) => ({
    default: module.TerminalCreateRoom,
  })),
);

type RoomNameAvailabilityState =
  | 'idle'
  | 'checking'
  | 'available'
  | 'taken'
  | 'error';

const CreateRoom: React.FC = () => {
  const loaderData = useLoaderData() as RoomsCreateLoaderData;
  const createFetcher = useFetcher<RoomsCreateActionData>();
  const suggestionFetcher = useFetcher<RoomsCreateActionData>();
  const availabilityFetcher = useFetcher<RoomsCreateActionData>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const terminalMode = useKonamiMode();
  const setIsWarping = useThemeStore((state) => state.setIsWarping);

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
  const [settings, setSettings] = useState(DEFAULT_ROOM_SETTINGS);
  const [error, setError] = useState<string | null>(loaderData.error ?? null);
  const [nameAvailability, setNameAvailability] =
    useState<RoomNameAvailabilityState>('idle');
  const [nameAvailabilityError, setNameAvailabilityError] = useState<
    string | null
  >(null);
  const [reservation, setReservation] = useState<RoomNameReservation | null>(
    null,
  );
  const [isHydrated, setIsHydrated] = useState(false);
  const [isWaitingToCreate, setIsWaitingToCreate] = useState(false);
  const [isReadyToSubmit, setIsReadyToSubmit] = useState(false);
  const [wobblePassword, setWobblePassword] = useState(false);
  const createFormRef = React.useRef<HTMLFormElement>(null);
  const passwordRef = React.useRef<HTMLDivElement>(null);
  const availabilityTimerRef = React.useRef<number | null>(null);
  const pendingCreationNameRef = React.useRef('');
  const reservationTokenRef = React.useRef('');
  reservationTokenRef.current = reservation?.token ?? '';
  const availabilityFetcherSubmitRef = React.useRef(availabilityFetcher.submit);
  availabilityFetcherSubmitRef.current = availabilityFetcher.submit;

  const checkRoomNameAvailability = React.useCallback((roomName: string) => {
    setNameAvailability('checking');
    setNameAvailabilityError(null);

    void availabilityFetcherSubmitRef.current(
      {
        intent: 'reserveRoomName',
        name: roomName,
      },
      {
        method: 'post',
        action: '/rooms/create',
      },
    );
  }, []);

  // Reset wobble after animation
  useEffect(() => {
    if (wobblePassword) {
      const timer = setTimeout(() => setWobblePassword(false), 500);
      return () => clearTimeout(timer);
    }
  }, [wobblePassword]);

  // Handle hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Handle client-side URL changes (for navigation)
  useEffect(() => {
    if (!isHydrated) return; // Wait for hydration

    // Only update from URL if we don't have SSR data
    if (loaderData.createRoomName) {
      return;
    }

    const urlName = searchParams.get('name');

    if (urlName && urlName !== name) {
      setName(urlName);
    }
  }, [isHydrated, loaderData.createRoomName, name, searchParams]);

  useEffect(() => {
    if (availabilityTimerRef.current !== null) {
      window.clearTimeout(availabilityTimerRef.current);
      availabilityTimerRef.current = null;
    }

    const trimmedName = name.trim();
    if (!trimmedName) {
      pendingCreationNameRef.current = '';
      setIsWaitingToCreate(false);
      setReservation(null);
      setNameAvailability('idle');
      setNameAvailabilityError(null);
      return;
    }

    if (
      reservation &&
      reservation.name === slugifyRoomName(trimmedName) &&
      Date.parse(reservation.expiresAt) > Date.now()
    ) {
      setNameAvailability('available');
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
  }, [name, reservation, checkRoomNameAvailability]);

  useEffect(() => {
    if (!reservation) return;

    const expiresIn = Date.parse(reservation.expiresAt) - Date.now();
    if (expiresIn <= 0) {
      setReservation(null);
      return;
    }

    const timer = window.setTimeout(() => {
      setReservation(null);
    }, expiresIn);
    return () => window.clearTimeout(timer);
  }, [reservation]);

  useEffect(() => {
    const data = availabilityFetcher.data;
    if (!data || data.checkedName !== name.trim()) return;

    if (data.rateLimitMessage) {
      showRateLimitMessageToast(data.rateLimitMessage);
    }
    if (data.error) {
      setReservation(null);
      if (data.roomNameUnavailable) {
        setNameAvailability('taken');
      } else {
        setNameAvailability('error');
      }
      setNameAvailabilityError(data.error);
      if (pendingCreationNameRef.current === data.checkedName) {
        pendingCreationNameRef.current = '';
        setIsWaitingToCreate(false);
        setError(data.error);
      }
      return;
    }
    if (!data.reservation) return;

    setReservation(data.reservation);
    setNameAvailability('available');
    setNameAvailabilityError(null);
    if (pendingCreationNameRef.current === data.checkedName) {
      pendingCreationNameRef.current = '';
      setIsWaitingToCreate(false);
      setIsReadyToSubmit(true);
    }
  }, [availabilityFetcher.data, name]);

  useEffect(() => {
    if (!isReadyToSubmit || !reservation) return;

    setIsReadyToSubmit(false);
    createFormRef.current?.requestSubmit();
  }, [isReadyToSubmit, reservation]);

  useEffect(() => {
    const data = suggestionFetcher.data;
    if (!data) return;

    if (data.rateLimitMessage) {
      showRateLimitMessageToast(data.rateLimitMessage);
    }
    if (data.error) {
      setError(data.error);
      return;
    }
    if (!data.reservation) return;

    setReservation(data.reservation);
    setNameAvailability('available');
    setNameAvailabilityError(null);
    setName(data.reservation.name);
  }, [suggestionFetcher.data]);

  const isLoading = createFetcher.state !== 'idle';
  const isCreating = isLoading || isWaitingToCreate;
  const isGeneratingName = suggestionFetcher.state !== 'idle';

  const handleGenerateName = () => {
    if (isGeneratingName || isLoading) return;

    setError(null);
    void suggestionFetcher.submit(
      {
        intent: 'reserveRoomName',
      },
      {
        method: 'post',
        action: '/rooms/create',
      },
    );
  };

  const handleCreate = (event: React.FormEvent<HTMLFormElement>) => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      event.preventDefault();
      setError('Enter a room name before starting the session.');
      return;
    }

    if (isCreating) {
      event.preventDefault();
      return;
    }

    if (nameAvailability === 'taken') {
      event.preventDefault();
      setError('That room name is already in use. Choose another name.');
      return;
    }

    if (nameAvailability === 'available' && reservationTokenRef.current) {
      setIsWarping(true);
      setError(null);
      return;
    }

    event.preventDefault();
    if (availabilityTimerRef.current !== null) {
      window.clearTimeout(availabilityTimerRef.current);
      availabilityTimerRef.current = null;
    }

    pendingCreationNameRef.current = trimmedName;
    setIsWaitingToCreate(true);
    setError(null);
    checkRoomNameAvailability(trimmedName);
  };

  useEffect(() => {
    if (!createFetcher.data) return;
    if (createFetcher.data.rateLimitMessage) {
      showRateLimitMessageToast(createFetcher.data.rateLimitMessage);
      setError(null);
      setIsWarping(false);
      return;
    }
    if (createFetcher.data.error) {
      setError(createFetcher.data.error);
      setIsWarping(false);
    }
  }, [createFetcher.data, setIsWarping]);

  useEffect(() => {
    return () => setIsWarping(false);
  }, [setIsWarping]);

  const updateSetting = <K extends keyof typeof settings>(
    key: K,
    value: (typeof settings)[K],
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const toggleSource = (source: SourceType) => {
    if (!loaderData.providers?.includes(source)) {
      return;
    }

    const enabledSources = settings.enabledSources.includes(source)
      ? settings.enabledSources.filter(
          (enabledSource) => enabledSource !== source,
        )
      : [...settings.enabledSources, source];
    updateSetting('enabledSources', enabledSources);
  };

  const handleSourceToggle = (event: React.MouseEvent<HTMLButtonElement>) => {
    const source = event.currentTarget.value;
    if (!isSourceType(source)) {
      return;
    }
    toggleSource(source);
  };

  const updatePassword = (nextPassword: string) => {
    setPassword(nextPassword);
    if (nextPassword) {
      return;
    }

    setSettings((currentSettings) => ({
      ...currentSettings,
      onlyAdminAddSongs: false,
      public: false,
    }));
  };

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    updatePassword(event.target.value);
  };

  const handlePublicRoomChange = (checked: boolean) => {
    if (!password) {
      return;
    }

    updateSetting('public', checked);
  };

  const publicRoomDescription = password
    ? 'Show under Live now while listeners are active'
    : 'Add an admin password to make this room public';

  if (terminalMode) {
    return (
      <Suspense fallback={null}>
        <LazyTerminalCreateRoom
          availability={nameAvailability}
          availabilityError={nameAvailabilityError}
          error={error}
          isCreating={isCreating}
          isGeneratingName={isGeneratingName}
          mode={mode}
          name={name}
          onBack={() => navigate('/')}
          onBooleanSettingChange={updateSetting}
          onGenerateName={handleGenerateName}
          onModeChange={setMode}
          onNameChange={setName}
          onPasswordChange={updatePassword}
          onSourceToggle={toggleSource}
          password={password}
          providers={loaderData.providers ?? []}
          renderForm={(content) => (
            <createFetcher.Form
              ref={createFormRef}
              action="/rooms/create"
              className="contents"
              method="post"
              onSubmit={handleCreate}
            >
              <input name="intent" type="hidden" value="createRoom" />
              <input
                name="reservationToken"
                type="hidden"
                value={reservation?.token ?? ''}
              />
              <input name="mode" type="hidden" value={mode} />
              <input
                name="playlistImport"
                type="hidden"
                value={String(settings.playlistImport)}
              />
              {settings.enabledSources.map((source) => (
                <input
                  key={source}
                  name="enabledSources"
                  type="hidden"
                  value={source}
                />
              ))}
              {content}
            </createFetcher.Form>
          )}
          settings={settings}
        />
      </Suspense>
    );
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-start overflow-hidden">
      <createFetcher.Form
        ref={createFormRef}
        method="post"
        action="/rooms/create"
        onSubmit={handleCreate}
        className="relative z-10 mx-auto mt-24 flex w-full max-w-6xl flex-col px-3 pb-16 sm:mt-[min(26.5vh_,_230px)] sm:px-6 sm:pb-24"
      >
        <input type="hidden" name="intent" value="createRoom" />
        <input
          type="hidden"
          name="reservationToken"
          value={reservation?.token ?? ''}
        />
        <input type="hidden" name="mode" value={mode} />
        {settings.enabledSources.map((source) => (
          <input
            key={source}
            type="hidden"
            name="enabledSources"
            value={source}
          />
        ))}
        <div className="mb-8 flex items-center justify-between">
          <Link
            to="/"
            viewTransition
            className="group inline-flex cursor-pointer items-center gap-2 text-theme-muted transition-colors hover:text-theme"
          >
            <ArrowLeftIcon className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
            <span className="font-pixel text-xs tracking-label">Back</span>
          </Link>
          <div className="text-right font-pixel text-theme-muted text-xs tracking-label">
            CREATE A SESSION
          </div>
        </div>

        <div className="crt-frame rounded-frame p-3 sm:p-10">
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

          <div className="grid gap-4 sm:gap-6 lg:grid-cols-2 lg:items-start">
            <div className="space-y-4 sm:space-y-6">
              {/* 1. SESSION NAME */}
              <div className="panel-surface rounded-3xl p-4 sm:p-6">
                <label className="mb-3 block font-pixel text-2xs text-theme-muted tracking-label">
                  SESSION NAME
                </label>
                <div className="relative">
                  <input
                    name="name"
                    type="text"
                    placeholder="Friday Night Vibes"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
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
                      This name is already in use or temporarily reserved.
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
                className={classNames(
                  'panel-surface rounded-3xl p-4 transition-all duration-300 sm:p-6',
                  wobblePassword &&
                    'border-red-500 shadow-error ring-2 ring-red-500/50',
                )}
              >
                <label
                  className={classNames(
                    'mb-3 block font-pixel text-2xs tracking-label transition-colors',
                    wobblePassword
                      ? 'animate-bounce text-red-500'
                      : 'text-theme-muted',
                  )}
                >
                  ADMIN PASSWORD
                  <span className="ml-2 text-theme-subtle">(optional)</span>
                </label>
                <input
                  name="password"
                  type="password"
                  placeholder="For room control"
                  value={password}
                  onChange={handlePasswordChange}
                  className={classNames(
                    'w-full rounded-2xl border bg-theme-surface px-4 py-4 text-base text-theme placeholder:text-theme-subtle focus:outline-hidden focus:ring-2',
                    wobblePassword
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/30'
                      : 'border-theme focus:border-primary focus:ring-primary/30',
                  )}
                />
                <p
                  className={classNames(
                    'mt-3 text-xs transition-colors',
                    wobblePassword
                      ? 'font-bold text-red-400'
                      : 'text-theme-subtle',
                  )}
                >
                  {wobblePassword
                    ? 'Password required for "Only Admin Add Songs"'
                    : 'Leave empty to allow anyone to control playback.'}
                </p>
              </div>

              {/* 3. ALLOWED SOURCES */}
              <div className="panel-surface rounded-3xl p-4 sm:p-6">
                <label className="mb-4 block font-pixel text-2xs text-theme-muted tracking-label">
                  ALLOWED SOURCES
                </label>
                <div className="flex gap-2">
                  {providerOptions
                    .filter(({ id }) => loaderData.providers?.includes(id))
                    .map(({ id, Icon, variant }) => {
                      const isEnabled = settings.enabledSources.includes(id);
                      return (
                        <Button
                          key={id}
                          value={id}
                          onClick={handleSourceToggle}
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
              <div className="panel-surface rounded-3xl p-4 sm:p-6">
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

            <div className="space-y-4 sm:space-y-6">
              <div className="panel-surface rounded-3xl p-4 sm:p-6">
                <div className="mb-6">
                  <h2 className="font-pixel text-caption text-theme-muted tracking-banner">
                    PLAYBACK SETTINGS
                  </h2>
                </div>

                <div className="space-y-4">
                  <SegmentedToggle
                    name="skipAllowed"
                    label="ALLOW SKIP"
                    description="Anyone can skip songs"
                    checked={settings.skipAllowed}
                    onChange={(checked) =>
                      updateSetting('skipAllowed', checked)
                    }
                  />

                  <SegmentedToggle
                    name="democraticSkip"
                    label="DEMOCRATIC SKIP"
                    description="Require votes to skip"
                    checked={settings.democraticSkip}
                    onChange={(checked) =>
                      updateSetting('democraticSkip', checked)
                    }
                  />

                  <SegmentedToggle
                    name="removeOnPlay"
                    label="REMOVE PLAYED"
                    description="Removed after play"
                    checked={settings.removeOnPlay}
                    onChange={(checked) =>
                      updateSetting('removeOnPlay', checked)
                    }
                  />

                  <SegmentedToggle
                    name="allowDuplicates"
                    label="ALLOW DUPLICATES"
                    description="Same song multiple times"
                    checked={settings.allowDuplicates}
                    onChange={(checked) =>
                      updateSetting('allowDuplicates', checked)
                    }
                  />

                  <SegmentedToggle
                    name="onlyAdminAddSongs"
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

                  <SegmentedToggle
                    name="playlistImport"
                    label="PLAYLIST IMPORT"
                    description="Allow adding playlists from links"
                    checked={settings.playlistImport}
                    onChange={(checked) =>
                      updateSetting('playlistImport', checked)
                    }
                  />
                </div>
              </div>

              <div className="panel-surface rounded-3xl p-4 sm:p-6">
                <h2 className="mb-6 font-pixel text-caption text-theme-muted tracking-banner">
                  VISIBILITY
                </h2>
                <SegmentedToggle
                  name="public"
                  label="PUBLIC ROOM"
                  description={publicRoomDescription}
                  disabled={!password}
                  checked={settings.public}
                  onChange={handlePublicRoomChange}
                />
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
            type="submit"
            disabled={!name.trim() || isCreating}
            variant="primary"
            className="mt-8 w-full gap-3 px-6 py-4 font-pixel text-sm"
          >
            {isWaitingToCreate && (
              <>
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                <span>Checking name...</span>
              </>
            )}
            {isLoading && (
              <>
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                <span>Creating...</span>
              </>
            )}
            {!isCreating && (
              <>
                <span>Start Session</span>
                <ArrowRightIcon className="h-5 w-5" />
              </>
            )}
          </Button>
        </div>
      </createFetcher.Form>
    </div>
  );
};

function slugifyRoomName(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/[ -]+/g, '-')
    .replace(/^-|-$/g, '');
}

export default CreateRoom;

interface ProviderOption {
  Icon: React.ComponentType<{ className?: string }>;
  id: SourceType;
  variant: 'green' | 'orange' | 'red';
}

const providerOptions: ProviderOption[] = [
  { id: 'youtube', Icon: YouTubeIcon, variant: 'red' },
  { id: 'soundcloud', Icon: SoundCloudIcon, variant: 'orange' },
];
