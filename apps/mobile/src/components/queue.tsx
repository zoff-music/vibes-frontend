import type { Song } from '@vibes/models';
import { Image } from 'expo-image';
import type { ReactElement } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';

import { Copy, Empty } from '@/components/native';
import { ZoffIcon } from '@/components/zoff-icon';
import { useAppTheme } from '@/hooks/use-app-theme';

interface QueueProps {
  contained?: boolean;
  header?: ReactElement;
  onDelete?: (song: Song) => void;
  onVote: (song: Song) => void;
  songs: Song[];
}

function QueueItem({
  index,
  onDelete,
  onVote,
  song,
}: {
  index: number;
  onDelete?: () => void;
  onVote: () => void;
  song: Song;
}) {
  const theme = useAppTheme();
  const row = (
    <Pressable
      accessibilityLabel={`Vote for ${song.title}`}
      className="min-h-18 flex-row items-center gap-3 rounded-2xl border border-mobile-border bg-mobile-card p-3 active:border-accent active:bg-mobile-surface dark:border-mobile-dark-border dark:bg-mobile-dark-card dark:active:bg-mobile-dark-surface"
      onPress={onVote}
    >
      <Text className="w-5 text-center font-heading text-mobile-muted text-xs dark:text-mobile-dark-muted">
        {index + 1}
      </Text>
      <Image
        className="size-13 rounded-xl bg-black"
        source={song.thumbnailUrl}
        contentFit="cover"
        style={{ borderRadius: 12, height: 52, width: 52 }}
      />
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

  if (!onDelete) {
    return row;
  }

  return (
    <ReanimatedSwipeable
      overshootRight={false}
      renderRightActions={(_progress, _translation, swipeable) => (
        <Pressable
          accessibilityLabel={`Delete ${song.title}`}
          className="ml-2 w-20 items-center justify-center rounded-2xl bg-error"
          onPress={() => {
            swipeable.close();
            onDelete();
          }}
        >
          <ZoffIcon color="#ffffff" name="trash" size={20} />
          <Text className="mt-1 font-heading text-white text-xs">Delete</Text>
        </Pressable>
      )}
    >
      {row}
    </ReanimatedSwipeable>
  );
}

export function Queue({
  contained,
  header,
  onDelete,
  onVote,
  songs,
}: QueueProps) {
  return (
    <FlatList
      style={{ flex: 1 }}
      contentContainerStyle={contained ? containedQueueStyle : queueStyle}
      data={songs}
      initialNumToRender={8}
      keyExtractor={(song) => song.id}
      ListEmptyComponent={
        <View className="px-4">
          <Empty>No songs are queued yet.</Empty>
        </View>
      }
      ListHeaderComponent={
        <>
          {header}
          <View className="px-4 pt-4 pb-3">
            <Copy muted>UP NEXT ({songs.length})</Copy>
          </View>
        </>
      }
      maxToRenderPerBatch={8}
      renderItem={({ item, index }) => (
        <View className="px-4">
          <QueueItem
            index={index}
            onDelete={onDelete ? () => onDelete(item) : undefined}
            onVote={() => onVote(item)}
            song={item}
          />
        </View>
      )}
      ItemSeparatorComponent={() => <View className="h-3" />}
      windowSize={5}
    />
  );
}

const queueStyle = { paddingBottom: 112 };
const containedQueueStyle = {
  alignSelf: 'center' as const,
  maxWidth: 760,
  paddingBottom: 112,
  width: '100%' as const,
};
