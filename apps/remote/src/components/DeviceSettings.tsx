import { useFetcher } from '@kasperrt/smolter/preact';
import type { SessionProfile } from '@vibes/models';
import { showToast } from '@vibes/shared';
import { useChatPreferenceStore } from '@vibes/shared/chatPreferenceStore';
import { useThemeStore } from '@vibes/shared/themeStore';
import { PersonalSettingsModal } from '@vibes/ui/web';
import { useEffect, useRef, useState } from 'preact/compat';
import type { ProfileRouteData } from '../routes/remotes.resources.profile/clientLoader';

interface DeviceSettingsProps {
  onClose: () => void;
  isOpen: boolean;
  initialProfile: SessionProfile | null;
}

export function DeviceSettings({
  onClose,
  isOpen,
  initialProfile,
}: DeviceSettingsProps) {
  const chatEnabled = useChatPreferenceStore((state) => state.enabled);
  const setChatEnabled = useChatPreferenceStore((state) => state.setEnabled);
  const fetcher = useFetcher<ProfileRouteData>();
  const wasSavingRef = useRef(false);
  const [name, setName] = useState(initialProfile?.name ?? '');
  const themeId = useThemeStore((state) => state.themeId);
  const setTheme = useThemeStore((state) => state.setTheme);

  useEffect(() => {
    if (
      isOpen &&
      !initialProfile &&
      fetcher.state === 'idle' &&
      !fetcher.data &&
      !fetcher.error
    ) {
      void fetcher.load('/remotes/resources/profile');
    }
  }, [fetcher, isOpen, initialProfile]);

  useEffect(() => {
    const profile = fetcher.data?.profile;

    if (profile) {
      setName(profile.name);
    }
  }, [fetcher.data]);

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
    !initialProfile &&
    !fetcher.data?.profile &&
    !fetcher.data?.error &&
    !fetcher.error;
  const isSaving = fetcher.state === 'submitting';
  const error = fetcher.data?.error ?? fetcher.error?.message;

  return (
    <PersonalSettingsModal
      isOpen={isOpen}
      onClose={onClose}
      name={name}
      onNameChange={setName}
      isLoading={isLoading}
      isSaving={isSaving}
      {...(error ? { error } : {})}
      chatEnabled={chatEnabled}
      onChatChange={setChatEnabled}
      themeId={themeId}
      onThemeChange={setTheme}
      onSubmit={(event) => {
        event.preventDefault();
        void fetcher.submit(event.currentTarget, {
          action: '/remotes/resources/profile',
          method: 'post',
        });
      }}
    />
  );
}
