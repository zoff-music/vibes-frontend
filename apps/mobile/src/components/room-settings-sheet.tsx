import { type ApiClient, useRemoteRequests, useRoomRequests } from '@vibes/api';
import type { Providers, Room } from '@vibes/models';
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

interface RoomSettingsSheetProps {
  client?: ApiClient;
  onClose: () => void;
  onUpdated: () => Promise<void>;
  providers: Providers;
  remoteId?: string;
  room: Room;
  visible: boolean;
}

export function RoomSettingsSheet({
  client = mobileApi,
  onClose,
  onUpdated,
  providers,
  remoteId,
  room,
  visible,
}: RoomSettingsSheetProps) {
  const remoteRequests = useRemoteRequests(client);
  const roomRequests = useRoomRequests(client);
  const [activeRoom, setActiveRoom] = useState(room);
  const [settings, setSettings] = useState(room.settings);
  const [mode, setMode] = useState(room.mode);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!visible) return;
    setActiveRoom(room);
    setSettings(room.settings);
    setMode(room.mode);
    setPassword('');
    setError('');
  }, [room, visible]);

  const authenticate = async () => {
    setLoading(true);
    const [requestError, session] = await roomRequests.joinRoom(
      activeRoom.id,
      password,
    );
    if (requestError || !session) {
      setLoading(false);
      setError(
        await getRequestErrorMessage(requestError, 'Authentication failed.'),
      );
      return;
    }
    if (remoteId) {
      const [remoteError] = await remoteRequests.updateRemote(remoteId, {
        roomId: activeRoom.id,
      });
      if (remoteError) {
        setLoading(false);
        setError(
          await getRequestErrorMessage(
            remoteError,
            'Could not authenticate the paired machine.',
          ),
        );
        return;
      }
    }
    setLoading(false);
    setActiveRoom(session.room);
    setSettings(session.room.settings);
    setMode(session.room.mode);
    setPassword('');
    await onUpdated();
  };

  const save = async () => {
    setLoading(true);
    const [requestError, updatedRoom] = await roomRequests.updateRoom(
      activeRoom.id,
      { mode, settings },
    );
    setLoading(false);
    if (requestError || !updatedRoom) {
      setError(
        await getRequestErrorMessage(
          requestError,
          'Could not update room settings.',
        ),
      );
      return;
    }
    setActiveRoom(updatedRoom);
    await onUpdated();
    onClose();
  };

  const canEdit = Boolean(activeRoom.isAdmin) || !activeRoom.hasPassword;

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
              <Heading>Room settings</Heading>
              <Button label="Done" tone="secondary" onPress={onClose} />
            </View>
            <ScrollView
              className="flex-1"
              contentContainerClassName="gap-5 px-5 pb-10"
              automaticallyAdjustKeyboardInsets
              keyboardDismissMode="interactive"
              keyboardShouldPersistTaps="handled"
            >
              {!canEdit && activeRoom.hasPassword && (
                <Card>
                  <Copy muted>ADMIN ACCESS</Copy>
                  <Copy muted>
                    Enter the room password to unlock changes. You can still
                    review every setting below before authenticating.
                  </Copy>
                  <Field
                    autoCapitalize="none"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                    onSubmitEditing={() => void authenticate()}
                    placeholder="Admin password"
                  />
                  <Button
                    disabled={loading || !password}
                    label={loading ? 'Authenticating…' : 'Authenticate'}
                    onPress={() => void authenticate()}
                  />
                </Card>
              )}
              <RoomConfiguration
                disabled={!canEdit}
                hasPassword={activeRoom.hasPassword}
                mode={mode}
                providers={providers}
                settings={settings}
                onModeChange={setMode}
                onSettingsChange={setSettings}
              />
              {Boolean(error) && (
                <Text className="font-heading text-error text-xs">{error}</Text>
              )}
              {canEdit && (
                <Button
                  disabled={loading || settings.enabledSources.length === 0}
                  label={loading ? 'Saving…' : 'Save settings'}
                  onPress={() => void save()}
                />
              )}
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Screen>
    </Modal>
  );
}
