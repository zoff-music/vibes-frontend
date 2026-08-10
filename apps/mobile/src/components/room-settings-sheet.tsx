import { type ApiClient, useRemoteRequests, useRoomRequests } from '@vibes/api';
import type { Providers, Room, RoomSettings } from '@vibes/models';
import { useEffect, useRef, useState } from 'react';
import { FlatList, Modal, View } from 'react-native';
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
import { Toast, ToastViewport } from '@/components/toast';
import { getRequestErrorMessage, mobileApi } from '@/lib/api';

interface RoomSettingsSheetProps {
  client?: ApiClient;
  onAuthenticated?: (roomId: string, password: string) => Promise<void>;
  onClose: () => void;
  onUpdated: () => Promise<void>;
  providers: Providers;
  remoteId?: string;
  room: Room;
  visible: boolean;
}

export function RoomSettingsSheet({
  client = mobileApi,
  onAuthenticated,
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
    if (!password.trim()) {
      setError(
        activeRoom.hasPassword
          ? 'Enter the room admin password.'
          : 'Enter a new admin password.',
      );
      return;
    }
    setLoading(true);
    const [requestError, session] = await roomRequests.joinRoom(
      activeRoom.id,
      password,
    );
    if (requestError || !session) {
      setLoading(false);
      setError(
        await getRequestErrorMessage(
          requestError,
          'The admin password was not accepted. Check it and try again.',
        ),
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
    if (onAuthenticated) {
      await onAuthenticated(activeRoom.id, password);
    }
    setPassword('');
    await onUpdated();
  };

  const save = async (nextMode: Room['mode'], nextSettings: RoomSettings) => {
    setLoading(true);
    setError('');
    const [requestError, updatedRoom] = await roomRequests.updateRoom(
      activeRoom.id,
      { mode: nextMode, settings: nextSettings },
    );
    setLoading(false);
    if (requestError || !updatedRoom) {
      setMode(activeRoom.mode);
      setSettings(activeRoom.settings);
      setError(
        await getRequestErrorMessage(
          requestError,
          'Could not update room settings.',
        ),
      );
      return;
    }
    setActiveRoom(updatedRoom);
    setMode(updatedRoom.mode);
    setSettings(updatedRoom.settings);
    await onUpdated();
  };

  const changeMode = (nextMode: Room['mode']) => {
    setMode(nextMode);
    void save(nextMode, settings);
  };

  const changeSettings = (nextSettings: RoomSettings) => {
    setSettings(nextSettings);
    void save(mode, nextSettings);
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
        disabled={!canEdit || loading}
        hasPassword={activeRoom.hasPassword}
        mode={mode}
        providers={providers}
        settings={settings}
        onModeChange={changeMode}
        onSettingsChange={changeSettings}
      />
      {loading && <Copy muted>Saving change…</Copy>}
      <Toast message={error} />
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
        <ToastViewport />
      </Screen>
    </Modal>
  );
}

const sheetContentStyle = {
  paddingBottom: 40,
  paddingHorizontal: 20,
};

const sheetItems = ['room-settings'];
