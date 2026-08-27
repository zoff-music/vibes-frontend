import { classNames, showToast } from '@vibes/shared';
import {
  Button,
  CircleHalfIcon,
  CloseIcon,
  Modal,
  MoonIcon,
  SunIcon,
} from '@vibes/ui/web';
import { type ReactNode, useEffect, useRef, useState } from 'react';
import { useFetcher, useRouteLoaderData } from 'react-router';
import type { RootLoaderData } from '../../root';
import type { ProfileRouteData } from '../../routes/profile/clientLoader';
import { useThemeStore } from '../../stores/themeStore';

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileSettingsModal({
  isOpen,
  onClose,
}: ProfileSettingsModalProps) {
  const fetcher = useFetcher<ProfileRouteData>();
  const rootData = useRouteLoaderData<RootLoaderData>('root');
  const inputRef = useRef<HTMLInputElement>(null);
  const wasSavingRef = useRef(false);
  const initialProfile = rootData?.sessionProfile;
  const [name, setName] = useState(initialProfile?.name ?? '');
  const themeId = useThemeStore((state) => state.themeId);
  const setTheme = useThemeStore((state) => state.setTheme);

  useEffect(() => {
    if (
      isOpen &&
      fetcher.state === 'idle' &&
      !fetcher.data &&
      !initialProfile
    ) {
      void fetcher.load('/resources/profile');
    }
  }, [fetcher, initialProfile, isOpen]);

  useEffect(() => {
    const profile = fetcher.data?.profile ?? initialProfile;
    if (profile) {
      setName(profile.name);
    }
  }, [fetcher.data, initialProfile]);

  useEffect(() => {
    if (fetcher.state === 'submitting') {
      wasSavingRef.current = true;
      return;
    }

    if (fetcher.state !== 'idle' || !wasSavingRef.current) {
      return;
    }

    wasSavingRef.current = false;
    if (fetcher.data?.profile && !fetcher.data.error) {
      showToast('Profile saved', 'success');
    }
  }, [fetcher.data, fetcher.state]);

  const isLoading =
    fetcher.state === 'loading' && !fetcher.data?.profile && !initialProfile;
  const isSaving = fetcher.state === 'submitting';

  return (
    <Modal
      ariaLabelledBy="personal-settings-title"
      initialFocusRef={inputRef}
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
    >
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 id="personal-settings-title" className="text-base text-theme">
            Personal settings
          </h2>
          <p className="mt-2 text-sm text-theme-muted">
            Choose how Zoff looks and how you appear when adding songs.
          </p>
        </div>
        <Button
          aria-label="Close personal settings"
          onClick={onClose}
          size="icon"
          variant="tertiary"
        >
          <CloseIcon className="h-5 w-5" />
        </Button>
      </div>

      <div className="space-y-6">
        <section aria-labelledby="profile-display-name-title">
          <h3
            className="font-pixel text-2xs text-theme-muted tracking-label"
            id="profile-display-name-title"
          >
            Profile
          </h3>
          <p className="mt-2 text-theme-muted text-xs">
            Your display name appears beside songs you add and follows this
            browser across every room. It does not need to be unique.
          </p>
          <fetcher.Form
            action="/resources/profile"
            className="mt-4 space-y-4"
            method="post"
          >
            <label
              className="block font-pixel text-2xs text-theme-muted tracking-label"
              htmlFor="profile-name"
            >
              Display name
            </label>
            <input
              className="w-full rounded-2xl border border-theme bg-theme-surface px-4 py-4 text-base text-theme placeholder:text-theme-subtle focus:border-secondary focus:outline-hidden focus:ring-2 focus:ring-secondary/30"
              disabled={isLoading || isSaving}
              id="profile-name"
              maxLength={30}
              name="name"
              onChange={(event) => setName(event.target.value)}
              placeholder={isLoading ? 'Loading your profile…' : 'Display name'}
              ref={inputRef}
              required
              value={name}
            />
            {fetcher.data?.error && (
              <p aria-live="polite" className="text-error text-sm" role="alert">
                {fetcher.data.error}
              </p>
            )}
            {(fetcher.data?.profile || initialProfile) &&
              !fetcher.data?.error && (
                <p className="text-theme-subtle text-xs">
                  Songs you add will be credited to {name}.
                </p>
              )}
            <Button
              className="w-full"
              disabled={isLoading || isSaving || !name.trim()}
              type="submit"
              variant="primary"
            >
              {isSaving ? 'Saving…' : 'Save profile'}
            </Button>
          </fetcher.Form>
        </section>

        <section
          aria-labelledby="profile-appearance-title"
          className="border-theme border-t pt-6"
        >
          <h3
            className="font-pixel text-2xs text-theme-muted tracking-label"
            id="profile-appearance-title"
          >
            Appearance
          </h3>
          <p className="mt-2 text-theme-muted text-xs">
            Follow your device or keep Zoff in one theme.
          </p>
          <div
            className="mt-4 grid grid-cols-3 rounded-2xl border border-theme bg-black/5 p-1 dark:bg-white/5"
            role="radiogroup"
          >
            <ThemeButton
              active={themeId === 'auto'}
              defaultTheme
              icon={<CircleHalfIcon className="h-5 w-5" />}
              label="Auto"
              onSelect={() => setTheme('auto')}
              value="auto"
            />
            <ThemeButton
              active={themeId === 'light'}
              icon={<SunIcon className="h-5 w-5" />}
              label="Light"
              onSelect={() => setTheme('light')}
              value="light"
            />
            <ThemeButton
              active={themeId === 'dark'}
              icon={<MoonIcon className="h-5 w-5" />}
              label="Dark"
              onSelect={() => setTheme('dark')}
              value="dark"
            />
          </div>
        </section>
      </div>
    </Modal>
  );
}

interface ThemeButtonProps {
  active: boolean;
  defaultTheme?: boolean;
  icon: ReactNode;
  label: string;
  onSelect: () => void;
  value: string;
}

function ThemeButton({
  active,
  defaultTheme = false,
  icon,
  label,
  onSelect,
  value,
}: ThemeButtonProps) {
  return (
    <label className="min-w-0 cursor-pointer">
      <input
        checked={active}
        className="peer sr-only"
        name="profile-theme"
        onChange={onSelect}
        type="radio"
        value={value}
      />
      <span
        className={classNames(
          'flex min-h-16 min-w-0 flex-col items-center justify-center gap-1.5 rounded-xl px-2 py-2 font-pixel text-xs transition-all peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-secondary',
          active && !defaultTheme
            ? 'bg-secondary text-on-secondary shadow-secondary-soft'
            : active
              ? 'bg-theme-surface text-theme shadow-soft'
              : 'text-theme-muted hover:bg-theme-surface hover:text-theme',
        )}
      >
        {icon}
        <span>{label}</span>
      </span>
    </label>
  );
}
