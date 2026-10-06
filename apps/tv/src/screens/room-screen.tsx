import { classNames } from '@vibes/shared';
import { NativeButton, NativeIcon, NativeQrCode } from '@vibes/ui/native';
import {
  formatPlaybackSeconds,
  getQueueRemainderLabel,
  getRoomLabels,
  voteIcon,
} from '@vibes/ui/shared';
import { Image } from 'expo-image';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  type LayoutChangeEvent,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { PlaybackStatus } from '@/components/playback-status';
import { ProviderIcon } from '@/components/provider-icon';
import { ProviderSurface } from '@/components/provider-surface';
import { useGenerationMessage } from '@/hooks/use-generation-message';
import type { TvSessionActions, TvSessionState } from '@/hooks/use-tv-session';

interface RoomScreenProps {
  session: TvSessionState;
  sessionActions: TvSessionActions;
}

export function RoomScreen({ session, sessionActions }: RoomScreenProps) {
  const labels = getRoomLabels(session.room?.roomType ?? session.roomType);
  const { height, width } = useWindowDimensions();
  const compact = width <= compactScreenWidth || height <= compactScreenHeight;
  const queueTrackHeight = compact
    ? compactQueueTrackHeight
    : defaultQueueTrackHeight;
  const queueTrackGap = compact ? compactQueueTrackGap : defaultQueueTrackGap;
  const [queueHeight, setQueueHeight] = useState(0);
  const isGenerating = Boolean(session.room?.isGenerating);
  const generationMessage = useGenerationMessage(isGenerating);
  const currentPlaylistItem = session.playback.currentPlaylistItem;
  const queuedPlaylistItems = currentPlaylistItem
    ? session.playlistItems.filter(
        (playlistItem) => playlistItem.id !== currentPlaylistItem.id,
      )
    : session.playlistItems;
  const visibleQueueLength = Math.max(
    0,
    Math.floor(
      (queueHeight + queueTrackGap) / (queueTrackHeight + queueTrackGap),
    ),
  );
  const joinUrl = `https://zoff.me/${encodeURIComponent(session.roomId)}`;
  const queueRemainderLabel = getQueueRemainderLabel(
    queuedPlaylistItems.length,
    visibleQueueLength,
  );
  const handleQueueLayout = useCallback((event: LayoutChangeEvent) => {
    setQueueHeight(event.nativeEvent.layout.height);
  }, []);
  let player = (
    <ProviderSurface
      isPlaying={session.playback.isPlaying}
      playbackKey={session.playback.updatedAt}
      positionMs={session.playback.positionMs}
      playlistItem={currentPlaylistItem}
    />
  );
  if (isGenerating && !currentPlaylistItem) {
    player = (
      <View className="flex-1 items-center justify-center gap-3 bg-tv-surface">
        <ActivityIndicator color="#22c7e8" size="large" />
        <Text className="font-heading text-2xl text-tv-text">
          {generationMessage}
        </Text>
        <Text className="font-heading text-lg text-tv-muted">
          Your {labels.items} will appear here automatically.
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 flex-row gap-3 p-3">
      <View className="min-w-0 flex-[1.85] overflow-hidden rounded-2xl border border-tv-border bg-tv-card">
        <View className="min-h-0 flex-1 bg-black">{player}</View>
        <View className="border-tv-border border-t bg-black px-5 py-3">
          <View className="flex-row items-end gap-3">
            {!compact && currentPlaylistItem?.thumbnailUrl && (
              <View className="h-14 w-14 overflow-hidden rounded-xl border border-tv-border bg-black">
                <Image
                  cachePolicy="memory-disk"
                  contentFit="cover"
                  recyclingKey={currentPlaylistItem.id}
                  source={currentPlaylistItem.thumbnailUrl}
                  style={thumbnailImageStyle}
                />
              </View>
            )}
            <View className="min-w-0 flex-1">
              <Text
                className="mb-1 font-heading text-lg text-tv-text"
                numberOfLines={1}
              >
                {currentPlaylistItem?.title ?? 'No song is playing'}
              </Text>
              <Text
                className="font-heading text-sm text-tv-muted"
                numberOfLines={1}
              >
                {currentPlaylistItem?.publisher ?? 'Waiting for the room queue'}
              </Text>
            </View>
            {currentPlaylistItem && (
              <ProviderIcon
                color="#8e82b8"
                provider={currentPlaylistItem.sourceType}
                size={compact ? 20 : 28}
              />
            )}
          </View>
          <PlaybackStatus
            durationSeconds={currentPlaylistItem?.duration ?? 0}
            hasRoom={Boolean(session.roomId)}
          />
        </View>
      </View>

      <View className="min-w-0 flex-1 rounded-2xl border border-tv-border bg-tv-card p-3">
        <View className="mb-3 flex-row items-center justify-between gap-2 border-tv-border border-b pb-3">
          <Text className="font-heading text-sm text-tv-muted">
            UP NEXT ({queuedPlaylistItems.length})
          </Text>
          <View className="flex-row items-center gap-2">
            <View className="h-12 flex-row items-center gap-2 rounded-full border border-accent/30 px-4">
              <View className="h-2 w-2 rounded-full bg-accent" />
              <Text className="font-heading text-tv-muted text-xs">
                {session.listenerCount || session.room?.userCount || 0}{' '}
                {(session.listenerCount || session.room?.userCount || 0) === 1
                  ? labels.participant
                  : labels.participants}
              </Text>
            </View>
            <NativeButton
              className="h-12 min-h-0 px-4"
              label="Leave"
              onPress={sessionActions.leaveRoom}
              tone="secondary"
            />
          </View>
        </View>

        <View
          className="min-h-0 flex-1 overflow-hidden"
          onLayout={handleQueueLayout}
        >
          {queuedPlaylistItems.length === 0 && (
            <View className="h-full items-center justify-center rounded-xl border border-tv-border">
              <Text className="font-heading text-sm text-tv-muted">
                The queue is empty
              </Text>
            </View>
          )}
          {queuedPlaylistItems.length > 0 && (
            <View className="h-full">
              <View
                className={classNames(
                  compact && 'gap-1.5',
                  !compact && 'gap-3',
                )}
              >
                {queuedPlaylistItems
                  .slice(0, visibleQueueLength)
                  .map((playlistItem, index) => (
                    <View
                      className={classNames(
                        'flex-row items-center gap-3 rounded-xl border border-tv-border bg-tv-surface px-3',
                        compact && 'h-16',
                        !compact && 'h-24',
                      )}
                      key={playlistItem.id}
                    >
                      <Text className="w-6 text-center font-heading text-tv-muted text-xs">
                        {index + 1}
                      </Text>
                      <View className="size-12 overflow-hidden rounded-lg border border-tv-border bg-black">
                        <Image
                          cachePolicy="memory-disk"
                          contentFit="cover"
                          recyclingKey={playlistItem.id}
                          source={playlistItem.thumbnailUrl}
                          style={thumbnailImageStyle}
                        />
                      </View>
                      <View className="min-w-0 flex-1">
                        <Text
                          className="font-heading text-tv-text text-xs"
                          numberOfLines={1}
                        >
                          {playlistItem.title}
                        </Text>
                        <Text
                          className="mt-1 font-heading text-tv-muted text-xs"
                          numberOfLines={1}
                        >
                          {playlistItem.publisher ?? 'Unknown Artist'} ·{' '}
                          {formatPlaybackSeconds(playlistItem.duration)}
                        </Text>
                      </View>
                      <View className="flex-row items-center gap-1">
                        <NativeIcon
                          color="#22c7e8"
                          definition={voteIcon}
                          size={16}
                        />
                        <Text className="font-heading text-accent text-xs">
                          {playlistItem.voteCount ?? 0}
                        </Text>
                      </View>
                      <ProviderIcon
                        color="#8e82b8"
                        provider={playlistItem.sourceType}
                        size={18}
                      />
                    </View>
                  ))}
              </View>
              {queueRemainderLabel && (
                <View className="min-h-7 flex-1 items-center justify-center">
                  <Text className="font-heading text-tv-muted text-xs">
                    {queueRemainderLabel}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>

        <View className="mt-3 flex-row items-center gap-3 rounded-xl border border-primary/30 bg-tv-surface p-3">
          <NativeQrCode
            logo={require('../../assets/icon.png')}
            size={compact ? 56 : 80}
            value={joinUrl}
          />
          <View className="min-w-0 flex-1">
            <Text className="font-heading text-accent text-xs">
              SCAN TO JOIN
            </Text>
            <Text
              className="mt-1 font-heading text-tv-text text-xl"
              numberOfLines={1}
            >
              {session.room?.name}
            </Text>
            {!compact && (
              <Text className="mt-1 font-heading text-tv-muted text-xs">
                Add {labels.items} and vote from your phone
              </Text>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}

const compactScreenWidth = 1100;
const compactScreenHeight = 560;
const compactQueueTrackHeight = 64;
const defaultQueueTrackHeight = 96;
const compactQueueTrackGap = 6;
const defaultQueueTrackGap = 12;
const thumbnailImageStyle = {
  height: '100%' as const,
  width: '100%' as const,
};
