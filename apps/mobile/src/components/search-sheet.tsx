import {
  generatedPlaylistPromptMaxLength,
  type Providers,
  type RoomType,
} from '@vibes/models';
import { classNames } from '@vibes/shared';
import { getProviderDisplayName, getRoomLabels } from '@vibes/ui/shared';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Button, Copy, Field, IconButton, Screen } from '@/components/native';
import { ScreenSafeArea as SafeAreaView } from '@/components/screen-safe-area';
import { SearchResults } from '@/components/search-results';
import { Toast } from '@/components/toast';
import { ZoffIcon } from '@/components/zoff-icon';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useProviderSearch } from '@/hooks/use-provider-search';

interface SearchRemoteCredentials {
  controllerToken: string;
  remoteId: string;
}

interface SearchSheetProps {
  roomType: RoomType;
  canGenerate: boolean;
  generationUnavailableReason: string;
  onAdded?: () => Promise<void>;
  onClose: () => void;
  onGenerated: () => Promise<void>;
  playlistImportAllowed: boolean;
  providersOverride?: Providers;
  remoteCredentials?: SearchRemoteCredentials;
  roomIdOverride?: string;
}

export function SearchSheet({
  roomType,
  canGenerate,
  generationUnavailableReason,
  onAdded,
  onClose,
  onGenerated,
  playlistImportAllowed,
  providersOverride,
  remoteCredentials,
  roomIdOverride,
}: SearchSheetProps) {
  const theme = useAppTheme();
  const labels = getRoomLabels(roomType);
  const [
    {
      enabledProviders,
      error,
      isAIMode,
      loading,
      playlist,
      provider,
      query,
      results,
    },
    { add, addPlaylist, search, setProvider, toggleAIMode, updateQuery },
  ] = useProviderSearch({
    roomType,
    canGenerate,
    generationUnavailableReason,
    onClose,
    onGenerated,
    playlistImportAllowed,
    ...(onAdded
      ? {
          onAdded,
        }
      : {}),
    ...(providersOverride
      ? {
          providersOverride,
        }
      : {}),
    ...(remoteCredentials
      ? {
          remoteCredentials,
        }
      : {}),
    ...(roomIdOverride
      ? {
          roomIdOverride,
        }
      : {}),
  });

  return (
    <Screen showGrid={false}>
      <SafeAreaView edges={['top', 'bottom']} style={safeAreaStyle}>
        <ScrollView
          contentInsetAdjustmentBehavior="never"
          contentContainerClassName="w-full max-w-3xl self-center px-5 pt-4 pb-32"
          keyboardShouldPersistTaps="handled"
        >
          <View className="mb-6">
            <View className="min-h-13 flex-row items-center justify-between">
              <Text
                className={classNames(
                  'font-heading text-2xl',
                  'text-mobile-text dark:text-mobile-dark-text',
                )}
              >
                {isAIMode ? 'Fill playlist' : labels.add}
              </Text>
              <IconButton
                accessibilityLabel={`Close ${labels.add.toLowerCase()}`}
                icon="close"
                onPress={onClose}
              />
            </View>
            <View className="mt-2">
              <Copy muted>
                {isAIMode
                  ? 'Describe the playlist you want AI to build.'
                  : playlistImportAllowed
                    ? `Search or paste a ${labels.item} or playlist link.`
                    : `Search or paste a ${labels.item} link.`}
              </Copy>
            </View>
          </View>
          {!isAIMode && (
            <View
              className={classNames(
                'mb-4 flex-row border p-1',
                'rounded-2xl border-mobile-border bg-mobile-card dark:border-mobile-dark-border dark:bg-mobile-dark-card',
              )}
            >
              {enabledProviders.map((source) => (
                <Pressable
                  accessibilityRole="tab"
                  accessibilityState={{
                    selected: provider === source,
                  }}
                  key={source}
                  className={classNames(
                    'min-h-11 flex-1 items-center justify-center px-3',
                    'rounded-xl',
                    provider === source && 'bg-accent',
                    provider !== source && 'bg-transparent',
                  )}
                  onPress={() => setProvider(source)}
                >
                  <Text
                    className={classNames(
                      'font-heading text-sm',
                      'text-mobile-text dark:text-mobile-dark-text',
                    )}
                  >
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
                inputClassName="max-h-13 overflow-hidden"
                multiline={false}
                numberOfLines={1}
                value={query}
                onChangeText={updateQuery}
                onSubmitEditing={() => void search()}
                placeholder={
                  isAIMode
                    ? roomType === 'WATCH'
                      ? 'A trip through the solar system'
                      : 'Late-night synthwave for a rainy drive'
                    : `Search ${labels.items} or paste a link`
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
                  'size-13 items-center justify-center border active:opacity-70',
                  'rounded-xl',
                  isAIMode && 'border-accent bg-accent',
                  !isAIMode &&
                    'border-mobile-border bg-mobile-card dark:border-mobile-dark-border dark:bg-mobile-dark-card',
                  !isAIMode && false && 'border-[#55ffad] bg-[#010c08]',
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
              {(playlist.skippedEmbeddingCount ?? 0) > 0 && (
                <Copy muted>
                  Skipped {playlist.skippedEmbeddingCount} videos because
                  YouTube does not allow them to play in embedded players.
                </Copy>
              )}
              {(playlist.skippedRoomTypeCount ?? 0) > 0 && (
                <Copy muted>
                  Skipped {playlist.skippedRoomTypeCount} non-music videos. Use
                  a Watch room to import videos from other categories.
                </Copy>
              )}
              {playlist.truncated && (
                <Copy muted>
                  Only the first 5,000 playlist entries are checked. Eligible
                  items from those entries will be imported.
                </Copy>
              )}
              <Button
                disabled={loading || playlist.items.length === 0}
                label={`Add all ${playlist.items.length} ${labels.items}`}
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
          {!isAIMode && playlist && playlist.items.length > 100 && (
            <Copy muted>
              and {(playlist.items.length - 100).toLocaleString()} more
            </Copy>
          )}
        </ScrollView>
      </SafeAreaView>
    </Screen>
  );
}
const safeAreaStyle = {
  flex: 1,
};
