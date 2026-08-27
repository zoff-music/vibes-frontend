import type { Song } from '@vibes/models';
import { getProviderTrackUrl, safeWrapAsync } from '@vibes/shared';
import { Image } from 'expo-image';
import { memo, type ReactElement, useCallback } from 'react';
import type { ListRenderItemInfo } from 'react-native';
import { FlatList, Linking, Pressable, Text, View } from 'react-native';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import Animated, {
  FadeInDown,
  LinearTransition,
} from 'react-native-reanimated';

import { Copy, Empty } from '@/components/native';
import { ZoffIcon } from '@/components/zoff-icon';
import { useAppTheme } from '@/hooks/use-app-theme';
import { triggerSelectionFeedback } from '@/lib/interaction-feedback';

interface QueueProps {
  contained?: boolean;
  emptyMessage?: string;
  header?: ReactElement;
  onDelete?: (song: Song) => void;
  onVote: (song: Song) => void;
  songs: Song[];
}

interface QueueItemProps {
  index: number;
  onDelete?: (song: Song) => void;
  onVote: (song: Song) => void;
  song: Song;
}

const QueueItem = memo(function QueueItem({
  index,
  onDelete,
  onVote,
  song,
}: QueueItemProps) {
  const theme = useAppTheme();
  const providerUrl = getProviderTrackUrl(
    song.sourceType,
    song.sourceId,
    song.providerUrl,
  );
  const openExternally = async () => {
    if (!providerUrl) return;
    await safeWrapAsync(Linking.openURL(providerUrl));
  };
  const row = (
    <Pressable
      accessibilityLabel={`Vote for ${song.title}`}
      className="min-h-18 flex-row items-center gap-3 rounded-2xl border border-mobile-border bg-mobile-card p-3 active:border-accent active:bg-mobile-surface dark:border-mobile-dark-border dark:bg-mobile-dark-card dark:active:bg-mobile-dark-surface"
      onPress={() => {
        void triggerSelectionFeedback();
        onVote(song);
      }}
    >
      <Text className="w-5 text-center font-heading text-mobile-muted text-xs dark:text-mobile-dark-muted">
        {index + 1}
      </Text>
      <View className="size-13 overflow-hidden rounded-xl bg-black">
        <Image
          cachePolicy="memory-disk"
          contentFit="cover"
          recyclingKey={song.id}
          source={song.thumbnailUrl}
          style={thumbnailImageStyle}
        />
      </View>
      <View className="min-w-0 flex-1 gap-1">
        <Text
          numberOfLines={1}
          className="font-bold font-heading text-mobile-text text-sm dark:text-mobile-dark-text"
        >
          {song.title}
        </Text>
        <Text
          numberOfLines={1}
          className="font-heading text-mobile-muted text-xs dark:text-mobile-dark-muted"
        >
          {song.artist ?? song.sourceType}
        </Text>
      </View>
      <View className="flex-row items-center gap-1.5 rounded-xl bg-accent/10 px-2.5 py-2">
        <ZoffIcon color={theme.accent} name="vote" size={16} />
        <Text className="font-heading text-accent text-xs">
          {song.voteCount ?? 0}
        </Text>
      </View>
    </Pressable>
  );

  if (!song.addedBy && !providerUrl && !onDelete) {
    return row;
  }

  return (
    <ReanimatedSwipeable
      enableTrackpadTwoFingerGesture
      overshootRight={false}
      renderRightActions={(_progress, _translation, swipeable) => (
        <View className="ml-2 flex-row gap-2">
          {song.addedBy && (
            <View className="w-28 items-center justify-center rounded-2xl border-2 border-mobile-border bg-mobile-surface px-2 dark:border-mobile-dark-border dark:bg-mobile-dark-surface">
              <Text className="font-heading text-2xs text-mobile-muted uppercase dark:text-mobile-dark-muted">
                Added by
              </Text>
              <Text
                className="mt-1 font-heading text-mobile-text text-xs dark:text-mobile-dark-text"
                numberOfLines={1}
              >
                {song.addedBy}
              </Text>
            </View>
          )}
          {onDelete && (
            <Pressable
              accessibilityLabel={`Delete ${song.title}`}
              className="w-20 items-center justify-center rounded-2xl border-2 border-error bg-error active:opacity-70"
              onPress={() => {
                void triggerSelectionFeedback();
                swipeable.close();
                onDelete(song);
              }}
            >
              <ZoffIcon color="#ffffff" name="trash" size={20} />
              <Text className="mt-1 font-heading text-white text-xs">
                Delete
              </Text>
            </Pressable>
          )}
          {providerUrl && (
            <Pressable
              accessibilityLabel={`Open ${song.title} externally`}
              className="w-20 items-center justify-center rounded-2xl border-2 border-accent bg-accent active:opacity-70"
              onPress={() => {
                swipeable.close();
                void openExternally();
              }}
            >
              <ZoffIcon color="#ffffff" name="external" size={20} />
              <Text className="mt-1 font-heading text-white text-xs">Open</Text>
            </Pressable>
          )}
        </View>
      )}
    >
      {row}
    </ReanimatedSwipeable>
  );
});

export function Queue({
  contained,
  emptyMessage = 'No songs are queued yet.',
  header,
  onDelete,
  onVote,
  songs,
}: QueueProps) {
  const renderSong = useCallback(
    ({ item, index }: ListRenderItemInfo<Song>) => (
      <Animated.View
        className="px-4"
        entering={FadeInDown.duration(180).delay(Math.min(index, 8) * 24)}
        layout={LinearTransition.duration(180)}
      >
        <QueueItem
          index={index}
          onVote={onVote}
          song={item}
          {...(onDelete ? { onDelete } : {})}
        />
      </Animated.View>
    ),
    [onDelete, onVote],
  );

  let listHeader: ReactElement | null = null;
  if (!contained) {
    listHeader = (
      <>
        {header}
        <View className="px-4 pt-4 pb-3">
          <Copy muted>UP NEXT ({songs.length})</Copy>
        </View>
      </>
    );
  }

  const list = (
    <FlatList
      automaticallyAdjustContentInsets={false}
      automaticallyAdjustsScrollIndicatorInsets={false}
      contentInsetAdjustmentBehavior="never"
      className="flex-1"
      {...(!contained && { contentContainerStyle: queueStyle })}
      data={songs}
      initialNumToRender={8}
      keyExtractor={(song) => song.id}
      ListEmptyComponent={
        <View className="px-4">
          <Empty>{emptyMessage}</Empty>
        </View>
      }
      ListHeaderComponent={listHeader}
      maxToRenderPerBatch={8}
      renderItem={renderSong}
      ItemSeparatorComponent={QueueSeparator}
      updateCellsBatchingPeriod={32}
      windowSize={5}
    />
  );

  if (!contained) return list;

  return (
    <View className="min-h-0 flex-1">
      {header}
      <View className="px-4 pt-4 pb-3">
        <Copy muted>UP NEXT ({songs.length})</Copy>
      </View>
      {list}
    </View>
  );
}

function QueueSeparator() {
  return <View className="h-3" />;
}

const queueStyle = { paddingBottom: 112 };
const thumbnailImageStyle = { height: '100%' as const, width: '100%' as const };
