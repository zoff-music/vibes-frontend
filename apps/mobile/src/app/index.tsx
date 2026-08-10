import { useRoomRequests } from '@vibes/api';
import type { PublicRoom } from '@vibes/models';
import { classNames } from '@vibes/shared';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
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
import { RoomScreen } from '@/components/room-screen';
import { ZoffIcon } from '@/components/zoff-icon';
import { useAppTheme } from '@/hooks/use-app-theme';
import { getRequestErrorMessage, mobileApi } from '@/lib/api';
import { useApp } from '@/providers/app-provider';

export default function RoomsScreen() {
  const theme = useAppTheme();
  const roomRequests = useRoomRequests(mobileApi);
  const {
    controllerRemote,
    error,
    loading,
    providers,
    room,
    roomId,
    setError,
    setRoomId,
    startGeneratedRoom,
  } = useApp();
  const [value, setValue] = useState(roomId);
  const [publicRooms, setPublicRooms] = useState<PublicRoom[]>([]);
  const [createVisible, setCreateVisible] = useState(false);
  const [isAIMode, setIsAIMode] = useState(false);
  const [generationLoading, setGenerationLoading] = useState(false);

  useEffect(() => setValue(roomId), [roomId]);
  useEffect(() => {
    const loadRooms = async () => {
      const [, rooms] = await roomRequests.fetchPublicRooms();
      setPublicRooms(rooms ?? []);
    };
    void loadRooms();
  }, [roomRequests]);

  const joinRoom = async (roomName: string) => {
    if (controllerRemote) {
      setError(
        'Disconnect the active remote before joining a room on this device.',
      );
      return;
    }
    const result = await setRoomId(roomName);
    if (result === 'joined') {
      return;
    }
    if (result === 'notFound') {
      setError('');
      setCreateVisible(true);
    }
  };

  const submitRoom = () => {
    if (controllerRemote) {
      setError(
        'Disconnect the active remote before joining or creating a room.',
      );
      return;
    }
    if (isAIMode) {
      void generateRoom();
      return;
    }
    if (!value.trim()) {
      setCreateVisible(true);
      return;
    }
    void joinRoom(value);
  };

  const generateRoom = async () => {
    if (controllerRemote) {
      setError(
        'Disconnect the active remote before generating a room on this device.',
      );
      return;
    }
    const prompt = value.trim();
    if (!prompt) {
      setError('Describe the playlist you want.');
      return;
    }
    setGenerationLoading(true);
    const [requestError, generatedRoom] =
      await roomRequests.createGeneratedRoom({ prompt });
    setGenerationLoading(false);
    if (requestError || !generatedRoom) {
      setError(
        await getRequestErrorMessage(
          requestError,
          'Could not start playlist generation.',
        ),
      );
      return;
    }
    await startGeneratedRoom(generatedRoom.id);
  };

  const toggleAIMode = () => {
    setIsAIMode((current) => !current);
    setValue('');
    setError('');
  };

  const handleCreated = async (roomName: string, roomPassword: string) => {
    const result = await setRoomId(roomName, roomPassword);
    if (result !== 'joined') return false;
    return true;
  };

  const renderPublicRoom = (item: PublicRoom, index: number) => {
    const isOddFinalRoom =
      publicRooms.length % roomsPerRow === 1 &&
      index === publicRooms.length - 1;

    return (
      <Animated.View
        className={classNames(
          'min-w-0',
          isOddFinalRoom && 'w-full',
          !isOddFinalRoom && 'flex-1 basis-[45%]',
        )}
        entering={FadeInDown.duration(180).delay(index * 35)}
        key={item.id}
      >
        <Pressable
          className="w-full gap-3 rounded-3xl border border-mobile-border bg-mobile-card/95 p-5 active:opacity-70 dark:border-mobile-dark-border dark:bg-mobile-dark-card/95"
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
          <Text className="font-heading text-accent text-sm">Join room →</Text>
        </Pressable>
      </Animated.View>
    );
  };

  if (room && roomId) {
    return <RoomScreen />;
  }

  let submitLabel = value.trim() ? 'Join room' : 'Start a session';
  if (isAIMode) {
    submitLabel = generationLoading
      ? 'Generating playlist…'
      : 'Generate playlist';
  }
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
            <Animated.View className="gap-5" entering={FadeIn.duration(180)}>
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
                  <Copy muted>
                    {isAIMode ? 'BUILD YOUR SIGNAL' : 'FIND YOUR SIGNAL'}
                  </Copy>
                  <Heading>
                    {isAIMode ? 'Generate a room' : 'Join a room'}
                  </Heading>
                </View>
                <Field
                  autoCapitalize="none"
                  value={value}
                  onChangeText={(nextValue) => {
                    setValue(nextValue);
                    setError('');
                  }}
                  onSubmitEditing={submitRoom}
                  placeholder={
                    isAIMode
                      ? 'Late-night synthwave for a rainy drive'
                      : 'Room name'
                  }
                  trailingAction={
                    <Pressable
                      accessibilityLabel={
                        isAIMode ? 'Turn off AI mode' : 'Generate with AI'
                      }
                      accessibilityRole="switch"
                      accessibilityState={{ checked: isAIMode }}
                      className={classNames(
                        'size-11 items-center justify-center rounded-xl border active:opacity-70',
                        isAIMode && 'border-accent bg-accent',
                        !isAIMode &&
                          'border-mobile-border bg-mobile-card dark:border-mobile-dark-border dark:bg-mobile-dark-card',
                      )}
                      onPress={toggleAIMode}
                    >
                      <ZoffIcon
                        color={isAIMode ? '#ffffff' : theme.text}
                        name="sparkles"
                        size={22}
                      />
                    </Pressable>
                  }
                />
                <Button
                  disabled={loading || generationLoading}
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
                <View className="flex-row flex-wrap gap-3">
                  {publicRooms.map(renderPublicRoom)}
                  {publicRooms.length === 0 && (
                    <View className="w-full rounded-3xl border border-mobile-border bg-mobile-card/70 px-5 py-6 dark:border-mobile-dark-border dark:bg-mobile-dark-card/70">
                      <Copy muted>
                        No public rooms are live. Start one and set the signal.
                      </Copy>
                    </View>
                  )}
                </View>
              </View>
            </Animated.View>
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

const roomsPerRow = 2;
