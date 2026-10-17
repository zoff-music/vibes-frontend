import { Link } from '@kasperrt/smolter/preact';
import { roomNameMaxLength, type SourceType } from '@vibes/models';
import { classNames } from '@vibes/shared';
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
import React from 'preact/compat';
import { SiteHero } from '../../../components/layout/SiteHero';
import { SitePage } from '../../../components/layout/SitePage';
import { canUseViewTransition } from '../../../utils/viewTransition';
import { useCreateRoom } from '../hooks/useCreateRoom';

interface ProviderOption {
  Icon: React.ComponentType<{
    className?: string;
  }>;
  id: SourceType;
  variant: 'green' | 'orange' | 'red';
}

const providerOptions: ProviderOption[] = [
  {
    id: 'youtube',
    Icon: YouTubeIcon,
    variant: 'red',
  },
  {
    id: 'soundcloud',
    Icon: SoundCloudIcon,
    variant: 'orange',
  },
];

export function CreateRoom() {
  const {
    loaderData,
    createFetcher,
    roomType,
    name,
    setName,
    mode,
    setMode,
    password,
    settings,
    error,
    nameAvailability,
    nameAvailabilityError,
    reservation,
    isWaitingToCreate,
    wobblePassword,
    setWobblePassword,
    createFormRef,
    passwordRef,
    isLoading,
    isCreating,
    isGeneratingName,
    handleGenerateName,
    handleCreate,
    updateSetting,
    handleSourceToggle,
    handlePasswordChange,
    handlePublicRoomChange,
    publicRoomDescription,
  } = useCreateRoom();

  return (
    <SitePage>
      <createFetcher.Form
        ref={createFormRef}
        method="post"
        action="/rooms/create"
        onSubmit={handleCreate}
        className="relative z-10 flex w-full flex-col"
      >
        <input type="hidden" name="intent" value="createRoom" />
        <input type="hidden" name="roomType" value={roomType} />
        <input
          type="hidden"
          name="reservationToken"
          value={reservation?.token ?? ''}
        />

        <input type="hidden" name="mode" value={mode} />
        <input
          name="skipAllowed"
          type="hidden"
          value={String(settings.skipAllowed)}
        />

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
            viewTransition={canUseViewTransition()}
            className="group inline-flex cursor-pointer items-center gap-2 text-theme-muted transition-colors hover:text-theme"
          >
            <ArrowLeftIcon className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
            <span className="font-pixel text-xs tracking-label">Back</span>
          </Link>
          <div className="text-right font-pixel text-theme-muted text-xs tracking-label">
            CREATE A SESSION
          </div>
        </div>

        <SiteHero
          id="create-heading"
          title={
            roomType === 'WATCH' ? 'Create a watch session' : 'Create a session'
          }
          description={
            roomType === 'WATCH'
              ? 'Bring your people. Choose what to watch.'
              : 'Build a listening room in seconds.'
          }
        >
          <p className="jp-art mt-2 text-theme-subtle text-xs" lang="ja">
            セッションを作成
          </p>
          <div className="mt-8 grid gap-4 sm:gap-6 lg:grid-cols-2 lg:items-start">
            <div className="space-y-4 sm:space-y-6">
              {/* 1. SESSION NAME */}
              <div className="panel-surface rounded-3xl p-4 sm:p-6">
                <label className="mb-3 block font-pixel text-2xs text-theme-muted tracking-label">
                  SESSION NAME
                </label>
                <div className="relative">
                  <input
                    name="name"
                    maxLength={roomNameMaxLength}
                    type="text"
                    placeholder="Friday Night Vibes"
                    value={name}
                    onChange={(e) => setName(e.currentTarget.value)}
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
                    ? 'Password required for "Admins Only Add"'
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
                      {roomType === 'WATCH'
                        ? 'Keep videos playing together, automatically.'
                        : 'Auto-play music 24/7 for radio rooms.'}
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
                    label="ADMINS ONLY SKIP"
                    description={
                      roomType === 'WATCH'
                        ? 'Only room admins can skip videos'
                        : 'Only room admins can skip songs'
                    }
                    checked={!settings.skipAllowed}
                    onChange={(checked) =>
                      updateSetting('skipAllowed', !checked)
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
                    description={
                      roomType === 'WATCH'
                        ? 'Same video multiple times'
                        : 'Same song multiple times'
                    }
                    checked={settings.allowDuplicates}
                    onChange={(checked) =>
                      updateSetting('allowDuplicates', checked)
                    }
                  />

                  <SegmentedToggle
                    name="onlyAdminAddPlaylistItems"
                    label="ADMINS ONLY ADD"
                    description={
                      roomType === 'WATCH'
                        ? 'Only admins can add videos'
                        : 'Only admins can add songs'
                    }
                    checked={settings.onlyAdminAddPlaylistItems}
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

                      updateSetting('onlyAdminAddPlaylistItems', checked);
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
                  label="PUBLIC"
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
        </SiteHero>
      </createFetcher.Form>
    </SitePage>
  );
}
