import type { PlaylistItem } from '@vibes/models';
import { classNames, getProviderItemUrl, safeWrapAsync } from '@vibes/shared';
import { useNativePresentation } from '@vibes/ui/native';
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
  showHeading?: boolean;
  onDelete?: (playlistItem: PlaylistItem) => void;
  onVote: (playlistItem: PlaylistItem) => void;
  playlistItems: PlaylistItem[];
}

interface QueueItemProps {
  index: number;
  onDelete?: (playlistItem: PlaylistItem) => void;
  onVote: (playlistItem: PlaylistItem) => void;
  playlistItem: PlaylistItem;
}

const QueueItem = memo(function QueueItem({
  index,
  onDelete,
  onVote,
  playlistItem,
}: QueueItemProps) {
  const theme = useAppTheme();
  const terminal = useNativePresentation() === 'terminal';
  const providerUrl = getProviderItemUrl(
    playlistItem.sourceType,
    playlistItem.sourceId,
    playlistItem.providerUrl,
  );
  const openExternally = async () => {
    if (!providerUrl) return;
    await safeWrapAsync(Linking.openURL(providerUrl));
  };
  const row = (
    <Pressable
      accessibilityLabel={`Vote for ${playlistItem.title}`}
      className={classNames(
        'h-18 flex-row items-center gap-3 border p-3',
        !terminal &&
          'rounded-2xl border-mobile-border bg-mobile-card active:border-accent active:bg-mobile-surface dark:border-mobile-dark-border dark:bg-mobile-dark-card dark:active:bg-mobile-dark-surface',
        terminal &&
          'border-[#55ffad]/45 bg-[#010c08] active:border-[#71f5ad] active:bg-[#03150d]',
      )}
      onPress={() => {
        void triggerSelectionFeedback();
        onVote(playlistItem);
      }}
    >
      <Text
        className={classNames(
          'w-5 text-center font-heading text-xs',
          !terminal && 'text-mobile-muted dark:text-mobile-dark-muted',
          terminal && 'text-[#a6ffd0]/65',
        )}
      >
        {index + 1}
      </Text>
      <View className="size-13 overflow-hidden rounded-xl bg-black">
        <Image
          cachePolicy="memory-disk"
          contentFit="cover"
          recyclingKey={playlistItem.id}
          source={playlistItem.thumbnailUrl}
          style={thumbnailImageStyle}
        />
      </View>
      <View className="min-w-0 flex-1 gap-1">
        <Text
          numberOfLines={1}
          className={classNames(
            'font-bold font-heading text-sm',
            !terminal && 'text-mobile-text dark:text-mobile-dark-text',
            terminal && 'text-[#dffff0]',
          )}
        >
          {playlistItem.title}
        </Text>
        <Text
          numberOfLines={1}
          className={classNames(
            'font-heading text-xs',
            !terminal && 'text-mobile-muted dark:text-mobile-dark-muted',
            terminal && 'text-[#a6ffd0]/65',
          )}
        >
          {playlistItem.publisher ?? playlistItem.sourceType}
        </Text>
      </View>
      <View
        className={classNames(
          'flex-row items-center gap-1.5 px-2.5 py-2',
          !terminal && 'rounded-xl bg-accent/10',
          terminal && 'border border-[#55ffad]/45 bg-[#03150d]',
        )}
      >
        <ZoffIcon color={theme.accent} name="vote" size={16} />
        <Text
          className={classNames(
            'font-heading text-xs',
            !terminal && 'text-accent',
            terminal && 'text-[#71f5ad]',
          )}
        >
          {playlistItem.voteCount ?? 0}
        </Text>
      </View>
    </Pressable>
  );

  if (!playlistItem.addedBy && !providerUrl && !onDelete) {
    return row;
  }

  return (
    <ReanimatedSwipeable
      enableTrackpadTwoFingerGesture
      overshootRight={false}
      renderRightActions={(_progress, _translation, swipeable) => (
        <View className="ml-2 h-18 flex-row items-stretch gap-2">
          {playlistItem.addedBy && (
            <View
              className={classNames(
                'h-full w-28 items-center justify-center gap-0.5 overflow-hidden border-2 px-2',
                !terminal &&
                  'rounded-2xl border-mobile-border bg-mobile-surface dark:border-mobile-dark-border dark:bg-mobile-dark-surface',
                terminal && 'border-[#55ffad] bg-[#03150d]',
              )}
            >
              <Text
                className={classNames(
                  'w-full text-center font-heading text-xs leading-4',
                  !terminal && 'text-mobile-muted dark:text-mobile-dark-muted',
                  terminal && 'text-[#a6ffd0]/65',
                )}
              >
                Added by
              </Text>
              <Text
                className={classNames(
                  'w-full text-center font-heading text-sm leading-4',
                  !terminal && 'text-mobile-text dark:text-mobile-dark-text',
                  terminal && 'text-[#dffff0]',
                )}
                ellipsizeMode="tail"
                numberOfLines={1}
              >
                {playlistItem.addedBy}
              </Text>
            </View>
          )}
          {onDelete && (
            <Pressable
              accessibilityLabel={`Delete ${playlistItem.title}`}
              className="w-20 items-center justify-center rounded-2xl border-2 border-error bg-error active:opacity-70"
              onPress={() => {
                void triggerSelectionFeedback();
                swipeable.close();
                onDelete(playlistItem);
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
              accessibilityLabel={`Open ${playlistItem.title} externally`}
              className={classNames(
                'w-20 items-center justify-center border-2 active:opacity-70',
                !terminal && 'rounded-2xl border-accent bg-accent',
                terminal && 'border-[#55ffad] bg-[#010c08]',
              )}
              onPress={() => {
                swipeable.close();
                void openExternally();
              }}
            >
              <ZoffIcon
                color={terminal ? '#71f5ad' : '#ffffff'}
                name="external"
                size={20}
              />
              <Text
                className={classNames(
                  'mt-1 font-heading text-xs',
                  !terminal && 'text-white',
                  terminal && 'text-[#dffff0]',
                )}
              >
                Open
              </Text>
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
  emptyMessage = 'No items are queued yet.',
  header,
  showHeading = true,
  onDelete,
  onVote,
  playlistItems,
}: QueueProps) {
  const renderPlaylistItem = useCallback(
    ({ item, index }: ListRenderItemInfo<PlaylistItem>) => (
      <Animated.View
        className={classNames(!contained && 'px-4')}
        entering={FadeInDown.duration(180).delay(Math.min(index, 8) * 24)}
        layout={LinearTransition.duration(180)}
      >
        <QueueItem
          index={index}
          onVote={onVote}
          playlistItem={item}
          {...(onDelete ? { onDelete } : {})}
        />
      </Animated.View>
    ),
    [contained, onDelete, onVote],
  );

  let listHeader: ReactElement | null = null;
  if (!contained) {
    listHeader = (
      <>
        {header}
        {showHeading && (
          <View className="px-4 pt-4 pb-3">
            <Copy muted>UP NEXT ({playlistItems.length})</Copy>
          </View>
        )}
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
      data={playlistItems}
      initialNumToRender={8}
      keyExtractor={(playlistItem) => playlistItem.id}
      ListEmptyComponent={
        <View className={classNames(!contained && 'px-4')}>
          <Empty>{emptyMessage}</Empty>
        </View>
      }
      ListHeaderComponent={listHeader}
      maxToRenderPerBatch={8}
      renderItem={renderPlaylistItem}
      ItemSeparatorComponent={QueueSeparator}
      updateCellsBatchingPeriod={32}
      windowSize={5}
    />
  );

  if (!contained) return list;

  return (
    <View className="min-h-0 flex-1">
      {header}
      {showHeading && (
        <View className="pt-4 pb-3">
          <Copy muted>UP NEXT ({playlistItems.length})</Copy>
        </View>
      )}
      {list}
    </View>
  );
}

function QueueSeparator() {
  return <View className="h-3" />;
}

const queueStyle = { paddingBottom: 112 };
const thumbnailImageStyle = { height: '100%' as const, width: '100%' as const };
