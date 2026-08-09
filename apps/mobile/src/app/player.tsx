import { useRoomRequests } from '@vibes/api';
import type { Song } from '@vibes/models';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CastButton } from '@/components/cast-button';
import { Button, Card, Copy, Empty, Screen } from '@/components/native';
import { PlaybackProgress } from '@/components/playback-progress';
import { ProviderPlayer } from '@/components/provider-player';
import { Queue } from '@/components/queue';
import { SearchSheet } from '@/components/search-sheet';
import { useLivePosition } from '@/hooks/use-live-position';
import { getRequestErrorMessage, mobileApi } from '@/lib/api';
import { useApp } from '@/providers/app-provider';

export default function PlayerScreen() {
  const roomRequests = useRoomRequests(mobileApi);
  const { error, playback, refresh, room, roomId, setError, songs } = useApp();
  const [searchVisible, setSearchVisible] = useState(false);
  const current = playback?.currentSong ?? null;
  const queuedSongs = current
    ? songs.filter((song) => song.id !== current.id)
    : songs;
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

  const remove = async (song: Song) => {
    const [requestError] = await roomRequests.removeSong(roomId, song.id);
    if (requestError) {
      setError(
        await getRequestErrorMessage(requestError, 'Could not remove song.'),
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
      <SafeAreaView className="flex-1" edges={['top']} style={{ flex: 1 }}>
        <View className="flex-row items-center justify-between px-4 py-3">
          <View className="min-w-0 flex-1">
            <Copy muted>NOW IN</Copy>
            <Text
              className="font-heading text-3xl text-mobile-text dark:text-mobile-dark-text"
              numberOfLines={1}
            >
              {room.name}
            </Text>
          </View>
          <View className="flex-row items-center gap-3 rounded-2xl border border-mobile-border bg-mobile-card/90 px-3 py-2 dark:border-mobile-dark-border dark:bg-mobile-dark-card/90">
            <View className="flex-row items-center gap-2">
              <View className="size-2 rounded-full bg-accent" />
              <Copy>{room.userCount ?? 0}</Copy>
            </View>
            <CastButton />
          </View>
        </View>
        <ProviderPlayer playback={playback} song={current} />
        <Queue
          songs={queuedSongs}
          onDelete={room.isAdmin ? (song) => void remove(song) : undefined}
          onVote={(song) => void vote(song)}
          header={
            <View className="p-4">
              <Card>
                <View className="gap-1">
                  <Copy muted>NOW PLAYING</Copy>
                  <Text
                    numberOfLines={1}
                    className="font-heading text-mobile-text text-xl dark:text-mobile-dark-text"
                  >
                    {current?.title ?? 'Nothing playing'}
                  </Text>
                  <Copy muted>{current?.artist ?? ''}</Copy>
                </View>
                <View className="flex-row gap-2">
                  <View className="flex-1">
                    <Button
                      icon={playback?.isPlaying ? 'pause' : 'play'}
                      label={playback?.isPlaying ? 'Pause' : 'Play'}
                      tone="secondary"
                      onPress={() =>
                        void sendAction(playback?.isPlaying ? 'pause' : 'play')
                      }
                    />
                  </View>
                  <View className="flex-1">
                    <Button
                      icon="skip"
                      label="Skip"
                      tone="secondary"
                      onPress={() => void skip()}
                    />
                  </View>
                  <View className="flex-1">
                    <Button
                      icon="add"
                      label="Add"
                      onPress={() => setSearchVisible(true)}
                    />
                  </View>
                </View>
                <PlaybackProgress
                  duration={current?.duration ?? 0}
                  onSeek={(position) => void seek(position)}
                  position={livePosition}
                  seekable={
                    Boolean(current) &&
                    room.mode === 'host' &&
                    (room.hostId === room.userId || room.isAdmin)
                  }
                />
                {Boolean(error) && (
                  <Text className="font-mono text-error text-xs">{error}</Text>
                )}
              </Card>
            </View>
          }
        />
        <SearchSheet
          visible={searchVisible}
          onClose={() => setSearchVisible(false)}
        />
      </SafeAreaView>
    </Screen>
  );
}
