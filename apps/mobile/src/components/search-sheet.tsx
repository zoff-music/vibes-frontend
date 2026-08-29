import type { Providers } from '@vibes/models';
import { generatedPlaylistPromptMaxLength } from '@vibes/models';
import { classNames } from '@vibes/shared';
import { useNativePresentation } from '@vibes/ui/native';
import { getProviderDisplayName } from '@vibes/ui/shared';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Copy, Field, IconButton, Screen } from '@/components/native';
import { SearchResults } from '@/components/search-results';
import { Toast } from '@/components/toast';
import { ZoffIcon } from '@/components/zoff-icon';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useMusicSearch } from '@/hooks/use-music-search';

interface SearchRemoteCredentials {
  controllerToken: string;
  remoteId: string;
}

interface SearchSheetProps {
  canGenerate: boolean;
  generationUnavailableReason: string;
  onAdded?: () => Promise<void>;
  onClose: () => void;
  onGenerated: () => Promise<void>;
  playlistImportAllowed: boolean;
  providersOverride?: Providers;
  remoteCredentials?: SearchRemoteCredentials;
  roomIdOverride?: string;
  visible: boolean;
}

export function SearchSheet({
  canGenerate,
  generationUnavailableReason,
  onAdded,
  onClose,
  onGenerated,
  playlistImportAllowed,
  providersOverride,
  remoteCredentials,
  roomIdOverride,
  visible,
}: SearchSheetProps) {
  const theme = useAppTheme();
  const terminal = useNativePresentation() === 'terminal';
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
  ] = useMusicSearch({
    canGenerate,
    generationUnavailableReason,
    onClose,
    onGenerated,
    playlistImportAllowed,
    ...(onAdded ? { onAdded } : {}),
    ...(providersOverride ? { providersOverride } : {}),
    ...(remoteCredentials ? { remoteCredentials } : {}),
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
              <Text
                className={classNames(
                  'font-heading text-2xl',
                  !terminal && 'text-mobile-text dark:text-mobile-dark-text',
                  terminal && 'text-[#dffff0]',
                )}
              >
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
                  : playlistImportAllowed
                    ? 'Search or paste a song or playlist link.'
                    : 'Search or paste a song link.'}
              </Copy>
            </View>
          </View>
          {!isAIMode && (
            <View
              className={classNames(
                'mb-4 flex-row border p-1',
                !terminal &&
                  'rounded-2xl border-mobile-border bg-mobile-card dark:border-mobile-dark-border dark:bg-mobile-dark-card',
                terminal && 'border-[#55ffad] bg-[#010c08]',
              )}
            >
              {enabledProviders.map((source) => (
                <Pressable
                  accessibilityRole="tab"
                  accessibilityState={{ selected: provider === source }}
                  key={source}
                  className={classNames(
                    'min-h-11 flex-1 items-center justify-center px-3',
                    !terminal && 'rounded-xl',
                    !terminal && provider === source && 'bg-accent',
                    terminal &&
                      provider === source &&
                      'border border-[#55ffad] bg-[#71f5ad]',
                    provider !== source && 'bg-transparent',
                  )}
                  onPress={() => setProvider(source)}
                >
                  <Text
                    className={classNames(
                      'font-heading text-sm',
                      !terminal &&
                        'text-mobile-text dark:text-mobile-dark-text',
                      terminal && provider !== source && 'text-[#dffff0]',
                      terminal && provider === source && 'text-[#03150d]',
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
                  'size-13 items-center justify-center border active:opacity-70',
                  !terminal && 'rounded-xl',
                  !terminal && isAIMode && 'border-accent bg-accent',
                  terminal && isAIMode && 'border-[#55ffad] bg-[#71f5ad]',
                  !isAIMode &&
                    !terminal &&
                    'border-mobile-border bg-mobile-card dark:border-mobile-dark-border dark:bg-mobile-dark-card',
                  !isAIMode && terminal && 'border-[#55ffad] bg-[#010c08]',
                  !canGenerate && 'opacity-45',
                )}
                onPress={toggleAIMode}
              >
                <ZoffIcon
                  color={
                    isAIMode ? (terminal ? '#03150d' : '#ffffff') : theme.text
                  }
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
