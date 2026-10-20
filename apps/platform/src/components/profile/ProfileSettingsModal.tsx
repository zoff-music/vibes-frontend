import { useFetcher, useRouteLoaderData } from '@kasperrt/smolter/preact';
import { showToast } from '@vibes/shared';
import { useChatPreferenceStore } from '@vibes/shared/chatPreferenceStore';
import { useThemeStore } from '@vibes/shared/themeStore';
import { PersonalSettingsModal } from '@vibes/ui/web';
import { useEffect, useRef, useState } from 'preact/compat';
import type { RootLoaderData } from '../../root';
import type { ProfileRouteData } from '../../routes/resources.profile/clientLoader';
import { usePersistentPlayerStore } from '../../stores/persistentPlayerStore';

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
  const persistentPlayer = usePersistentPlayerStore((state) => state.enabled);
  const setPersistentPlayer = usePersistentPlayerStore(
    (state) => state.setEnabled,
  );
  const fetcher = useFetcher<ProfileRouteData>();
  const rootData = useRouteLoaderData<RootLoaderData>('root');
  const wasSavingRef = useRef(false);
  const initialProfile = rootData?.sessionProfile ?? null;
  const [name, setName] = useState(initialProfile?.name ?? '');
  const themeId = useThemeStore((state) => state.themeId);
  const setTheme = useThemeStore((state) => state.setTheme);

  useEffect(() => {
    if (
      isOpen &&
      fetcher.state === 'idle' &&
      !fetcher.data &&
      !fetcher.error &&
      !initialProfile
    ) {
      void fetcher.load('/resources/profile');
    }
  }, [fetcher, initialProfile, isOpen]);

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
    fetcher.state === 'loading' && !fetcher.data?.profile && !initialProfile;
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
      persistentPlayer={persistentPlayer}
      onPersistentPlayerChange={setPersistentPlayer}
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
