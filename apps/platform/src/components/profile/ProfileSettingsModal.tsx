import {
  Button,
  CircleHalfIcon,
  CloseIcon,
  Modal,
  MoonIcon,
  SunIcon,
} from '@vibes/ui/web';
import { type ReactNode, useEffect, useRef, useState } from 'react';
import { useFetcher } from 'react-router';
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
  const inputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState('');
  const themeId = useThemeStore((state) => state.themeId);
  const setTheme = useThemeStore((state) => state.setTheme);

  useEffect(() => {
    if (isOpen && fetcher.state === 'idle' && !fetcher.data) {
      void fetcher.load('/resources/profile');
    }
  }, [fetcher, isOpen]);

  useEffect(() => {
    if (fetcher.data?.profile) {
      setName(fetcher.data.profile.name);
    }
  }, [fetcher.data]);

  const isLoading = fetcher.state === 'loading' && !fetcher.data?.profile;
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
            {fetcher.data?.profile && !fetcher.data.error && (
              <p className="text-theme-subtle text-xs">
                New songs will show “Added by {fetcher.data.profile.name}”.
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
          <div className="mt-4 grid grid-cols-3 gap-2" role="radiogroup">
            <ThemeButton
              active={themeId === 'auto'}
              icon={<CircleHalfIcon className="h-5 w-5" />}
              label="Auto"
              onClick={() => setTheme('auto')}
            />
            <ThemeButton
              active={themeId === 'light'}
              icon={<SunIcon className="h-5 w-5" />}
              label="Light"
              onClick={() => setTheme('light')}
            />
            <ThemeButton
              active={themeId === 'dark'}
              icon={<MoonIcon className="h-5 w-5" />}
              label="Dark"
              onClick={() => setTheme('dark')}
            />
          </div>
        </section>
      </div>
    </Modal>
  );
}

interface ThemeButtonProps {
  active: boolean;
  icon: ReactNode;
  label: string;
  onClick: () => void;
}

function ThemeButton({ active, icon, label, onClick }: ThemeButtonProps) {
  return (
    <Button
      aria-checked={active}
      className="min-w-0 flex-col gap-2 px-2 py-3 text-xs"
      onClick={onClick}
      role="radio"
      size="none"
      variant={active ? 'tertiary-active' : 'tertiary'}
    >
      {icon}
      <span>{label}</span>
    </Button>
  );
}
