import { useRoomRequests } from '@vibes/api';
import type { PublicRoom } from '@vibes/models';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CreateRoomSheet } from '@/components/create-room-sheet';
import {
  Button,
  Card,
  Copy,
  Field,
  Heading,
  Screen,
} from '@/components/native';
import { mobileApi } from '@/lib/api';
import { useApp } from '@/providers/app-provider';

export default function RoomsScreen() {
  const roomRequests = useRoomRequests(mobileApi);
  const { error, loading, providers, room, roomId, setRoomId } = useApp();
  const router = useRouter();
  const [value, setValue] = useState(roomId);
  const [password, setPassword] = useState('');
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
    const result = await setRoomId(roomName, password);
    if (result === 'joined') {
      router.navigate('/player');
      return;
    }
    if (result === 'notFound') setCreateVisible(true);
  };

  const join = () => void joinRoom(value);

  const handleCreated = async (roomName: string, roomPassword: string) => {
    const result = await setRoomId(roomName, roomPassword);
    if (result !== 'joined') return false;
    router.navigate('/player');
    return true;
  };

  return (
    <Screen>
      <SafeAreaView className="flex-1" edges={['top']}>
        <View className="items-center gap-2 p-6">
          <Text className="font-black text-5xl text-mobile-text dark:text-mobile-dark-text">
            ゾフ
          </Text>
          <Copy muted>Shared music rooms, made for listening together.</Copy>
        </View>
        <View className="flex-1 gap-4 p-4">
          <Card>
            <Heading>Join a room</Heading>
            <Field
              autoCapitalize="none"
              value={value}
              onChangeText={setValue}
              onSubmitEditing={join}
              placeholder="Room name"
            />
            <Field
              autoCapitalize="none"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              onSubmitEditing={join}
              placeholder="Room password (if required)"
            />
            <Button
              disabled={loading || !value.trim()}
              label={loading ? 'Joining…' : 'Join room'}
              onPress={join}
            />
            {Boolean(error) && (
              <Text className="font-mono text-error text-xs">{error}</Text>
            )}
            {room && <Copy muted>Currently in {room.name}</Copy>}
          </Card>
          <Copy muted>LIVE NOW</Copy>
          <FlatList
            data={publicRooms}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            ItemSeparatorComponent={() => <View className="w-3" />}
            renderItem={({ item }) => (
              <Pressable
                className="w-60 gap-2 rounded-3xl border border-mobile-border bg-mobile-card p-4 active:opacity-70 dark:border-mobile-dark-border dark:bg-mobile-dark-card"
                onPress={() => {
                  setValue(item.id);
                  void joinRoom(item.id);
                }}
              >
                <Text
                  numberOfLines={1}
                  className="font-bold font-mono text-base text-mobile-text dark:text-mobile-dark-text"
                >
                  {item.name}
                </Text>
                <Copy muted>
                  {item.listenerCount} listening · {item.songCount} songs
                </Copy>
              </Pressable>
            )}
            ListEmptyComponent={
              <Copy muted>No public rooms are live right now.</Copy>
            }
          />
        </View>
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
