import { displayNameMaxLength, type SessionProfile } from '@vibes/models';
import { useMutation, useRequest } from '@vibes/shared/use-request';
import { useEffect, useRef, useState } from 'react';
import { Modal, View } from 'react-native';
import {
  Button,
  Card,
  Copy,
  Field,
  Heading,
  IconButton,
  Screen,
} from '@/components/native';
import { ScreenSafeArea as SafeAreaView } from '@/components/screen-safe-area';
import { useAppTheme } from '@/hooks/use-app-theme';
import { loadProfile } from '@/requests/load-profile';
import { updateProfile } from '@/requests/update-profile';

interface ProfileSettingsSheetProps {
  initialProfile: SessionProfile | null;
  onClose: () => void;
  onSaved: (profile: SessionProfile) => void;
  visible: boolean;
}

export function ProfileSettingsSheet({
  initialProfile,
  onClose,
  onSaved,
  visible,
}: ProfileSettingsSheetProps) {
  const theme = useAppTheme();
  const [, profileFetcherLoad] = useRequest(loadProfile);
  const [, profileFetcherSubmit] = useMutation(updateProfile);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const wasVisible = useRef(false);

  useEffect(() => {
    const opened = visible && !wasVisible.current;
    wasVisible.current = visible;

    if (!opened) return;

    if (initialProfile) {
      setName(initialProfile.name);
      setError('');

      return;
    }

    const loadProfile = async () => {
      setLoading(true);
      setError('');
      const result = await profileFetcherLoad();
      setLoading(false);

      if (!result.data) {
        setError(result.error || 'Could not load your name.');

        return;
      }

      setName(result.data.name);
    };
    void loadProfile();
  }, [initialProfile, profileFetcherLoad, visible]);

  const save = async () => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      setError('Enter a name.');

      return;
    }

    setLoading(true);
    setError('');
    const result = await profileFetcherSubmit({ name: trimmedName });
    setLoading(false);

    if (!result.data) {
      setError(result.error || 'Could not save your name.');

      return;
    }

    setName(result.data.name);
    onSaved(result.data);
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      backdropColor={theme.background}
      presentationStyle="pageSheet"
      visible={visible}
      onRequestClose={onClose}
    >
      <Screen showGrid={false}>
        <SafeAreaView pageSheet edges={['top', 'bottom']} style={safeAreaStyle}>
          <View className="flex-row items-center justify-between gap-4 px-5 py-4">
            <Heading>Profile</Heading>
            <IconButton
              accessibilityLabel="Close profile settings"
              icon="close"
              onPress={onClose}
            />
          </View>
          <View className="gap-4 px-5">
            <Card>
              <Copy>
                Your display name appears beside items you add and follows this
                device across every room. It does not need to be unique.
              </Copy>
              <Field
                autoCapitalize="words"
                editable={!loading}
                maxLength={displayNameMaxLength}
                onChangeText={setName}
                onSubmitEditing={() => void save()}
                placeholder={
                  loading && !name ? 'Loading your profile…' : 'Display name'
                }
                value={name}
              />
              {Boolean(error) && <Copy muted>{error}</Copy>}
              {Boolean(name) && (
                <Copy muted>New items will show “Added by {name}”.</Copy>
              )}
              <Button
                disabled={loading || !name.trim()}
                label={loading ? 'Saving…' : 'Save profile'}
                onPress={() => void save()}
              />
            </Card>
          </View>
        </SafeAreaView>
      </Screen>
    </Modal>
  );
}

const safeAreaStyle = { flex: 1 };
