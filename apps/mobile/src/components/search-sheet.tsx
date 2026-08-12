import type { ApiClient } from '@vibes/api';
import type { Providers } from '@vibes/models';
import { generatedPlaylistPromptMaxLength } from '@vibes/models';
import { classNames } from '@vibes/shared';
import { getProviderDisplayName } from '@vibes/ui/shared';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Copy, Field, IconButton, Screen } from '@/components/native';
import { SearchResults } from '@/components/search-results';
import { Toast } from '@/components/toast';
import { ZoffIcon } from '@/components/zoff-icon';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useMusicSearch } from '@/hooks/use-music-search';
import { mobileApi } from '@/lib/api';

interface SearchSheetProps {
  canGenerate: boolean;
  client?: ApiClient;
  generationUnavailableReason: string;
  onAdded?: () => Promise<void>;
  onClose: () => void;
  onGenerated: () => Promise<void>;
  providersOverride?: Providers;
  roomIdOverride?: string;
  visible: boolean;
}

export function SearchSheet({
  canGenerate,
  client = mobileApi,
  generationUnavailableReason,
  onAdded,
  onClose,
  onGenerated,
  providersOverride,
  roomIdOverride,
  visible,
}: SearchSheetProps) {
  const theme = useAppTheme();
  const {
    add,
    addPlaylist,
    enabledProviders,
    error,
    isAIMode,
    loading,
    playlist,
    provider,
    query,
    results,
    search,
    setProvider,
    toggleAIMode,
    updateQuery,
  } = useMusicSearch({
    canGenerate,
    client,
    generationUnavailableReason,
    onClose,
    onGenerated,
    ...(onAdded ? { onAdded } : {}),
    ...(providersOverride ? { providersOverride } : {}),
    ...(roomIdOverride ? { roomIdOverride } : {}),
  });

  if (!visible) return null;

  return (
    <Screen>
      <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
        <ScrollView
          contentContainerClassName="w-full max-w-3xl self-center px-5 pt-4 pb-32"
          keyboardShouldPersistTaps="handled"
        >
          <View className="mb-6">
            <View className="min-h-13 flex-row items-center justify-between">
              <Text className="font-heading text-2xl text-mobile-text dark:text-mobile-dark-text">
                {isAIMode ? 'Fill playlist' : 'Add music'}
              </Text>
              <IconButton
                accessibilityLabel="Close add music"
                icon="close"
                onPress={onClose}
              />
            </View>
            <View className="mt-2">
              <Copy muted>
                {isAIMode
                  ? 'Describe the playlist you want AI to build.'
                  : 'Search or paste a song or playlist link.'}
              </Copy>
            </View>
          </View>
          {!isAIMode && (
            <View className="mb-4 flex-row rounded-2xl border border-mobile-border bg-mobile-card p-1 dark:border-mobile-dark-border dark:bg-mobile-dark-card">
              {enabledProviders.map((source) => (
                <Pressable
                  accessibilityRole="tab"
                  accessibilityState={{ selected: provider === source }}
                  key={source}
                  className={classNames(
                    'min-h-11 flex-1 items-center justify-center rounded-xl px-3',
                    provider === source && 'bg-accent',
                    provider !== source && 'bg-transparent',
                  )}
                  onPress={() => setProvider(source)}
                >
                  <Text className="font-heading text-mobile-text text-sm dark:text-mobile-dark-text">
                    {getProviderDisplayName(source)}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
          <View className="mb-4 flex-row items-center gap-3">
            <View className="min-w-0 flex-1">
              <Field
                autoCapitalize={isAIMode ? 'sentences' : 'none'}
                value={query}
                onChangeText={updateQuery}
                onSubmitEditing={() => void search()}
                placeholder={
                  isAIMode
                    ? 'Late-night synthwave for a rainy drive'
                    : 'Search music or paste a link'
                }
              />
            </View>
            <View className="size-13">
              <Pressable
                accessibilityLabel={
                  isAIMode ? 'Turn off AI mode' : 'Fill playlist with AI'
                }
                accessibilityRole="switch"
                accessibilityState={{
                  checked: isAIMode,
                }}
                className={classNames(
                  'size-13 items-center justify-center rounded-xl border active:opacity-70',
                  isAIMode && 'border-accent bg-accent',
                  !isAIMode &&
                    'border-mobile-border bg-mobile-card dark:border-mobile-dark-border dark:bg-mobile-dark-card',
                  !canGenerate && 'opacity-45',
                )}
                onPress={toggleAIMode}
              >
                <ZoffIcon
                  color={isAIMode ? '#ffffff' : theme.text}
                  name="sparkles"
                  size={22}
                />
              </Pressable>
            </View>
          </View>
          {isAIMode && (
            <View className="mb-4">
              <Copy muted>
                {query.length}/{generatedPlaylistPromptMaxLength}
              </Copy>
            </View>
          )}
          {!canGenerate && (
            <View className="mb-4">
              <Copy muted>{generationUnavailableReason}</Copy>
            </View>
          )}
          <View className="mb-4">
            <Button
              disabled={
                loading || (isAIMode && (!canGenerate || !query.trim()))
              }
              icon={isAIMode ? 'sparkles' : 'search'}
              label={
                loading
                  ? isAIMode
                    ? 'Starting generation…'
                    : 'Searching…'
                  : isAIMode
                    ? 'Generate playlist'
                    : 'Search'
              }
              onPress={() => void search()}
            />
          </View>
          {playlist && !isAIMode && (
            <View className="mb-4">
              <Button
                disabled={loading}
                label={`Add all ${playlist.tracks.length} songs`}
                onPress={() => void addPlaylist()}
              />
            </View>
          )}
          <Toast message={error} />
          {!isAIMode && (
            <SearchResults
              loading={loading}
              onAdd={add}
              provider={provider}
              results={results}
            />
          )}
        </ScrollView>
      </SafeAreaView>
    </Screen>
  );
}
