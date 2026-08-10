import { useRoomRequests } from '@vibes/api';
import type { Song } from '@vibes/models';
import { classNames, safeWrapAsync } from '@vibes/shared';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Share, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CastButton } from '@/components/cast-button';
import {
  Button,
  Card,
  Copy,
  Empty,
  IconButton,
  Screen,
} from '@/components/native';
import { PlaybackProgress } from '@/components/playback-progress';
import { Queue } from '@/components/queue';
import { RoomGenerationProgress } from '@/components/room-generation-progress';
import { useLivePosition } from '@/hooks/use-live-position';
import { getRequestErrorMessage, mobileApi } from '@/lib/api';
import { useApp } from '@/providers/app-provider';

export function RoomScreen() {
  const roomRequests = useRoomRequests(mobileApi);
  const {
    error,
    hasLocalPlaybackChanges,
    leaveRoom,
    playback,
    playerEnabled,
    playerPreferenceLoaded,
    refresh,
    resetLocalPlayback,
    room,
    roomId,
    setError,
    setLocalPlaying,
    songs,
  } = useApp();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [notice, setNotice] = useState('');

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
        <Empty>Join or create a room to start listening.</Empty>
      </Screen>
    );
  }

  const hasHostPlaybackAuthority =
    room.mode === 'host' &&
    (room.isAdmin || (Boolean(room.userId) && room.hostId === room.userId));
  const canControlPlayback = room.mode === 'server' || hasHostPlaybackAuthority;

  const sendAction = async (action: 'play' | 'pause') => {
    if (room.mode === 'server') {
      setLocalPlaying(action === 'play', livePosition);
      return;
    }
    if (!hasHostPlaybackAuthority) return;
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
    const [requestError, response] = await roomRequests.skip(roomId);
    if (requestError) {
      setError(await getRequestErrorMessage(requestError, 'Could not skip.'));
      return;
    }
    if (response?.skipped) {
      setNotice('Song skipped.');
    } else if (response?.alreadyVoted) {
      setNotice(
        `Skip vote already counted (${response.currentVotes}/${response.requiredVotes}).`,
      );
    } else if (response?.voted) {
      setNotice(
        `Skip vote added (${response.currentVotes}/${response.requiredVotes}).`,
      );
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

  const leave = async () => {
    await leaveRoom();
    router.replace('/');
  };

  const share = async () => {
    const shareUrl = `https://zoff.me/${encodeURIComponent(room.id)}`;
    const [shareError] = await safeWrapAsync(
      Share.share({
        message: `Join ${room.name} on Zoff: ${shareUrl}`,
        title: `Join ${room.name} on Zoff`,
        url: shareUrl,
      }),
    );
    if (shareError) {
      setError('Could not open the share menu.');
    }
  };

  return (
    <Screen>
      <SafeAreaView className="flex-1" edges={['top']} style={{ flex: 1 }}>
        <View className="flex-row items-center justify-between gap-3 px-4 py-3">
          <View className="min-w-0 flex-1">
            <Copy muted>NOW IN</Copy>
            <Text
              className={classNames(
                'font-heading text-mobile-text text-xl dark:text-mobile-dark-text',
                width >= roomHeaderBreakpoint && 'text-3xl',
              )}
              numberOfLines={1}
            >
              {room.name}
            </Text>
          </View>
          <View className="shrink-0 flex-row items-center justify-end gap-2">
            <Button
              label="Leave"
              tone="secondary"
              onPress={() => void leave()}
            />
            <View className="h-13 flex-row items-center gap-2 rounded-xl border border-mobile-border bg-mobile-card/90 px-4 dark:border-mobile-dark-border dark:bg-mobile-dark-card/90">
              <View className="size-2 rounded-full bg-accent" />
              <Copy>{room.userCount ?? 0}</Copy>
            </View>
            <IconButton
              accessibilityLabel="Share room"
              icon="share"
              size="large"
              onPress={() => void share()}
            />
            <CastButton />
          </View>
        </View>
        {playerPreferenceLoaded && playerEnabled && (
          <View style={{ height: Math.max(200, (width - 32) / (16 / 9)) }} />
        )}
        <Queue
          emptyMessage={
            room.isGenerating
              ? 'Songs will appear here as the playlist is generated.'
              : 'No songs are queued yet.'
          }
          songs={queuedSongs}
          onVote={(song) => void vote(song)}
          {...(room.isAdmin
            ? { onDelete: (song: Song) => void remove(song) }
            : {})}
          header={
            <View className="p-4">
              {room.isGenerating && !playerEnabled && (
                <View className="h-56 overflow-hidden rounded-2xl border border-accent/60 bg-mobile-card dark:bg-mobile-dark-card">
                  <RoomGenerationProgress />
                </View>
              )}
              {!room.isGenerating && (
                <Card>
                  <View className="flex-row items-center justify-between gap-3">
                    <View className="min-w-0 flex-1 gap-1">
                      <Copy muted>NOW PLAYING</Copy>
                      <Text
                        numberOfLines={1}
                        className="font-heading text-mobile-text text-xl dark:text-mobile-dark-text"
                      >
                        {current?.title ?? 'Nothing playing'}
                      </Text>
                      <Copy muted>{current?.artist ?? ''}</Copy>
                    </View>
                    {playerEnabled && current && hasLocalPlaybackChanges && (
                      <IconButton
                        accessibilityLabel="Reset playback"
                        icon="reset"
                        size="large"
                        onPress={() => void resetLocalPlayback()}
                      />
                    )}
                  </View>
                  <View className="flex-row gap-2">
                    {playerEnabled && (
                      <View className="flex-1">
                        <Button
                          disabled={!canControlPlayback}
                          icon={playback?.isPlaying ? 'pause' : 'play'}
                          label={playback?.isPlaying ? 'Pause' : 'Play'}
                          tone="secondary"
                          onPress={() =>
                            void sendAction(
                              playback?.isPlaying ? 'pause' : 'play',
                            )
                          }
                        />
                      </View>
                    )}
                    <View className="flex-1">
                      <Button
                        icon="skip"
                        label="Skip"
                        tone="secondary"
                        onPress={() => void skip()}
                      />
                    </View>
                  </View>
                  {playerEnabled && (
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
                  )}
                  {Boolean(error) && (
                    <Text className="font-heading text-error text-xs">
                      {error}
                    </Text>
                  )}
                  {Boolean(room.generationError) && !error && (
                    <Text className="font-heading text-error text-xs">
                      {room.generationError}
                    </Text>
                  )}
                  {Boolean(notice) && !error && (
                    <Text className="font-heading text-accent text-xs">
                      {notice}
                    </Text>
                  )}
                </Card>
              )}
            </View>
          }
        />
      </SafeAreaView>
    </Screen>
  );
}

const roomHeaderBreakpoint = 600;
