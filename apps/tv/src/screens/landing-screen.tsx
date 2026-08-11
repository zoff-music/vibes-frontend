import { classNames } from '@vibes/shared';
import {
  NativeButton,
  NativeCard,
  NativeCopy,
  NativeField,
  NativeHeading,
} from '@vibes/ui/native';
import { chunkItems } from '@vibes/ui/shared';
import { useState } from 'react';
import { ScrollView, Text, useWindowDimensions, View } from 'react-native';
import { useGenerationMessage } from '@/hooks/use-generation-message';
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
  const { height, width } = useWindowDimensions();
  const compact = width <= compactScreenWidth || height <= compactScreenHeight;
  const [value, setValue] = useState('');
  const publicRoomRows = chunkItems(
    session.publicRooms.slice(0, publicRoomLimit),
    compact ? compactPublicRoomColumns : publicRoomColumns,
  );
  const generationMessage = useGenerationMessage(isAIMode && session.loading);
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
  if (session.loading && !isAIMode) buttonLabel = 'Tuning the signal…';
  if (session.loading && isAIMode) buttonLabel = generationMessage;
  let placeholder = 'Room name';
  let aiTone: 'primary' | 'secondary' = 'secondary';
  if (isAIMode) {
    placeholder = 'Late-night synthwave for a rainy drive';
    aiTone = 'primary';
  }

  return (
    <ScrollView
      contentContainerClassName={classNames(
        'min-h-full',
        compact ? 'px-10 py-6' : 'px-20 py-12',
      )}
    >
      <View
        className={classNames(
          'mx-auto',
          compact ? 'w-2/3' : 'w-2/5',
          compact ? 'gap-5' : 'gap-10',
        )}
      >
        <View className="items-center gap-3">
          <Text
            className={classNames(
              'font-heading text-primary',
              compact ? 'text-4xl' : 'text-6xl',
            )}
          >
            ゾフ
          </Text>
          <NativeCopy muted>
            Shared music rooms, made for the biggest screen.
          </NativeCopy>
        </View>

        <NativeCard className="gap-6 rounded-3xl border-2 p-8">
          <View
            className={classNames(
              'flex-row items-center',
              compact ? 'gap-4' : 'gap-6',
            )}
          >
            <NativeField
              autoCapitalize="none"
              onChangeText={setValue}
              onSubmitEditing={submit}
              placeholder={placeholder}
              inputClassName="h-16 min-h-0 px-6 text-xl"
              value={value}
              wrapperClassName="min-w-0 flex-1"
            />
            <NativeButton
              accessibilityLabel={
                isAIMode ? 'Disable AI mode' : 'Enable AI mode'
              }
              icon="sparkles"
              className="h-16 min-h-0 w-16 px-0"
              onPress={onToggleAIMode}
              tone={aiTone}
            />
          </View>
          <NativeButton
            disabled={session.loading || !value.trim()}
            className="h-16 min-h-0 px-6"
            label={buttonLabel}
            onPress={submit}
            preferred
            tone="primary"
          />
          {isAIMode && session.loading && (
            <View className="flex-row items-center justify-center gap-4">
              <View className="h-3 w-3 rounded-full bg-accent" />
              <Text
                className={classNames(
                  'font-heading text-accent',
                  compact ? 'text-sm' : 'text-xl',
                )}
              >
                {generationMessage}
              </Text>
            </View>
          )}
          {session.error && (
            <Text
              className={classNames(
                'font-heading text-primary',
                compact ? 'text-sm' : 'text-xl',
              )}
            >
              {session.error}
            </Text>
          )}
        </NativeCard>

        <View className={compact ? 'gap-3' : 'gap-5'}>
          <View className="flex-row items-center justify-between">
            <NativeHeading>Live now</NativeHeading>
            <NativeCopy muted>
              {session.publicRooms.length} public{' '}
              {session.publicRooms.length === 1 ? 'room' : 'rooms'}
            </NativeCopy>
          </View>
          {session.publicRooms.length === 0 && (
            <View className="rounded-2xl border-2 border-tv-border bg-tv-card p-8">
              <Text className="font-heading text-2xl text-tv-muted">
                No public rooms are active right now.
              </Text>
            </View>
          )}
          <View className={compact ? 'gap-3' : 'gap-5'}>
            {publicRoomRows.map((rooms) => (
              <View
                className={classNames('flex-row', compact ? 'gap-3' : 'gap-5')}
                key={rooms.map((room) => room.id).join(':')}
              >
                {rooms.map((room) => (
                  <View className="min-w-0 flex-1" key={room.id}>
                    <NativeButton
                      className={compact ? 'px-8 py-6' : 'px-12 py-8'}
                      onPress={() => void session.loadRoom(room.id)}
                      tone="secondary"
                    >
                      <View className="min-w-0 flex-1 flex-row items-center justify-between gap-5">
                        <View className="min-w-0 flex-1 gap-1">
                          <Text
                            className={classNames(
                              'font-heading text-tv-text',
                              compact ? 'text-lg' : 'text-2xl',
                            )}
                            numberOfLines={1}
                          >
                            {room.name}
                          </Text>
                          <Text
                            className={classNames(
                              'font-heading text-tv-muted',
                              compact ? 'text-xs' : 'text-lg',
                            )}
                            numberOfLines={1}
                          >
                            {room.listenerCount} listening · {room.songCount}{' '}
                            songs
                          </Text>
                        </View>
                        <Text
                          className={classNames(
                            'shrink-0 font-heading text-accent',
                            compact ? 'text-xs' : 'text-lg',
                          )}
                        >
                          Join →
                        </Text>
                      </View>
                    </NativeButton>
                  </View>
                ))}
              </View>
            ))}
          </View>
        </View>

        <NativeCopy muted>
          Music from {session.providers.join(' · ') || 'enabled providers'}
        </NativeCopy>
      </View>
    </ScrollView>
  );
}

const publicRoomLimit = 6;

const publicRoomColumns = 3;

const compactPublicRoomColumns = 2;

const compactScreenWidth = 1100;

const compactScreenHeight = 560;
