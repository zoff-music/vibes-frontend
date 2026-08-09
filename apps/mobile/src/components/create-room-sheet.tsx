import { useRoomRequests } from '@vibes/api';
import type { Providers, RoomSettings } from '@vibes/models';
import { DEFAULT_ROOM_SETTINGS } from '@vibes/shared';
import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  Button,
  Card,
  Copy,
  Field,
  Heading,
  Screen,
} from '@/components/native';
import { RoomConfiguration } from '@/components/room-configuration';
import { getRequestErrorMessage, mobileApi } from '@/lib/api';

interface CreateRoomSheetProps {
  initialName: string;
  onClose: () => void;
  onCreated: (roomId: string, password: string) => Promise<boolean>;
  providers: Providers;
  visible: boolean;
}

export function CreateRoomSheet({
  initialName,
  onClose,
  onCreated,
  providers,
  visible,
}: CreateRoomSheetProps) {
  const roomRequests = useRoomRequests(mobileApi);
  const [name, setName] = useState(initialName);
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'host' | 'server'>('server');
  const [settings, setSettings] = useState<RoomSettings>({
    ...DEFAULT_ROOM_SETTINGS,
    enabledSources: providers,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!visible) return;
    setName(initialName);
    setPassword('');
    setMode('server');
    setSettings({
      ...DEFAULT_ROOM_SETTINGS,
      enabledSources: providers,
    });
    setError('');
  }, [initialName, providers, visible]);

  const createRoom = async () => {
    const normalizedName = name.trim().toLowerCase().replace(/\s+/g, '-');
    if (!normalizedName) {
      setError('Room name is required.');
      return;
    }
    if (settings.public && !password) {
      setError('Add an admin password before making this room public.');
      return;
    }
    if (providers.length === 0) {
      setError('Music providers are still loading. Try again in a moment.');
      return;
    }

    setLoading(true);
    const [reservationError, reservation] =
      await roomRequests.reserveRoom(normalizedName);
    if (reservationError || !reservation) {
      setLoading(false);
      setError(
        await getRequestErrorMessage(
          reservationError,
          'Could not reserve this room name.',
        ),
      );
      return;
    }

    const [requestError, room] = await roomRequests.createRoom({
      name: normalizedName,
      mode,
      password: password || undefined,
      reservationToken: reservation.token,
      settings,
    });
    setLoading(false);
    if (requestError || !room) {
      setError(
        await getRequestErrorMessage(
          requestError,
          'Could not create this room.',
        ),
      );
      return;
    }

    const joined = await onCreated(room.id, password);
    if (joined) onClose();
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
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            className="flex-1"
          >
            <View className="flex-row items-center justify-between gap-4 px-5 py-4">
              <Heading>Create a room</Heading>
              <Button label="Cancel" tone="secondary" onPress={onClose} />
            </View>
            <ScrollView
              contentContainerClassName="gap-5 px-5 pb-10"
              keyboardShouldPersistTaps="handled"
            >
              <Card>
                <Copy muted>ROOM DETAILS</Copy>
                <Field
                  autoCapitalize="none"
                  value={name}
                  onChangeText={setName}
                  placeholder="Room name"
                />
                <Field
                  autoCapitalize="none"
                  secureTextEntry
                  value={password}
                  onChangeText={(value) => {
                    setPassword(value);
                    if (!value) {
                      setSettings((current) => ({
                        ...current,
                        public: false,
                      }));
                    }
                  }}
                  placeholder="Admin password (optional)"
                />
                <Copy muted>
                  The admin password is only used for room controls and can be
                  entered later from room settings.
                </Copy>
              </Card>
              <RoomConfiguration
                hasPassword={Boolean(password)}
                mode={mode}
                providers={providers}
                settings={settings}
                onModeChange={setMode}
                onSettingsChange={setSettings}
              />
              {Boolean(error) && (
                <Text className="font-heading text-error text-xs">{error}</Text>
              )}
              <Button
                disabled={
                  loading ||
                  !name.trim() ||
                  providers.length === 0 ||
                  settings.enabledSources.length === 0
                }
                label={loading ? 'Creating…' : 'Create room'}
                onPress={() => void createRoom()}
              />
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Screen>
    </Modal>
  );
}
