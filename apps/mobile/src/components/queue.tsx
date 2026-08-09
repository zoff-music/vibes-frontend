import { FlashList } from '@shopify/flash-list';
import type { Song } from '@vibes/models';
import { Image } from 'expo-image';
import { Pressable, Text, View } from 'react-native';

import { Copy, Empty } from '@/components/native';

interface QueueProps {
  onVote: (song: Song) => void;
  songs: Song[];
}

function QueueItem({
  index,
  onVote,
  song,
}: {
  index: number;
  onVote: () => void;
  song: Song;
}) {
  return (
    <View className="min-h-19 flex-row items-center gap-3 rounded-2xl border border-mobile-border bg-mobile-card p-3 dark:border-mobile-dark-border dark:bg-mobile-dark-card">
      <Text className="w-5 text-center font-mono text-mobile-muted text-xs dark:text-mobile-dark-muted">
        {index + 1}
      </Text>
      <Image
        className="size-13 rounded-xl bg-black"
        source={song.thumbnailUrl}
        contentFit="cover"
      />
      <View className="min-w-0 flex-1 gap-1">
        <Text
          numberOfLines={1}
          className="font-bold font-mono text-mobile-text text-sm dark:text-mobile-dark-text"
        >
          {song.title}
        </Text>
        <Text
          numberOfLines={1}
          className="font-mono text-mobile-muted text-xs dark:text-mobile-dark-muted"
        >
          {song.artist ?? song.sourceType}
        </Text>
      </View>
      <Pressable
        accessibilityLabel={`Vote for ${song.title}`}
        className="min-h-10 min-w-14 items-center justify-center rounded-xl border border-mobile-border px-2 active:opacity-60 dark:border-mobile-dark-border"
        onPress={onVote}
      >
        <Text className="font-bold font-mono text-accent text-xs">
          👍 {song.voteCount ?? 0}
        </Text>
      </Pressable>
    </View>
  );
}

export function Queue({ onVote, songs }: QueueProps) {
  if (songs.length === 0) {
    return <Empty>No songs are queued yet.</Empty>;
  }
  return (
    <View className="flex-1 px-4">
      <FlashList
        data={songs}
        keyExtractor={(song) => song.id}
        renderItem={({ item, index }) => (
          <QueueItem index={index} onVote={() => onVote(item)} song={item} />
        )}
        ItemSeparatorComponent={() => <View className="h-3" />}
        ListHeaderComponent={
          <View className="pb-3">
            <Copy muted>UP NEXT ({songs.length})</Copy>
          </View>
        }
        ListFooterComponent={<View className="h-28" />}
      />
    </View>
  );
}
