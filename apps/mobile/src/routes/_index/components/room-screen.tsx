import type { Song } from '@vibes/models';
import { useFetcher } from '@vibes/native-router';
import { classNames, safeWrapAsync } from '@vibes/shared';
import {
  NativeKeyboardAvoidingView,
  useNativePresentation,
} from '@vibes/ui/native';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Share, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
import {
  RoomPlayerSpace,
  type RoomPlayerSpaceHandle,
} from '@/components/room-player-space';
import { Toast } from '@/components/toast';
import { useKeyboardVisible } from '@/hooks/use-keyboard-visible';
import { useLivePosition } from '@/hooks/use-live-position';
import { useTabletLandscapeLayout } from '@/hooks/use-tablet-landscape-layout';
import {
  usePlaybackActions,
  usePlaybackSession,
  useRoomActions,
  useRoomSession,
} from '@/providers/app-provider';
import type { RoomPlaybackActionData } from '@/routes/rooms.$id.playback/action';
import type { RoomQueueActionData } from '@/routes/rooms.$id.queue/action';
import { CastButton } from './cast-button';
import { RoomChatPanel } from './room-chat-panel';

export function RoomScreen() {
  const {
    authoritativePlayback,
    hasLocalPlaybackPositionDrift,
    playback,
    playerEnabled,
    playerPreferenceLoaded,
  } = usePlaybackSession();
  const terminal = useNativePresentation() === 'terminal';
  const { room, roomId, songs } = useRoomSession();
  const { resetLocalPlayback, setLocalPlaying } = usePlaybackActions();
  const { leaveRoom, setError } = useRoomActions();
  const router = useRouter();
  const tabletLayout = useTabletLandscapeLayout();
  const keyboardVisible = useKeyboardVisible();
  const { width } = tabletLayout;
  const compactRoomHeader = width < roomHeaderBreakpoint;
  const [notice, setNotice] = useState('');
  const playerSpaceRef = useRef<RoomPlayerSpaceHandle>(null);
  const [, { submit: submitPlayback }] = useFetcher<RoomPlaybackActionData>({
    params: { id: roomId },
    routeId: 'rooms.$id.playback',
  });
  const [, { submit: submitQueue }] = useFetcher<RoomQueueActionData>({
    params: { id: roomId },
    routeId: 'rooms.$id.queue',
  });

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
  const canSkip =
    canControlPlayback && (room.isAdmin || room.settings.skipAllowed);

  const sendAction = async (action: 'play' | 'pause') => {
    if (room.mode === 'server') {
      setLocalPlaying(action === 'play', livePosition);
      return;
    }
    if (!hasHostPlaybackAuthority) return;
    const result = await submitPlayback({ intent: 'update', action });
    if (result.error) setError(result.error);
  };

  const skip = async () => {
    const result = await submitPlayback({ intent: 'skip' });
    if (result.data?.intent !== 'skip') {
      setError(result.error || 'Failed to skip. Please try again.');
      return;
    }
    const { response } = result.data;
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
    const result = await submitQueue({ intent: 'vote', songId: song.id });
    if (result.error) setError(result.error);
  };

  const remove = async (song: Song) => {
    const result = await submitQueue({
      intent: 'remove',
      songId: song.id,
    });
    if (result.error) setError(result.error);
  };

  const seek = async (positionMs: number) => {
    const result = await submitPlayback({
      action: 'seek',
      intent: 'update',
      positionMs,
    });
    if (result.error) setError(result.error);
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
  if (playerPreferenceLoaded && playerEnabled && !keyboardVisible) {
    let playerWidth = tabletLayout.isTabletPortrait
      ? tabletLayout.portraitPlayerWidth
      : width - 32;
    let height = Math.max(200, playerWidth / (16 / 9));
    if (tabletLayout.isTabletLandscape) {
      height = tabletLayout.playerHeight;
      playerWidth = tabletLayout.playerPaneWidth;
    }
    playerSpacer = (
      <RoomPlayerSpace
        ref={playerSpaceRef}
        width={playerWidth}
        height={height}
      />
    );
  }

  let roomDetails = null;
  if (room.isGenerating && !playerEnabled) {
    roomDetails = (
      <View
        className={classNames(
          'h-56 overflow-hidden border',
          !terminal &&
            'rounded-2xl border-accent/60 bg-mobile-card dark:bg-mobile-dark-card',
          terminal && 'border-[#55ffad] bg-[#010c08]',
        )}
      >
        <RoomGenerationProgress />
      </View>
    );
  }
  if (!room.isGenerating) {
    roomDetails = (
      <Card>
        <View className="flex-row items-center justify-between gap-3">
          <View className="min-w-0 flex-1 gap-1">
            <Copy muted>NOW PLAYING</Copy>
            <Text
              numberOfLines={1}
              className={classNames(
                'font-heading text-xl',
                !terminal && 'text-mobile-text dark:text-mobile-dark-text',
                terminal && 'text-[#dffff0]',
              )}
            >
              {current?.title ?? 'Nothing playing'}
            </Text>
            <Copy muted>{current?.artist ?? ''}</Copy>
          </View>
          {playerEnabled && current && showsPlaybackReset && (
            <IconButton
              accessibilityLabel="Reset playback"
              feedback
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
                feedback
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
              feedback
              icon="skip"
              label="Skip"
              disabled={!canSkip}
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
      <RoomChatPanel
        roomId={roomId}
        count={queuedSongs.length}
        header={<View className="p-4">{roomDetails}</View>}
        chatHeader={
          <View className="gap-1 px-4 py-4">
            <Copy muted>NOW PLAYING</Copy>
            <Text
              numberOfLines={1}
              className="font-heading text-base text-mobile-text dark:text-mobile-dark-text"
            >
              {current?.title ?? 'Nothing playing'}
            </Text>
          </View>
        }
        renderQueue={(header, showHeading) => (
          <Queue
            header={header}
            showHeading={showHeading}
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
        )}
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
          className="min-h-0 overflow-hidden"
          style={{ width: tabletLayout.playlistPaneWidth }}
        >
          <RoomChatPanel
            roomId={roomId}
            count={queuedSongs.length}
            renderQueue={(header, showHeading) => (
              <Queue
                header={header}
                showHeading={showHeading}
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
            )}
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

  let roomHeader = (
    <View
      className={classNames(
        'flex-row items-center justify-between gap-3 self-stretch px-4 py-3',
        tabletLayout.isTablet && 'h-20 py-0',
      )}
    >
      <View className="min-w-0 flex-1 justify-center gap-0.5 overflow-hidden">
        <Copy muted>NOW IN</Copy>
        <Text
          className={classNames(
            'min-w-0 font-heading text-3xl',
            !terminal && 'text-mobile-text dark:text-mobile-dark-text',
            terminal && 'text-[#dffff0]',
          )}
          ellipsizeMode="tail"
          numberOfLines={1}
        >
          {room.name}
        </Text>
      </View>
      <View className="shrink-0 flex-row items-center justify-end gap-2">
        <Button label="Leave" tone="secondary" onPress={() => void leave()} />
        <View
          className={classNames(
            'h-13 flex-row items-center gap-2 border px-4',
            !terminal &&
              'rounded-xl border-mobile-border bg-mobile-card/90 dark:border-mobile-dark-border dark:bg-mobile-dark-card/90',
            terminal && 'border-[#55ffad] bg-[#010c08]',
          )}
        >
          <View
            className={classNames(
              'size-2',
              !terminal && 'rounded-full bg-accent',
              terminal && 'bg-[#71f5ad]',
            )}
          />
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
  );
  if (compactRoomHeader) {
    roomHeader = (
      <View className="h-[76px] w-full flex-row items-center gap-3 px-4">
        <View className="min-w-0 flex-1 justify-center gap-0.5 overflow-hidden">
          <View className="shrink-0 flex-row items-center gap-2">
            <Copy muted>NOW IN</Copy>
            <View
              className={classNames(
                'size-2',
                !terminal && 'rounded-full bg-accent',
                terminal && 'bg-[#71f5ad]',
              )}
            />
            <Copy muted>{room.userCount ?? 0}</Copy>
          </View>
          <Text
            className={classNames(
              'min-w-0 font-heading text-xl',
              !terminal && 'text-mobile-text dark:text-mobile-dark-text',
              terminal && 'text-[#dffff0]',
            )}
            ellipsizeMode="tail"
            numberOfLines={1}
          >
            {room.name}
          </Text>
        </View>
        <View className="shrink-0 flex-row items-center gap-2">
          <Button label="Leave" tone="secondary" onPress={() => void leave()} />
          <IconButton
            accessibilityLabel="Share room"
            icon="share"
            onPress={() => void share()}
          />
          <CastButton />
        </View>
      </View>
    );
  }

  return (
    <Screen gridPaused={playback?.isPlaying === false}>
      <View
        className={classNames(
          'self-center',
          !tabletLayout.isTabletPortrait && 'w-full',
        )}
        {...(tabletLayout.isTabletPortrait
          ? { style: { width: tabletLayout.portraitContentWidth } }
          : {})}
      >
        <SafeAreaView edges={['top']}>{roomHeader}</SafeAreaView>
      </View>
      <NativeKeyboardAvoidingView
        className="min-h-0 flex-1"
        behavior="padding"
        onLayout={() => playerSpaceRef.current?.measure()}
      >
        {content}
      </NativeKeyboardAvoidingView>
    </Screen>
  );
}

const roomHeaderBreakpoint = 600;
const playbackResetPositionThresholdMs = 5_000;
