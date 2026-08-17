import {
  createRoomPlaybackRequests,
  createRoomQueueRequests,
} from '@vibes/api';
import type { Song } from '@vibes/models';
import { classNames, safeWrapAsync } from '@vibes/shared';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Share, Text, View } from 'react-native';
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
import { Toast } from '@/components/toast';
import { useLivePosition } from '@/hooks/use-live-position';
import { useTabletLandscapeLayout } from '@/hooks/use-tablet-landscape-layout';
import { getRequestErrorMessage, mobileApi } from '@/lib/api';
import { useApp } from '@/providers/app-provider';

const playbackRequests = createRoomPlaybackRequests(mobileApi);
const queueRequests = createRoomQueueRequests(mobileApi);

export function RoomScreen() {
  const {
    authoritativePlayback,
    hasLocalPlaybackPositionDrift,
    leaveRoom,
    playback,
    playerEnabled,
    playerPreferenceLoaded,
    resetLocalPlayback,
    room,
    roomId,
    setError,
    setLocalPlaying,
    songs,
  } = useApp();
  const router = useRouter();
  const tabletLayout = useTabletLandscapeLayout();
  const { width } = tabletLayout;
  const [notice, setNotice] = useState('');

  const current = playback?.currentSong ?? null;
  const queuedSongs = current
    ? songs.filter((song) => song.id !== current.id)
    : songs;
  const livePosition = useLivePosition(
    playback?.positionMs ?? 0,
    playback?.isPlaying ?? false,
    current?.duration ?? 0,
    playback?.serverTimeMs,
  );
  const authoritativePosition = useLivePosition(
    authoritativePlayback?.positionMs ?? 0,
    authoritativePlayback?.isPlaying ?? false,
    authoritativePlayback?.currentSong?.duration ?? 0,
    authoritativePlayback?.serverTimeMs,
  );
  const showsPlaybackReset =
    hasLocalPlaybackPositionDrift ||
    Math.abs(livePosition - authoritativePosition) >
      playbackResetPositionThresholdMs;

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
    const [requestError] = await playbackRequests.updatePlayback(
      roomId,
      action,
    );
    if (requestError) {
      setError(
        await getRequestErrorMessage(
          requestError,
          `Could not ${action} playback.`,
        ),
      );
    }
  };

  const skip = async () => {
    const [requestError, response] = await playbackRequests.skip(roomId);
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
  };

  const vote = async (song: Song) => {
    const [requestError] = await queueRequests.vote(roomId, song.id);
    if (requestError) {
      setError(
        await getRequestErrorMessage(requestError, 'Could not register vote.'),
      );
    }
  };

  const remove = async (song: Song) => {
    const [requestError] = await queueRequests.removeSong(roomId, song.id);
    if (requestError) {
      setError(
        await getRequestErrorMessage(requestError, 'Could not remove song.'),
      );
    }
  };

  const seek = async (positionMs: number) => {
    const [requestError] = await playbackRequests.updatePlayback(
      roomId,
      'seek',
      positionMs,
    );
    if (requestError) {
      setError(
        await getRequestErrorMessage(requestError, 'Could not seek playback.'),
      );
    }
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

  let playerSpacer = null;
  if (playerPreferenceLoaded && playerEnabled) {
    const playerWidth = tabletLayout.isTabletPortrait
      ? tabletLayout.portraitPlayerWidth
      : width - 32;
    let height = Math.max(200, playerWidth / (16 / 9));
    if (tabletLayout.isTabletLandscape) {
      height = tabletLayout.playerHeight;
    }
    playerSpacer = (
      <View
        style={{
          height,
        }}
      />
    );
  }

  let roomDetails = null;
  if (room.isGenerating && !playerEnabled) {
    roomDetails = (
      <View className="h-56 overflow-hidden rounded-2xl border border-accent/60 bg-mobile-card dark:bg-mobile-dark-card">
        <RoomGenerationProgress />
      </View>
    );
  }
  if (!room.isGenerating) {
    roomDetails = (
      <Card
        className={classNames(
          tabletLayout.isTabletLandscape && 'flex-1 justify-between',
        )}
      >
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
          {playerEnabled && current && showsPlaybackReset && (
            <IconButton
              accessibilityLabel="Reset playback"
              icon="reset"
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
                  void sendAction(playback?.isPlaying ? 'pause' : 'play')
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
        <PlaybackProgress
          duration={current?.duration ?? 0}
          onSeek={(position) => void seek(position)}
          position={authoritativePosition}
          seekable={
            playerEnabled &&
            Boolean(current) &&
            room.mode === 'host' &&
            (room.hostId === room.userId || room.isAdmin)
          }
        />
        <Toast
          message={room.generationError || notice}
          tone={!room.generationError ? 'info' : 'error'}
        />
      </Card>
    );
  }

  let content = (
    <>
      {playerSpacer}
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
        header={<View className="p-4">{roomDetails}</View>}
      />
    </>
  );
  if (tabletLayout.isTabletLandscape) {
    content = (
      <View className="min-h-0 flex-1 flex-row gap-4 px-4 pb-4">
        <View
          className="min-h-0 gap-4"
          style={{ width: tabletLayout.playerPaneWidth }}
        >
          {playerSpacer}
          {roomDetails}
        </View>
        <View
          className="min-h-0 overflow-hidden rounded-2xl border border-mobile-border bg-mobile-card/80 dark:border-mobile-dark-border dark:bg-mobile-dark-card/80"
          style={{ width: tabletLayout.playlistPaneWidth }}
        >
          <Queue
            contained
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
          />
        </View>
      </View>
    );
  }
  if (tabletLayout.isTabletPortrait) {
    content = (
      <View
        className="min-h-0 flex-1 self-center"
        style={{ width: tabletLayout.portraitContentWidth }}
      >
        {content}
      </View>
    );
  }

  return (
    <Screen gridPaused={playback?.isPlaying === false}>
      <SafeAreaView edges={['top']}>
        <View
          className={classNames(
            'w-full flex-row items-center justify-between gap-3 self-center px-4 py-3',
            tabletLayout.isTabletLandscape && 'h-20 py-0',
          )}
          {...(tabletLayout.isTabletPortrait
            ? { style: { width: tabletLayout.portraitContentWidth } }
            : {})}
        >
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
              onPress={() => void share()}
            />
            <CastButton />
          </View>
        </View>
      </SafeAreaView>
      <View className="min-h-0 flex-1">{content}</View>
    </Screen>
  );
}

const roomHeaderBreakpoint = 600;
const playbackResetPositionThresholdMs = 5_000;
