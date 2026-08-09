import Constants from 'expo-constants';
import { useState } from 'react';
import { Linking, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Card, Copy, Heading, Screen } from '@/components/native';
import { RoomSettingsSheet } from '@/components/room-settings-sheet';
import { useApp } from '@/providers/app-provider';

export default function SettingsScreen() {
  const { providers, refresh, room } = useApp();
  const [roomSettingsVisible, setRoomSettingsVisible] = useState(false);
  return (
    <Screen>
      <SafeAreaView className="flex-1" edges={['top']}>
        <ScrollView contentContainerClassName="gap-4 p-4 pb-28">
          <Heading>Settings</Heading>
          <Card>
            <Copy muted>ACTIVE ROOM</Copy>
            <Copy>{room?.name ?? 'No room joined'}</Copy>
            <Copy muted>
              {room
                ? `${room.mode} mode · ${room.settings.enabledSources.join(', ')}`
                : 'Join a room to begin.'}
            </Copy>
            {room && (
              <Button
                label="Room controls"
                tone="secondary"
                onPress={() => setRoomSettingsVisible(true)}
              />
            )}
          </Card>
          <Card>
            <Copy muted>MUSIC PROVIDERS</Copy>
            <Copy>
              {providers.length
                ? providers.join(' · ')
                : 'No providers enabled'}
            </Copy>
            <Copy muted>
              Provider playback uses each provider’s official embedded player
              and controls.
            </Copy>
          </Card>
          <Card>
            <Copy muted>ABOUT</Copy>
            <Copy>
              Zoff Mobile {Constants.expoConfig?.version ?? 'development'}
            </Copy>
            <Button
              label="Privacy policy"
              tone="secondary"
              onPress={() =>
                void Linking.openURL('https://zoff.me/privacy-policy')
              }
            />
            <Button
              label="Terms of service"
              tone="secondary"
              onPress={() =>
                void Linking.openURL('https://zoff.me/terms-of-service')
              }
            />
          </Card>
          {room && (
            <RoomSettingsSheet
              providers={providers}
              room={room}
              visible={roomSettingsVisible}
              onClose={() => setRoomSettingsVisible(false)}
              onUpdated={refresh}
            />
          )}
        </ScrollView>
      </SafeAreaView>
    </Screen>
  );
}
