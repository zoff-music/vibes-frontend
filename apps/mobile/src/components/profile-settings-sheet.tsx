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
  onClose: () => void;
  visible: boolean;
}

export function ProfileSettingsSheet({
  onClose,
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
  }, [profileFetcher.load, visible]);

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
  };

  return (
    <Modal
      animationType="slide"
      presentationStyle="pageSheet"
      visible={visible}
      onRequestClose={onClose}
    >
      <Screen>
        <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
          <View className="flex-row items-center justify-between gap-4 px-5 py-4">
            <Heading>Your name</Heading>
            <IconButton
              accessibilityLabel="Close name settings"
              icon="close"
              onPress={onClose}
            />
          </View>
          <View className="gap-4 px-5">
            <Card>
              <Copy>
                This name shows who added songs. It follows this device across
                all rooms, and names do not need to be unique.
              </Copy>
              <Field
                autoCapitalize="words"
                editable={!loading}
                maxLength={30}
                onChangeText={setName}
                onSubmitEditing={() => void save()}
                placeholder={
                  loading && !name ? 'Finding your name…' : 'Your name'
                }
                value={name}
              />
              {error ? <Copy muted>{error}</Copy> : null}
              {name ? (
                <Copy muted>Songs you add will be credited to {name}.</Copy>
              ) : null}
              <Button
                disabled={loading || !name.trim()}
                label={loading ? 'Saving…' : 'Save name'}
                onPress={() => void save()}
              />
            </Card>
          </View>
        </SafeAreaView>
      </Screen>
    </Modal>
  );
}
