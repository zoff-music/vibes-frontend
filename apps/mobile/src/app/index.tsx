import { useRoomRequests } from '@vibes/api';
import type { PublicRoom } from '@vibes/models';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AnimatedLogo } from '@/components/animated-logo';
import { CreateRoomSheet } from '@/components/create-room-sheet';
import {
  Button,
  Card,
  ContentColumn,
  Copy,
  Field,
  Heading,
  Screen,
} from '@/components/native';
import { mobileApi } from '@/lib/api';
import { useApp } from '@/providers/app-provider';

export default function RoomsScreen() {
  const roomRequests = useRoomRequests(mobileApi);
  const { error, loading, providers, room, roomId, setError, setRoomId } =
    useApp();
  const router = useRouter();
  const [value, setValue] = useState(roomId);
  const [publicRooms, setPublicRooms] = useState<PublicRoom[]>([]);
  const [createVisible, setCreateVisible] = useState(false);

  useEffect(() => setValue(roomId), [roomId]);
  useEffect(() => {
    const loadRooms = async () => {
      const [, rooms] = await roomRequests.fetchPublicRooms();
      setPublicRooms(rooms ?? []);
    };
    void loadRooms();
  }, [roomRequests]);

  const joinRoom = async (roomName: string) => {
    const result = await setRoomId(roomName);
    if (result === 'joined') {
      router.navigate('/player');
      return;
    }
    if (result === 'notFound') {
      setError('');
      setCreateVisible(true);
    }
  };

  const submitRoom = () => {
    if (!value.trim()) {
      setCreateVisible(true);
      return;
    }
    void joinRoom(value);
  };

  const handleCreated = async (roomName: string, roomPassword: string) => {
    const result = await setRoomId(roomName, roomPassword);
    if (result !== 'joined') return false;
    router.navigate('/player');
    return true;
  };

  let submitLabel = value.trim() ? 'Join room' : 'Start a session';
  if (loading) {
    submitLabel = 'Checking room…';
  }

  return (
    <Screen>
      <SafeAreaView className="flex-1" edges={['top']}>
        <ScrollView
          contentContainerClassName="px-4 pt-3 pb-28"
          keyboardShouldPersistTaps="handled"
        >
          <ContentColumn>
            <View className="gap-5">
              <View className="items-center gap-3 py-3">
                <AnimatedLogo />
                <View className="items-center gap-1">
                  <Text className="font-heading text-3xl text-mobile-text dark:text-mobile-dark-text">
                    Listen together
                  </Text>
                  <Text className="px-5 text-center font-heading text-mobile-muted text-sm dark:text-mobile-dark-muted">
                    Shared rooms, synchronized playback, and a queue everyone
                    can shape.
                  </Text>
                </View>
              </View>
              <Card>
                <View className="gap-1">
                  <Copy muted>FIND YOUR SIGNAL</Copy>
                  <Heading>Join a room</Heading>
                </View>
                <Field
                  autoCapitalize="none"
                  value={value}
                  onChangeText={setValue}
                  onSubmitEditing={submitRoom}
                  placeholder="Room name"
                />
                <Button
                  disabled={loading}
                  label={submitLabel}
                  onPress={submitRoom}
                />
                {Boolean(error) && (
                  <Text className="font-heading text-error text-xs">
                    {error}
                  </Text>
                )}
                {room && <Copy muted>Currently in {room.name}</Copy>}
              </Card>
              <View className="gap-3">
                <View className="flex-row items-center gap-2 px-1">
                  <View className="size-2 rounded-full bg-accent" />
                  <Copy muted>LIVE NOW</Copy>
                </View>
                <FlatList
                  data={publicRooms}
                  keyExtractor={(item) => item.id}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  ItemSeparatorComponent={() => <View className="w-3" />}
                  renderItem={({ item }) => (
                    <Pressable
                      className="w-64 gap-3 rounded-3xl border border-mobile-border bg-mobile-card/95 p-5 active:opacity-70 dark:border-mobile-dark-border dark:bg-mobile-dark-card/95"
                      onPress={() => {
                        setValue(item.id);
                        void joinRoom(item.id);
                      }}
                    >
                      <Text
                        numberOfLines={1}
                        className="font-heading text-mobile-text text-xl dark:text-mobile-dark-text"
                      >
                        {item.name}
                      </Text>
                      <View className="flex-row items-center justify-between">
                        <Copy muted>{item.listenerCount} listening</Copy>
                        <Copy muted>{item.songCount} songs</Copy>
                      </View>
                      <Text className="font-heading text-accent text-sm">
                        Join room →
                      </Text>
                    </Pressable>
                  )}
                  ListEmptyComponent={
                    <View className="rounded-3xl border border-mobile-border bg-mobile-card/70 px-5 py-6 dark:border-mobile-dark-border dark:bg-mobile-dark-card/70">
                      <Copy muted>
                        No public rooms are live. Start one and set the signal.
                      </Copy>
                    </View>
                  }
                />
              </View>
            </View>
          </ContentColumn>
        </ScrollView>
        <CreateRoomSheet
          initialName={value}
          providers={providers}
          visible={createVisible}
          onClose={() => setCreateVisible(false)}
          onCreated={handleCreated}
        />
      </SafeAreaView>
    </Screen>
  );
}
