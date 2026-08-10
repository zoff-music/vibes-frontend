import { type ApiClient, useRemoteRequests, useRoomRequests } from '@vibes/api';
import type { Providers, Room } from '@vibes/models';
import { useEffect, useRef, useState } from 'react';
import { FlatList, Modal, Text, View } from 'react-native';
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
  const wasVisible = useRef(false);

  useEffect(() => {
    const opened = visible && !wasVisible.current;
    wasVisible.current = visible;
    if (!opened) return;
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
  const needsAdminAccess = !activeRoom.isAdmin;

  const renderSettings = () => (
    <View className="gap-5">
      {needsAdminAccess && (
        <Card>
          <Copy muted>ADMIN ACCESS</Copy>
          <Copy muted>
            {activeRoom.hasPassword
              ? 'Enter the room password to unlock changes. You can still review every setting below before authenticating.'
              : 'Add an admin password to protect room controls and unlock public-room visibility.'}
          </Copy>
          <Field
            autoCapitalize="none"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            onSubmitEditing={() => void authenticate()}
            placeholder={
              activeRoom.hasPassword ? 'Admin password' : 'New admin password'
            }
          />
          <Button
            disabled={loading || !password}
            label={
              loading
                ? 'Saving password…'
                : activeRoom.hasPassword
                  ? 'Authenticate'
                  : 'Add password'
            }
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
    </View>
  );

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
            <Heading>Room settings</Heading>
            <IconButton
              accessibilityLabel="Close room settings"
              icon="close"
              onPress={onClose}
            />
          </View>
          <FlatList
            contentContainerStyle={sheetContentStyle}
            data={sheetItems}
            keyExtractor={(item) => item}
            keyboardDismissMode="interactive"
            keyboardShouldPersistTaps="handled"
            renderItem={renderSettings}
          />
        </SafeAreaView>
      </Screen>
    </Modal>
  );
}

const sheetContentStyle = {
  paddingBottom: 40,
  paddingHorizontal: 20,
};

const sheetItems = ['room-settings'];
