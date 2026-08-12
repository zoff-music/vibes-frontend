import { useRoomRequests } from '@vibes/api';
import type {
  Providers,
  RoomNameReservation,
  RoomSettings,
} from '@vibes/models';
import { DEFAULT_ROOM_SETTINGS } from '@vibes/shared';
import { useEffect, useState } from 'react';
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
  const [reservation, setReservation] = useState<RoomNameReservation | null>(
    null,
  );

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
    setReservation(null);
    if (initialName.trim()) return;
    const generateName = async () => {
      const [requestError, nextReservation] = await roomRequests.reserveRoom();
      if (requestError || !nextReservation) {
        setError(
          await getRequestErrorMessage(
            requestError,
            'Could not generate a room name.',
          ),
        );
        return;
      }
      setName(nextReservation.name);
      setReservation(nextReservation);
    };
    void generateName();
  }, [initialName, providers, roomRequests, visible]);

  const generateName = async () => {
    const [requestError, nextReservation] = await roomRequests.reserveRoom();
    if (requestError || !nextReservation) {
      setError(
        await getRequestErrorMessage(
          requestError,
          'Could not generate a room name.',
        ),
      );
      return;
    }
    setName(nextReservation.name);
    setReservation(nextReservation);
    setError('');
  };

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
    if (settings.enabledSources.length === 0) {
      setError('Enable at least one music provider.');
      return;
    }

    setLoading(true);
    let roomReservation = reservation;
    if (!roomReservation || roomReservation.name !== normalizedName) {
      const [reservationError, nextReservation] =
        await roomRequests.reserveRoom(normalizedName);
      if (reservationError || !nextReservation) {
        setLoading(false);
        setError(
          await getRequestErrorMessage(
            reservationError,
            'Could not reserve this room name.',
          ),
        );
        return;
      }
      roomReservation = nextReservation;
    }
    if (!roomReservation) {
      setLoading(false);
      setError('Could not reserve this room name.');
      return;
    }

    const [requestError, room] = await roomRequests.createRoom({
      name: normalizedName,
      mode,
      reservationToken: roomReservation.token,
      settings,
      ...(password ? { password } : {}),
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

  const renderSettings = () => (
    <View className="gap-5">
      <Card>
        <Copy muted>ROOM DETAILS</Copy>
        <Field
          autoCapitalize="none"
          value={name}
          onChangeText={(value) => {
            setName(value);
            setReservation(null);
          }}
          placeholder="Room name"
        />
        <Button
          icon="reset"
          label="Generate another name"
          tone="secondary"
          onPress={() => void generateName()}
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
          The admin password protects room controls and can also be added later
          from room settings.
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
      <Toast message={error} />
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
            <Heading>Create a room</Heading>
            <IconButton
              accessibilityLabel="Close create room"
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

const sheetItems = ['create-room'];
