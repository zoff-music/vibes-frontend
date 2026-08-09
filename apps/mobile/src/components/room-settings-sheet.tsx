import { type ApiClient, useRemoteRequests, useRoomRequests } from '@vibes/api';
import type { Providers, Room, RoomSettings, SourceType } from '@vibes/models';
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

interface RoomSettingsSheetProps {
  client?: ApiClient;
  onClose: () => void;
  onUpdated: () => Promise<void>;
  providers: Providers;
  remoteId?: string;
  room: Room;
  visible: boolean;
}

interface SettingsSwitchProps {
  description: string;
  disabled?: boolean;
  label: string;
  onValueChange: (value: boolean) => void;
  value: boolean;
}

function SettingsSwitch({
  description,
  disabled,
  label,
  onValueChange,
  value,
}: SettingsSwitchProps) {
  const theme = useAppTheme();
  return (
    <View className="flex-row items-center justify-between gap-4">
      <View className="flex-1 gap-1">
        <Copy>{label}</Copy>
        <Copy muted>{description}</Copy>
      </View>
      <Switch
        disabled={disabled}
        ios_backgroundColor={theme.surface}
        trackColor={{ false: theme.surface, true: theme.accent }}
        value={value}
        onValueChange={onValueChange}
      />
    </View>
  );
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

  const updateSetting = <Key extends keyof RoomSettings>(
    key: Key,
    value: RoomSettings[Key],
  ) => setSettings((current) => ({ ...current, [key]: value }));

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

  const toggleProvider = (provider: SourceType, enabled: boolean) => {
    const enabledSources = enabled
      ? [...settings.enabledSources, provider]
      : settings.enabledSources.filter((source) => source !== provider);
    updateSetting('enabledSources', [...new Set(enabledSources)]);
  };

  const enabledProviders = supportedProviders.filter((provider) =>
    providers.includes(provider),
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
          <View className="flex-row items-center justify-between p-4">
            <Heading>Room settings</Heading>
            <Button label="Done" tone="secondary" onPress={onClose} />
          </View>
          <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
            {!activeRoom.isAdmin && (
              <View className="gap-4 px-4 pb-8">
                <Card>
                  <Copy muted>ADMIN ACCESS</Copy>
                  <Copy muted>
                    Authenticate here to control this room from the phone or
                    paired machine.
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
                {Boolean(error) && (
                  <Text className="font-mono text-error text-xs">{error}</Text>
                )}
              </View>
            )}
            {activeRoom.isAdmin && (
              <View className="gap-4 px-4 pb-8">
                <Card>
                  <SettingsSwitch
                    description="The host controls synchronized playback."
                    label="Host mode"
                    value={mode === 'host'}
                    onValueChange={(enabled) =>
                      setMode(enabled ? 'host' : 'server')
                    }
                  />
                  <SettingsSwitch
                    description="Anyone can request the next song."
                    label="Allow skip"
                    value={settings.skipAllowed}
                    onValueChange={(value) =>
                      updateSetting('skipAllowed', value)
                    }
                  />
                  <SettingsSwitch
                    description="Require votes before skipping."
                    label="Democratic skip"
                    value={settings.democraticSkip}
                    onValueChange={(value) =>
                      updateSetting('democraticSkip', value)
                    }
                  />
                  <SettingsSwitch
                    description="Restart the queue when it ends."
                    label="Loop queue"
                    value={settings.loopQueue}
                    onValueChange={(value) => updateSetting('loopQueue', value)}
                  />
                  <SettingsSwitch
                    description="Remove each song after playback."
                    label="Remove played"
                    value={settings.removeOnPlay}
                    onValueChange={(value) =>
                      updateSetting('removeOnPlay', value)
                    }
                  />
                  <SettingsSwitch
                    description="Allow the same song more than once."
                    label="Allow duplicates"
                    value={settings.allowDuplicates}
                    onValueChange={(value) =>
                      updateSetting('allowDuplicates', value)
                    }
                  />
                  <SettingsSwitch
                    description="Only room admins may add songs."
                    label="Admins only add"
                    value={settings.onlyAdminAddSongs ?? false}
                    onValueChange={(value) =>
                      updateSetting('onlyAdminAddSongs', value)
                    }
                  />
                  <SettingsSwitch
                    description={
                      activeRoom.hasPassword
                        ? 'Show while listeners are active.'
                        : 'Requires an admin password.'
                    }
                    disabled={!activeRoom.hasPassword}
                    label="Public while active"
                    value={settings.public}
                    onValueChange={(value) => updateSetting('public', value)}
                  />
                </Card>
                <Card>
                  <Copy muted>PROVIDERS</Copy>
                  {enabledProviders.map((provider) => (
                    <SettingsSwitch
                      key={provider}
                      description={`Allow ${provider} songs in this room.`}
                      label={provider}
                      value={settings.enabledSources.includes(provider)}
                      onValueChange={(enabled) =>
                        toggleProvider(provider, enabled)
                      }
                    />
                  ))}
                </Card>
                {Boolean(error) && (
                  <Text className="font-mono text-error text-xs">{error}</Text>
                )}
                <Button
                  disabled={loading || settings.enabledSources.length === 0}
                  label={loading ? 'Saving…' : 'Save settings'}
                  onPress={() => void save()}
                />
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </Screen>
    </Modal>
  );
}

const supportedProviders: SourceType[] = ['youtube', 'spotify', 'soundcloud'];
