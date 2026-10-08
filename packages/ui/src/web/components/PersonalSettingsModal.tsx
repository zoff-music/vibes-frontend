import { displayNameMaxLength } from '@vibes/models';
import { classNames } from '@vibes/shared';
import type { ThemeId } from '@vibes/shared/themeStore';
import { type FormEventHandler, type ReactNode, useRef } from 'react';
import { CircleHalfIcon, CloseIcon, MoonIcon, SunIcon } from '../icons';
import { Button } from './Button';
import { Modal } from './Modal';
import { SegmentedToggle } from './SegmentedToggle';

interface PersonalSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  name: string;
  onNameChange: (name: string) => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
  isLoading: boolean;
  isSaving: boolean;
  error?: string;
  chatEnabled: boolean;
  onChatChange: (enabled: boolean) => void;
  themeId: ThemeId;
  onThemeChange: (theme: ThemeId) => void;
}

export function PersonalSettingsModal({
  isOpen,
  onClose,
  name,
  onNameChange,
  onSubmit,
  isLoading,
  isSaving,
  error,
  chatEnabled,
  onChatChange,
  themeId,
  onThemeChange,
}: PersonalSettingsModalProps) {
  const inputRef = useRef<HTMLInputElement>(null);

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
          <form className="space-y-4" onSubmit={onSubmit}>
            <label
              className="block font-pixel text-2xs text-theme-muted tracking-label"
              htmlFor="profile-name"
              id="profile-display-name-title"
            >
              Display name
            </label>
            <input
              className="w-full rounded-2xl border border-theme bg-theme-surface px-4 py-4 text-base text-theme placeholder:text-theme-subtle focus:border-secondary focus:outline-hidden focus:ring-2 focus:ring-secondary/30"
              disabled={isLoading || isSaving}
              id="profile-name"
              maxLength={displayNameMaxLength}
              name="name"
              onChange={(event) => onNameChange(event.target.value)}
              placeholder={isLoading ? 'Loading your profile…' : 'Display name'}
              ref={inputRef}
              required
              value={name}
            />
            {error && (
              <p aria-live="polite" className="text-error text-sm" role="alert">
                {error}
              </p>
            )}
            <SegmentedToggle
              label="Chat"
              variant="plain-full"
              size="comfortable"
              checked={chatEnabled}
              onChange={onChatChange}
            />
            <Button
              className="w-full"
              disabled={isLoading || isSaving || !name.trim()}
              type="submit"
              variant="primary"
            >
              {isSaving ? 'Saving…' : 'Save name'}
            </Button>
          </form>
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
          <div
            className="mt-4 grid grid-cols-3 rounded-2xl border border-theme bg-black/5 p-1 dark:bg-white/5"
            role="radiogroup"
          >
            <ThemeButton
              active={themeId === 'auto'}
              defaultTheme
              icon={<CircleHalfIcon className="block h-5 w-5" />}
              label="Auto"
              onSelect={() => onThemeChange('auto')}
              value="auto"
            />
            <ThemeButton
              active={themeId === 'light'}
              icon={<SunIcon className="block h-5 w-5" />}
              label="Light"
              onSelect={() => onThemeChange('light')}
              value="light"
            />
            <ThemeButton
              active={themeId === 'dark'}
              icon={<MoonIcon className="block h-5 w-5" />}
              label="Dark"
              onSelect={() => onThemeChange('dark')}
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
        <span className="flex h-5 items-center justify-center">{icon}</span>
        <span className="leading-none">{label}</span>
      </span>
    </label>
  );
}
