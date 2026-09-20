import {
  generatedPlaylistPromptMaxLength,
  roomNameMaxLength,
} from '@vibes/models';
import { classNames } from '@vibes/shared';
import {
  NativeButton,
  NativeCard,
  NativeCopy,
  NativeField,
  NativeHeading,
  NativeLandingSun,
} from '@vibes/ui/native';
import { chunkItems } from '@vibes/ui/shared';
import { useState } from 'react';
import {
  Image,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useGenerationMessage } from '@/hooks/use-generation-message';
import { useRoomBrowser } from '@/hooks/use-room-browser';
import type { TvSessionActions, TvSessionState } from '@/hooks/use-tv-session';

interface LandingScreenProps {
  isAIMode: boolean;
  onToggleAIMode: () => void;
  session: TvSessionState;
  sessionActions: TvSessionActions;
}

export function LandingScreen({
  isAIMode,
  onToggleAIMode,
  session,
  sessionActions,
}: LandingScreenProps) {
  const { height, width } = useWindowDimensions();
  const compact = width <= compactScreenWidth || height <= compactScreenHeight;
  const [value, setValue] = useState('');
  const browser = useRoomBrowser();
  const rooms = browser.browsing
    ? (browser.result?.rooms ?? [])
    : session.publicRooms;
  const publicRoomRows = chunkItems(
    rooms.slice(0, browser.browsing ? 12 : publicRoomLimit),
    publicRoomColumns,
  );
  const generationMessage = useGenerationMessage(isAIMode && session.loading);
  const submit = () => {
    if (isAIMode) {
      void sessionActions.generateRoom(value);
      return;
    }
    const joinOrCreate = async () => {
      const result = await sessionActions.loadRoom(value);
      if (result === 'notFound') await sessionActions.createRoom(value);
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
          'mx-auto w-full max-w-7xl',
          compact ? 'gap-5' : 'gap-10',
        )}
      >
        <View className="flex-row items-center gap-5">
          <Image
            source={require('../../assets/icon.png')}
            accessibilityLabel="Zoff"
            className={classNames(
              'rounded-full',
              compact ? 'size-20' : 'size-28',
            )}
          />
          <View className="gap-1">
            <Text
              className={classNames(
                'font-heading text-tv-text',
                compact ? 'text-4xl' : 'text-6xl',
              )}
            >
              Zoff
            </Text>
            <NativeCopy muted>Rooms on your TV</NativeCopy>
          </View>
        </View>
        <View className="flex-row items-start gap-8">
          <View className="min-w-0 flex-1">
            <NativeLandingSun />
            <NativeCard
              className={classNames(
                'rounded-3xl border-2',
                compact ? 'gap-5 p-6' : 'gap-8 p-10',
              )}
            >
              <View className="gap-2">
                <NativeHeading>
                  {isAIMode ? 'Set the ' : 'Listen to music '}
                  <Text className="text-primary">
                    {isAIMode ? 'mood.' : 'together.'}
                  </Text>
                </NativeHeading>
              </View>
              <View
                className={classNames(
                  'flex-row items-center',
                  compact ? 'gap-4' : 'gap-6',
                )}
              >
                <NativeField
                  accessibilityLabel={
                    isAIMode ? 'Playlist prompt' : 'Room name'
                  }
                  autoCapitalize="none"
                  onChangeText={setValue}
                  onSubmitEditing={submit}
                  placeholder={placeholder}
                  maxLength={
                    isAIMode
                      ? generatedPlaylistPromptMaxLength
                      : roomNameMaxLength
                  }
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
          </View>
          <View
            className={classNames(
              'mt-24 min-w-0 flex-1 rounded-3xl border-2 border-tv-border bg-tv-card p-6',
              compact && 'gap-3',
              !compact && 'gap-5',
            )}
          >
            <View className="flex-row gap-3">
              <NativeButton
                label="Live rooms"
                className="min-h-12 flex-1 px-4"
                selected={!browser.browsing}
                tone="secondary"
                onPress={browser.showLive}
              />
              <NativeButton
                label="Browse"
                className="min-h-12 flex-1 px-4"
                selected={browser.browsing}
                tone="secondary"
                onPress={() => void browser.load()}
              />
            </View>
            {browser.browsing && (
              <View className="flex-row gap-3">
                <NativeField
                  accessibilityLabel="Search public rooms"
                  placeholder="Search rooms"
                  value={browser.query}
                  onChangeText={browser.setQuery}
                  maxLength={100}
                  onSubmitEditing={() => void browser.load()}
                  wrapperClassName="min-w-0 flex-1"
                />
                <NativeButton
                  label="Search"
                  onPress={() => void browser.load()}
                  disabled={browser.loading}
                  className="min-h-12 px-4"
                />
              </View>
            )}
            {browser.loading && <NativeCopy muted>Loading rooms…</NativeCopy>}
            {browser.error && <NativeCopy>{browser.error}</NativeCopy>}
            {!browser.loading && !browser.error && rooms.length === 0 && (
              <View className="rounded-2xl border-2 border-tv-border bg-tv-card p-8">
                <Text className="font-heading text-2xl text-tv-muted">
                  {browser.browsing
                    ? 'No rooms match your search.'
                    : 'No public rooms are active right now.'}
                </Text>
              </View>
            )}
            <View
              className={classNames(compact && 'gap-3', !compact && 'gap-5')}
            >
              {publicRoomRows.map((rooms) => (
                <View
                  className={classNames(
                    'flex-row',
                    compact && 'gap-3',
                    !compact && 'gap-5',
                  )}
                  key={rooms.map((room) => room.id).join(':')}
                >
                  {rooms.map((room) => (
                    <View className="min-w-0 flex-1" key={room.id}>
                      <NativeButton
                        className={classNames(
                          compact && 'px-5 py-4',
                          !compact && 'px-12 py-8',
                        )}
                        onPress={() => void sessionActions.loadRoom(room.id)}
                        disabled={session.loading || browser.loading}
                        tone="secondary"
                      >
                        <View className="min-w-0 flex-1 flex-row items-center justify-between gap-5">
                          <View className="min-w-0 flex-1 gap-1">
                            <Text
                              className={classNames(
                                'font-heading text-tv-text',
                                compact ? 'text-base' : 'text-xl',
                              )}
                              numberOfLines={1}
                            >
                              {room.name}
                            </Text>
                            <Text
                              className={classNames(
                                'font-heading text-tv-muted',
                                compact ? 'text-xs' : 'text-base',
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
            {browser.browsing && browser.result && browser.result.total > 0 && (
              <View className="flex-row items-center justify-between gap-3">
                <NativeButton
                  label="Previous"
                  tone="secondary"
                  className="min-h-12 px-4"
                  disabled={browser.loading || browser.result.from === 0}
                  onPress={() =>
                    void browser.load(
                      Math.max(0, (browser.result?.from ?? 0) - 12),
                    )
                  }
                />
                <NativeCopy muted>
                  {Math.floor(browser.result.from / 12) + 1} /{' '}
                  {Math.ceil(browser.result.total / 12)}
                </NativeCopy>
                <NativeButton
                  label="Next"
                  tone="secondary"
                  className="min-h-12 px-4"
                  disabled={
                    browser.loading ||
                    browser.result.from + 12 >= browser.result.total
                  }
                  onPress={() =>
                    void browser.load((browser.result?.from ?? 0) + 12)
                  }
                />
              </View>
            )}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const publicRoomLimit = 6;

const publicRoomColumns = 2;

const compactScreenWidth = 1100;

const compactScreenHeight = 560;
