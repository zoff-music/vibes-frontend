import { useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';
import { FocusButton } from '@/components/focus-button';
import { TvIcon } from '@/components/tv-icon';
import type { useTvSession } from '@/hooks/use-tv-session';

interface LandingScreenProps {
  isAIMode: boolean;
  onToggleAIMode: () => void;
  session: ReturnType<typeof useTvSession>;
}

export function LandingScreen({
  isAIMode,
  onToggleAIMode,
  session,
}: LandingScreenProps) {
  const [value, setValue] = useState('');
  const submit = () => {
    if (isAIMode) {
      void session.generateRoom(value);
      return;
    }
    const joinOrCreate = async () => {
      const result = await session.loadRoom(value);
      if (result === 'notFound') await session.createRoom(value);
    };
    void joinOrCreate();
  };

  let buttonLabel = 'Enter a room name';
  if (value.trim()) buttonLabel = 'Join or create room';
  if (isAIMode) buttonLabel = 'Generate playlist';
  if (session.loading) buttonLabel = 'Tuning the signal…';
  let placeholder = 'Room name';
  let aiTone: 'primary' | 'secondary' = 'secondary';
  let aiIconColor = '#e8dff5';
  if (isAIMode) {
    placeholder = 'Late-night synthwave for a rainy drive';
    aiTone = 'primary';
    aiIconColor = '#ffffff';
  }

  return (
    <ScrollView contentContainerClassName="min-h-full px-20 py-12">
      <View className="mx-auto w-full max-w-6xl gap-10">
        <View className="items-center gap-2">
          <Text className="font-heading text-8xl text-primary">ゾフ</Text>
          <Text className="font-heading text-5xl text-tv-text">Zoff TV</Text>
          <Text className="font-heading text-2xl text-tv-muted">
            Shared music rooms, made for the biggest screen.
          </Text>
        </View>

        <View className="gap-7 rounded-[2rem] border-2 border-tv-border bg-tv-card/95 p-10">
          <View className="flex-row items-center gap-5">
            <TextInput
              autoCapitalize="none"
              className="min-h-20 flex-1 rounded-2xl border-2 border-tv-border bg-tv-surface px-7 font-heading text-3xl text-tv-text"
              onChangeText={setValue}
              onSubmitEditing={submit}
              placeholder={placeholder}
              placeholderTextColor="#826b9a"
              value={value}
            />
            <FocusButton onPress={onToggleAIMode} tone={aiTone}>
              <TvIcon color={aiIconColor} name="sparkles" size={30} />
            </FocusButton>
            <FocusButton
              disabled={session.loading || !value.trim()}
              label={buttonLabel}
              onPress={submit}
              preferred
              tone="primary"
            />
          </View>
          {session.error && (
            <Text className="font-heading text-primary text-xl">
              {session.error}
            </Text>
          )}
        </View>

        <View className="gap-5">
          <View className="flex-row items-center justify-between">
            <Text className="font-heading text-3xl text-tv-text">Live now</Text>
            <Text className="font-heading text-tv-muted text-xl">
              {session.publicRooms.length} public rooms
            </Text>
          </View>
          {session.publicRooms.length === 0 && (
            <View className="rounded-2xl border-2 border-tv-border bg-tv-card p-8">
              <Text className="font-heading text-2xl text-tv-muted">
                No public rooms are active right now.
              </Text>
            </View>
          )}
          <View className="flex-row flex-wrap gap-5">
            {session.publicRooms.slice(0, publicRoomLimit).map((room) => (
              <View className="w-[31%]" key={room.id}>
                <FocusButton
                  label={`${room.name} · ${room.listenerCount} listening · ${room.songCount} songs`}
                  onPress={() => void session.loadRoom(room.id)}
                />
              </View>
            ))}
          </View>
        </View>

        <Text className="text-center font-heading text-lg text-tv-muted">
          Music from {session.providers.join(' · ') || 'enabled providers'}
        </Text>
      </View>
    </ScrollView>
  );
}

const publicRoomLimit = 6;
