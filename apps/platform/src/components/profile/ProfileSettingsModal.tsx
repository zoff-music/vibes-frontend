import type { SessionProfile } from '@vibes/models';
import { showToast } from '@vibes/shared';
import { PersonalSettingsModal } from '@vibes/ui/web';
import { useEffect, useRef, useState } from 'react';
import { useFetcher, useRouteLoaderData } from 'react-router';
import type { RootLoaderData } from '../../root';
import type { ProfileRouteData } from '../../routes/profile/clientLoader';
import { useChatPreferenceStore } from '../../stores/chatPreferenceStore';
import { useThemeStore } from '../../stores/themeStore';

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileSettingsModal({
  isOpen,
  onClose,
}: ProfileSettingsModalProps) {
  const chatEnabled = useChatPreferenceStore((state) => state.enabled);
  const setChatEnabled = useChatPreferenceStore((state) => state.setEnabled);
  const fetcher = useFetcher<ProfileRouteData>();
  const rootData = useRouteLoaderData<RootLoaderData>('root');
  const wasSavingRef = useRef(false);
  const [initialProfile, setInitialProfile] = useState<SessionProfile | null>(
    null,
  );
  const [profilePending, setProfilePending] = useState(
    Boolean(rootData?.sessionProfile),
  );
  const [name, setName] = useState('');
  const themeId = useThemeStore((state) => state.themeId);
  const setTheme = useThemeStore((state) => state.setTheme);

  useEffect(() => {
    let active = true;
    const profile = rootData?.sessionProfile;

    setProfilePending(Boolean(profile));

    void profile?.then((result) => {
      if (!active) return;

      setInitialProfile(result);
      setProfilePending(false);
    });

    return () => {
      active = false;
    };
  }, [rootData?.sessionProfile]);

  useEffect(() => {
    if (
      isOpen &&
      fetcher.state === 'idle' &&
      !fetcher.data &&
      !initialProfile &&
      !profilePending
    ) {
      void fetcher.load('/resources/profile');
    }
  }, [fetcher, initialProfile, isOpen, profilePending]);

  useEffect(() => {
    const profile = fetcher.data?.profile ?? initialProfile;
    if (isOpen && profile) {
      setName(profile.name);
    }
  }, [fetcher.data, initialProfile, isOpen]);

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
    (profilePending || fetcher.state === 'loading') &&
    !fetcher.data?.profile &&
    !initialProfile;
  const isSaving = fetcher.state === 'submitting';

  return (
    <PersonalSettingsModal
      isOpen={isOpen}
      onClose={onClose}
      name={name}
      onNameChange={setName}
      isLoading={isLoading}
      isSaving={isSaving}
      {...(fetcher.data?.error ? { error: fetcher.data.error } : {})}
      chatEnabled={chatEnabled}
      onChatChange={setChatEnabled}
      themeId={themeId}
      onThemeChange={setTheme}
      onSubmit={(event) => {
        event.preventDefault();
        void fetcher.submit(event.currentTarget, {
          action: '/resources/profile',
          method: 'post',
        });
      }}
    />
  );
}
