import type { SearchResult, SourceType } from '@vibes/models';
import { classNames } from '@vibes/shared';
import { Image } from 'expo-image';
import { Pressable, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Empty } from '@/components/native';
import { ZoffIcon } from '@/components/zoff-icon';

interface SearchResultsProps {
  loading: boolean;
  onAdd: (result: SearchResult) => Promise<void>;
  provider: SourceType;
  providerLabels: Record<SourceType, string>;
  results: SearchResult[];
}

export function SearchResults({
  loading,
  onAdd,
  provider,
  providerLabels,
  results,
}: SearchResultsProps) {
  return (
    <View>
      {results.map((result, index) => (
        <View
          className={classNames(index > 0 && 'mt-4')}
          key={`${result.source}:${result.id}`}
        >
          <Animated.View
            entering={FadeInDown.duration(180).delay(Math.min(index, 8) * 24)}
          >
            <Pressable
              accessibilityLabel={`Add ${result.title}`}
              className="min-h-19 flex-row items-center gap-4 rounded-2xl border border-mobile-border bg-mobile-card p-4 active:border-accent active:bg-mobile-surface dark:border-mobile-dark-border dark:bg-mobile-dark-card dark:active:bg-mobile-dark-surface"
              onPress={() => void onAdd(result)}
            >
              <Image
                className="h-14 w-18 rounded-xl"
                contentFit="cover"
                source={result.thumbnailUrl}
              />
              <View className="min-w-0 flex-1 gap-1">
                <Text
                  numberOfLines={2}
                  className="font-bold font-heading text-mobile-text text-sm dark:text-mobile-dark-text"
                >
                  {result.title}
                </Text>
                <Text
                  numberOfLines={1}
                  className="font-heading text-mobile-muted text-xs dark:text-mobile-dark-muted"
                >
                  {result.channelTitle ?? providerLabels[result.source]}
                </Text>
              </View>
              <View className="size-10 items-center justify-center rounded-xl bg-primary">
                <ZoffIcon color="#ffffff" name="add" size={16} />
              </View>
            </Pressable>
          </Animated.View>
        </View>
      ))}
      {results.length === 0 && (
        <View className="min-h-64 px-8">
          {loading && <Empty loading>Searching for music…</Empty>}
          {!loading && (
            <Empty>
              Search {providerLabels[provider]} or paste a direct link.
            </Empty>
          )}
        </View>
      )}
    </View>
  );
}
