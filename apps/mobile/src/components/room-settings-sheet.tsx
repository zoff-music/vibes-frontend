import type { Providers, Room, RoomSettings } from '@vibes/models';
import { useFetcher } from '@vibes/native-router';
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
import { Toast, ToastViewport } from '@/components/toast';
import type { ControllerRoomActionData } from '@/routes/remotes.controller.$id.room/action';
import type { RoomSessionActionData } from '@/routes/rooms.$id.session/action';
import type { RoomSettingsActionData } from '@/routes/rooms.$id.settings/action';

interface RoomSettingsSheetProps {
  controllerToken?: string;
  onAuthenticated?: (roomId: string, password: string) => Promise<void>;
  onClose: () => void;
  onLoggedOut?: (roomId: string) => Promise<void>;
  onUpdated: () => Promise<void>;
  providers: Providers;
  remoteId?: string;
  room: Room;
  visible: boolean;
}

export function RoomSettingsSheet({
  controllerToken,
  onAuthenticated,
  onClose,
  onLoggedOut,
  onUpdated,
  providers,
  remoteId,
  room,
  visible,
}: RoomSettingsSheetProps) {
  const [, roomSessionFetcher] = useFetcher<RoomSessionActionData>({
    params: { id: room.id },
    routeId: 'rooms.$id.session',
  });
  const [, roomSettingsFetcher] = useFetcher<RoomSettingsActionData>({
    params: { id: room.id },
    routeId: 'rooms.$id.settings',
  });
  const [, remoteFetcher] = useFetcher<ControllerRoomActionData>({
    params: { controllerToken: controllerToken ?? '', id: remoteId ?? '' },
    routeId: 'remotes.controller.$id.room',
  });
  const submitRoomSession = roomSessionFetcher.submit;
  const submitRoomSettings = roomSettingsFetcher.submit;
  const submitRemote = remoteFetcher.submit;
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
    const submittedPassword = password.trim();
    if (!submittedPassword) {
      setError(
        activeRoom.hasPassword
          ? 'Enter the room admin password.'
          : 'Enter a new admin password.',
      );
      return;
    }
    setLoading(true);
    const result = controllerToken
      ? await submitRemote({
          intent: 'authenticate',
          password: submittedPassword,
          roomId: activeRoom.id,
        })
      : await submitRoomSession({
          intent: 'authenticate',
          password: submittedPassword,
        });
    if (result.data?.intent !== 'roomUpdated') {
      setLoading(false);
      setError(result.error || 'The admin password was not accepted.');
      return;
    }
    setLoading(false);
    setActiveRoom(result.data.room);
    setSettings(result.data.room.settings);
    setMode(result.data.room.mode);
    setPassword('');
    setError('warning' in result.data ? result.data.warning : '');
    await onUpdated();
    if (onAuthenticated) {
      await onAuthenticated(activeRoom.id, submittedPassword);
    }
  };

  const save = async (nextMode: Room['mode'], nextSettings: RoomSettings) => {
    setLoading(true);
    setError('');
    const result = controllerToken
      ? await submitRemote({
          intent: 'settings',
          roomId: activeRoom.id,
          update: { mode: nextMode, settings: nextSettings },
        })
      : await submitRoomSettings({
          update: { mode: nextMode, settings: nextSettings },
        });
    setLoading(false);
    const updatedRoom =
      result.data && 'room' in result.data ? result.data.room : null;
    if (!updatedRoom) {
      setMode(activeRoom.mode);
      setSettings(activeRoom.settings);
      setError(result.error || 'Could not update room settings.');
      return;
    }
    setActiveRoom(updatedRoom);
    setMode(updatedRoom.mode);
    setSettings(updatedRoom.settings);
    setError(
      result.data &&
        'warning' in result.data &&
        typeof result.data.warning === 'string'
        ? result.data.warning
        : '',
    );
    await onUpdated();
  };

  const logOut = async () => {
    setLoading(true);
    setError('');
    const result = controllerToken
      ? await submitRemote({
          intent: 'logout',
          roomId: activeRoom.id,
        })
      : await submitRoomSession({ intent: 'logoutAdmin' });
    if (result.error || result.data?.intent !== 'success') {
      setLoading(false);
      setError(result.error || 'Could not sign out as room admin.');
      return;
    }
    if (onLoggedOut) {
      await onLoggedOut(activeRoom.id);
    }
    const guestRoom = {
      ...activeRoom,
      isAdmin: false,
    };
    setActiveRoom(guestRoom);
    setSettings(guestRoom.settings);
    setMode(guestRoom.mode);
    setError('warning' in result.data ? result.data.warning : '');
    setLoading(false);
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
          {error && (
            <Text
              accessibilityLiveRegion="assertive"
              accessibilityRole="alert"
              className="font-heading text-error text-sm"
            >
              {error}
            </Text>
          )}
        </Card>
      )}
      {activeRoom.isAdmin && (
        <Card>
          <Copy muted>ADMIN ACCESS</Copy>
          <Copy muted>
            You are authenticated as this room&apos;s admin. Logging out removes
            the saved password from this device.
          </Copy>
          <Button
            disabled={loading}
            label={loading ? 'Logging out…' : 'Log out'}
            tone="danger"
            onPress={() => void logOut()}
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
      {!needsAdminAccess && <Toast message={error} />}
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
            contentContainerClassName="px-5 pb-10"
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

const sheetItems = ['room-settings'];
