import type { SessionProfile } from '@vibes/models';
import { useFetcher } from '@vibes/native-router';
import { useEffect, useRef, useState } from 'react';
import { Modal, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Button,
  Card,
  Copy,
  Field,
  Heading,
  IconButton,
  Screen,
} from '@/components/native';

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
  const [, profileFetcher] = useFetcher<SessionProfile>({
    routeId: 'sessions.profile',
  });
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
      const result = await profileFetcher.load();
      setLoading(false);
      if (!result.data) {
        setError(result.error || 'Could not load your name.');
        return;
      }
      setName(result.data.name);
    };
    void loadProfile();
  }, [initialProfile, profileFetcher.load, visible]);

  const save = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Enter a name.');
      return;
    }
    setLoading(true);
    setError('');
    const result = await profileFetcher.submit({ name: trimmedName });
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
      presentationStyle="pageSheet"
      visible={visible}
      onRequestClose={onClose}
    >
      <Screen>
        <SafeAreaView edges={['top', 'bottom']} style={safeAreaStyle}>
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
                Your display name appears beside songs you add and follows this
                device across every room. It does not need to be unique.
              </Copy>
              <Field
                autoCapitalize="words"
                editable={!loading}
                maxLength={30}
                onChangeText={setName}
                onSubmitEditing={() => void save()}
                placeholder={
                  loading && !name ? 'Loading your profile…' : 'Display name'
                }
                value={name}
              />
              {error ? <Copy muted>{error}</Copy> : null}
              {name ? (
                <Copy muted>New songs will show “Added by {name}”.</Copy>
              ) : null}
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
