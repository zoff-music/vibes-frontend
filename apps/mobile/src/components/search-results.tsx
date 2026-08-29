import type { SearchResult, SourceType } from '@vibes/models';
import { classNames } from '@vibes/shared';
import { useNativePresentation } from '@vibes/ui/native';
import { getProviderDisplayName } from '@vibes/ui/shared';
import { Image } from 'expo-image';
import { Pressable, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Empty } from '@/components/native';
import { ZoffIcon } from '@/components/zoff-icon';

interface SearchResultsProps {
  loading: boolean;
  onAdd: (result: SearchResult) => Promise<void>;
  provider: SourceType;
  results: SearchResult[];
}

export function SearchResults({
  loading,
  onAdd,
  provider,
  results,
}: SearchResultsProps) {
  const terminal = useNativePresentation() === 'terminal';

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
              className={classNames(
                'min-h-19 flex-row items-center gap-4 border p-4',
                !terminal &&
                  'rounded-2xl border-mobile-border bg-mobile-card active:border-accent active:bg-mobile-surface dark:border-mobile-dark-border dark:bg-mobile-dark-card dark:active:bg-mobile-dark-surface',
                terminal &&
                  'border-[#55ffad]/45 bg-[#010c08] active:border-[#71f5ad] active:bg-[#03150d]',
              )}
              onPress={() => void onAdd(result)}
            >
              <View className="h-14 w-18 overflow-hidden rounded-xl bg-black">
                <Image
                  contentFit="cover"
                  source={result.thumbnailUrl}
                  style={thumbnailImageStyle}
                />
              </View>
              <View className="min-w-0 flex-1 gap-1">
                <Text
                  numberOfLines={2}
                  className={classNames(
                    'font-bold font-heading text-sm',
                    !terminal && 'text-mobile-text dark:text-mobile-dark-text',
                    terminal && 'text-[#dffff0]',
                  )}
                >
                  {result.title}
                </Text>
                <Text
                  numberOfLines={1}
                  className={classNames(
                    'font-heading text-xs',
                    !terminal &&
                      'text-mobile-muted dark:text-mobile-dark-muted',
                    terminal && 'text-[#a6ffd0]/65',
                  )}
                >
                  {result.channelTitle ?? getProviderDisplayName(result.source)}
                </Text>
              </View>
              <View
                className={classNames(
                  'size-10 items-center justify-center',
                  !terminal && 'rounded-xl bg-primary',
                  terminal && 'border border-[#55ffad] bg-[#71f5ad]',
                )}
              >
                <ZoffIcon
                  color={terminal ? '#03150d' : '#ffffff'}
                  name="add"
                  size={16}
                />
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
              Search {getProviderDisplayName(provider)} or paste a direct link.
            </Empty>
          )}
        </View>
      )}
    </View>
  );
}

const thumbnailImageStyle = { height: '100%' as const, width: '100%' as const };
