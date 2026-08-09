import { useRoomRequests } from '@vibes/api';
import type { Providers } from '@vibes/models';
import { DEFAULT_ROOM_SETTINGS } from '@vibes/shared';
import { useEffect, useState } from 'react';
import { Modal, ScrollView, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  Button,
  Card,
  Copy,
  Field,
  Heading,
  Screen,
} from '@/components/native';
import { useAppTheme } from '@/hooks/use-app-theme';
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
  const theme = useAppTheme();
  const [name, setName] = useState(initialName);
  const [password, setPassword] = useState('');
  const [hostMode, setHostMode] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!visible) return;
    setName(initialName);
    setError('');
  }, [initialName, visible]);

  const createRoom = async () => {
    const normalizedName = name.trim().toLowerCase().replace(/\s+/g, '-');
    if (!normalizedName) {
      setError('Room name is required.');
      return;
    }
    if (isPublic && !password) {
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
      mode: hostMode ? 'host' : 'server',
      password: password || undefined,
      reservationToken: reservation.token,
      settings: {
        ...DEFAULT_ROOM_SETTINGS,
        enabledSources: providers,
        public: isPublic,
      },
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
          <View className="flex-row items-center justify-between p-4">
            <Heading>Create a room</Heading>
            <Button label="Cancel" tone="secondary" onPress={onClose} />
          </View>
          <ScrollView
            contentContainerClassName="gap-4 px-4 pb-8"
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
                  if (!value) setIsPublic(false);
                }}
                placeholder="Admin password (optional)"
              />
            </Card>
            <Card>
              <View className="flex-row items-center justify-between gap-4">
                <View className="flex-1 gap-1">
                  <Copy>Host mode</Copy>
                  <Copy muted>Host controls synchronized playback.</Copy>
                </View>
                <Switch
                  ios_backgroundColor={theme.surface}
                  trackColor={{ false: theme.surface, true: theme.accent }}
                  value={hostMode}
                  onValueChange={setHostMode}
                />
              </View>
              <View className="flex-row items-center justify-between gap-4">
                <View className="flex-1 gap-1">
                  <Copy>Public while active</Copy>
                  <Copy muted>
                    {password
                      ? 'Show this room when listeners are active.'
                      : 'Requires an admin password.'}
                  </Copy>
                </View>
                <Switch
                  disabled={!password}
                  ios_backgroundColor={theme.surface}
                  trackColor={{ false: theme.surface, true: theme.accent }}
                  value={isPublic}
                  onValueChange={setIsPublic}
                />
              </View>
            </Card>
            <Copy muted>
              New rooms start with democratic voting, queue looping, and all
              currently available providers enabled.
            </Copy>
            {Boolean(error) && (
              <Text className="font-mono text-error text-xs">{error}</Text>
            )}
            <Button
              disabled={loading || !name.trim() || providers.length === 0}
              label={loading ? 'Creating…' : 'Create room'}
              onPress={() => void createRoom()}
            />
          </ScrollView>
        </SafeAreaView>
      </Screen>
    </Modal>
  );
}
