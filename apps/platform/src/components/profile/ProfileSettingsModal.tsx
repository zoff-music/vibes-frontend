import { Button, CloseIcon, Modal } from '@vibes/ui/web';
import { useEffect, useRef, useState } from 'react';
import { useFetcher } from 'react-router';
import type { ProfileRouteData } from '../../routes/profile/clientLoader';

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
      ariaLabelledBy="profile-settings-title"
      initialFocusRef={inputRef}
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
    >
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 id="profile-settings-title" className="text-base text-theme">
            Your name
          </h2>
          <p className="mt-2 text-sm text-theme-muted">
            This name shows who added songs. It follows this browser across all
            rooms, and names do not need to be unique.
          </p>
        </div>
        <Button
          aria-label="Close name settings"
          onClick={onClose}
          size="icon"
          variant="tertiary"
        >
          <CloseIcon className="h-5 w-5" />
        </Button>
      </div>

      <fetcher.Form
        action="/resources/profile"
        className="space-y-4"
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
          placeholder={isLoading ? 'Finding your name…' : 'Your name'}
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
            Songs you add will be credited to {fetcher.data.profile.name}.
          </p>
        )}
        <Button
          className="w-full"
          disabled={isLoading || isSaving || !name.trim()}
          type="submit"
          variant="primary"
        >
          {isSaving ? 'Saving…' : 'Save name'}
        </Button>
      </fetcher.Form>
    </Modal>
  );
}
