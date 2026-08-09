import Slider from '@react-native-community/slider';
import { useRoomRequests } from '@vibes/api';
import type { Song } from '@vibes/models';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CastButton } from '@/components/cast-button';
import { Button, Copy, Empty, Heading, Screen } from '@/components/native';
import { PlaybackProgress } from '@/components/playback-progress';
import { ProviderPlayer } from '@/components/provider-player';
import { Queue } from '@/components/queue';
import { SearchSheet } from '@/components/search-sheet';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useLivePosition } from '@/hooks/use-live-position';
import { getRequestErrorMessage, mobileApi } from '@/lib/api';
import { useApp } from '@/providers/app-provider';

export default function PlayerScreen() {
  const roomRequests = useRoomRequests(mobileApi);
  const { error, playback, refresh, room, roomId, setError, songs } = useApp();
  const theme = useAppTheme();
  const [searchVisible, setSearchVisible] = useState(false);
  const current = playback?.currentSong ?? null;
  const livePosition = useLivePosition(
    playback?.positionMs ?? 0,
    playback?.isPlaying ?? false,
    current?.duration ?? 0,
  );

  if (!roomId || !room) {
    return (
      <Screen>
        <Empty>Join a room from the Rooms tab first.</Empty>
      </Screen>
    );
  }

  const sendAction = async (action: 'play' | 'pause') => {
    const [requestError] = await roomRequests.updatePlayback(roomId, action);
    if (requestError) {
      setError(
        await getRequestErrorMessage(
          requestError,
          `Could not ${action} playback.`,
        ),
      );
    }
    await refresh();
  };

  const skip = async () => {
    const [requestError] = await roomRequests.skip(roomId);
    if (requestError) {
      setError(await getRequestErrorMessage(requestError, 'Could not skip.'));
    }
    await refresh();
  };

  const vote = async (song: Song) => {
    const [requestError] = await roomRequests.vote(roomId, song.id);
    if (requestError) {
      setError(
        await getRequestErrorMessage(requestError, 'Could not register vote.'),
      );
    }
    await refresh();
  };

  const seek = async (positionMs: number) => {
    const [requestError] = await roomRequests.updatePlayback(
      roomId,
      'seek',
      positionMs,
    );
    if (requestError) {
      setError(
        await getRequestErrorMessage(requestError, 'Could not seek playback.'),
      );
    }
    await refresh();
  };

  return (
    <Screen>
      <SafeAreaView className="flex-1" edges={['top']}>
        <View className="flex-row items-center justify-between px-4 py-3">
          <View>
            <Copy muted>NOW IN</Copy>
            <Heading>{room.name}</Heading>
          </View>
          <View className="flex-row items-center gap-2">
            <View className="size-2 rounded-full bg-accent" />
            <Copy>{room.userCount ?? 0}</Copy>
            <CastButton />
          </View>
        </View>
        <ProviderPlayer song={current} />
        <View className="gap-3 p-4">
          <View className="gap-1">
            <Text
              numberOfLines={1}
              className="font-extrabold font-mono text-lg text-mobile-text dark:text-mobile-dark-text"
            >
              {current?.title ?? 'Nothing playing'}
            </Text>
            <Copy muted>{current?.artist ?? ''}</Copy>
          </View>
          <View className="flex-row gap-2">
            <Button
              icon={playback?.isPlaying ? 'pause.fill' : 'play.fill'}
              label={playback?.isPlaying ? 'Pause' : 'Play'}
              tone="secondary"
              onPress={() =>
                void sendAction(playback?.isPlaying ? 'pause' : 'play')
              }
            />
            <Button
              icon="forward.end.fill"
              label="Skip"
              tone="secondary"
              onPress={() => void skip()}
            />
            <Button
              icon="plus"
              label="Add"
              onPress={() => setSearchVisible(true)}
            />
          </View>
          <PlaybackProgress
            duration={current?.duration ?? 0}
            position={livePosition}
          />
          <Slider
            accessibilityLabel="Playback position"
            disabled={
              !current ||
              room.mode !== 'host' ||
              (room.hostId !== room.userId && !room.isAdmin)
            }
            maximumValue={(current?.duration ?? 0) * 1_000}
            minimumTrackTintColor={theme.accent}
            maximumTrackTintColor={theme.surface}
            onSlidingComplete={(position) => void seek(position)}
            thumbTintColor={theme.accent}
            value={livePosition}
          />
          {Boolean(error) && (
            <Text className="font-mono text-error text-xs">{error}</Text>
          )}
        </View>
        <View className="flex-1">
          <Queue songs={songs} onVote={(song) => void vote(song)} />
        </View>
        <SearchSheet
          visible={searchVisible}
          onClose={() => setSearchVisible(false)}
        />
      </SafeAreaView>
    </Screen>
  );
}
