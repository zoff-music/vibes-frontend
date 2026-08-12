import {
  type ApiClient,
  useProviderRequests,
  useRoomRequests,
} from '@vibes/api';
import type {
  MusicPlaylist,
  Providers,
  SearchResult,
  SourceType,
} from '@vibes/models';
import { generatedPlaylistPromptMaxLength } from '@vibes/models';
import {
  classNames,
  parseISODuration,
  parseProviderPlaylistLink,
  parseProviderTrackLink,
} from '@vibes/shared';
import { useEffect, useState } from 'react';
import { Keyboard, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Copy, Field, IconButton, Screen } from '@/components/native';
import { SearchResults } from '@/components/search-results';
import { Toast, useToast } from '@/components/toast';
import { ZoffIcon } from '@/components/zoff-icon';
import { useAppTheme } from '@/hooks/use-app-theme';
import { getRequestErrorMessage, mobileApi } from '@/lib/api';
import { useApp } from '@/providers/app-provider';

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
  const { showToast } = useToast();
  const { providers, refresh, roomId } = useApp();
  const providerRequests = useProviderRequests(client);
  const roomRequests = useRoomRequests(client);
  const [provider, setProvider] = useState<SourceType>('youtube');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [playlist, setPlaylist] = useState<MusicPlaylist | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isAIMode, setIsAIMode] = useState(false);
  const targetRoomId = roomIdOverride ?? roomId;
  const roomProviders = providersOverride ?? providers;
  const enabledProviders = supportedProviders.filter(
    (source) => providers.includes(source) && roomProviders.includes(source),
  );

  useEffect(() => {
    if (enabledProviders.length === 0 || enabledProviders.includes(provider)) {
      return;
    }
    setProvider(enabledProviders[0]);
  }, [enabledProviders, provider]);

  const toggleAIMode = () => {
    if (!canGenerate) {
      showToast(generationUnavailableReason);
      return;
    }
    setIsAIMode((current) => !current);
    setQuery('');
    setResults([]);
    setPlaylist(null);
    setError('');
  };

  const generate = async () => {
    if (!targetRoomId) {
      setError('Join a room before generating a playlist.');
      return;
    }
    if (!canGenerate) {
      setError(generationUnavailableReason);
      return;
    }
    const prompt = query.trim();
    if (!prompt) {
      setError('Describe the playlist you want.');
      return;
    }
    setLoading(true);
    const [requestError, result] = await roomRequests.generatePlaylist(
      targetRoomId,
      { prompt },
    );
    setLoading(false);
    if (requestError || !result) {
      setError(
        await getRequestErrorMessage(
          requestError,
          'Could not start playlist generation.',
        ),
      );
      return;
    }
    await onGenerated();
    setQuery('');
    setError('');
    onClose();
  };

  const search = async () => {
    if (isAIMode) {
      await generate();
      return;
    }
    const trimmedQuery = query.trim();
    if (enabledProviders.length === 0) {
      setError('This room has no enabled music providers.');
      return;
    }
    const playlistLink = parseProviderPlaylistLink(trimmedQuery);
    const trackLink = parseProviderTrackLink(trimmedQuery);
    if (!playlistLink && !trackLink && trimmedQuery.length < 3) {
      setError('Search needs at least 3 characters.');
      return;
    }
    setError('');
    setPlaylist(null);
    setLoading(true);
    Keyboard.dismiss();

    if (playlistLink) {
      if (!enabledProviders.includes(playlistLink.provider)) {
        setLoading(false);
        setError(`${playlistLink.provider} is not enabled in this room.`);
        return;
      }
      setProvider(playlistLink.provider);
      const [requestError, nextPlaylist] =
        playlistLink.provider === 'youtube' && playlistLink.sourceId
          ? await providerRequests.fetchYouTubePlaylist(playlistLink.sourceId)
          : playlistLink.provider === 'spotify' && playlistLink.sourceId
            ? await providerRequests.fetchSpotifyPlaylist(playlistLink.sourceId)
            : await providerRequests.fetchSoundCloudPlaylist(
                playlistLink.providerUrl ?? '',
              );
      setLoading(false);
      if (requestError || !nextPlaylist) {
        setError(
          await getRequestErrorMessage(
            requestError,
            'Could not load this playlist.',
          ),
        );
        return;
      }
      setPlaylist(nextPlaylist);
      setResults(nextPlaylist.tracks);
      return;
    }

    if (trackLink) {
      if (!enabledProviders.includes(trackLink.provider)) {
        setLoading(false);
        setError(`${trackLink.provider} is not enabled in this room.`);
        return;
      }
      setProvider(trackLink.provider);
      if (trackLink.provider === 'youtube' && trackLink.sourceId) {
        const [requestError, track] = await providerRequests.fetchYouTubeTrack(
          trackLink.sourceId,
        );
        setLoading(false);
        if (requestError || !track) {
          setError(
            await getRequestErrorMessage(
              requestError,
              'Could not load this song.',
            ),
          );
          return;
        }
        setResults([{ ...track, source: 'youtube' }]);
        return;
      }
      if (trackLink.provider === 'spotify' && trackLink.sourceId) {
        const [requestError, track] = await providerRequests.fetchSpotifyTrack(
          trackLink.sourceId,
        );
        setLoading(false);
        if (requestError || !track) {
          setError(
            await getRequestErrorMessage(
              requestError,
              'Could not load this song.',
            ),
          );
          return;
        }
        setResults([track]);
        return;
      }
      const [requestError, track] = await providerRequests.fetchSoundCloudTrack(
        trackLink.providerUrl ?? '',
      );
      setLoading(false);
      if (requestError || !track) {
        setError(
          await getRequestErrorMessage(
            requestError,
            'Could not load this song.',
          ),
        );
        return;
      }
      setResults([track]);
      return;
    }

    if (provider === 'youtube') {
      const [requestError, videos] =
        await providerRequests.searchYouTube(trimmedQuery);
      setLoading(false);
      if (requestError || !videos) {
        setError(
          await getRequestErrorMessage(
            requestError,
            'Could not search YouTube. Check your connection and try again.',
          ),
        );
        return;
      }
      setResults(videos.map((video) => ({ ...video, source: 'youtube' })));
      return;
    }
    const [requestError, nextResults] =
      provider === 'spotify'
        ? await providerRequests.searchSpotify(trimmedQuery)
        : await providerRequests.searchSoundCloud(trimmedQuery);
    setLoading(false);
    if (requestError || !nextResults) {
      setError(
        await getRequestErrorMessage(
          requestError,
          `Could not search ${providerLabels[provider]}. Check your connection and try again.`,
        ),
      );
      return;
    }
    setResults(nextResults);
  };

  const add = async (result: SearchResult) => {
    if (!targetRoomId) {
      setError('Join a room before adding music.');
      return;
    }
    const [requestError] = await providerRequests.addSong(targetRoomId, {
      sourceType: result.source,
      sourceId: result.id,
      providerUrl: result.providerUrl,
      title: result.title,
      artist: result.channelTitle,
      thumbnailUrl: result.thumbnailUrl ?? '',
      duration: parseISODuration(result.duration),
    });
    if (requestError) {
      setError(
        await getRequestErrorMessage(requestError, 'Could not add this song.'),
      );
      return;
    }
    if (onAdded) {
      await onAdded();
    } else {
      await refresh();
    }
    onClose();
  };

  const addPlaylist = async () => {
    if (!targetRoomId) {
      setError('Join a room before adding a playlist.');
      return;
    }
    if (!playlist || playlist.tracks.length === 0) return;
    setLoading(true);
    const [requestError] = await providerRequests.addPlaylist(targetRoomId, {
      songs: playlist.tracks.map((track) => ({
        artist: track.channelTitle,
        duration: parseISODuration(track.duration),
        providerUrl: track.providerUrl,
        sourceId: track.id,
        sourceType: track.source,
        thumbnailUrl: track.thumbnailUrl ?? '',
        title: track.title,
      })),
    });
    setLoading(false);
    if (requestError) {
      setError(
        await getRequestErrorMessage(
          requestError,
          'Could not add this playlist.',
        ),
      );
      return;
    }
    if (onAdded) {
      await onAdded();
    } else {
      await refresh();
    }
    onClose();
  };

  if (!visible) return null;

  return (
    <Screen>
      <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
        <ScrollView
          contentContainerClassName="px-5 pt-4 pb-32"
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
                    {providerLabels[source]}
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
                onChangeText={(value) => {
                  setQuery(
                    isAIMode
                      ? value.slice(0, generatedPlaylistPromptMaxLength)
                      : value,
                  );
                  setError('');
                  setPlaylist(null);
                }}
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
              providerLabels={providerLabels}
              results={results}
            />
          )}
        </ScrollView>
      </SafeAreaView>
    </Screen>
  );
}

const providerLabels: Record<SourceType, string> = {
  soundcloud: 'SoundCloud',
  spotify: 'Spotify',
  youtube: 'YouTube',
};

const supportedProviders: SourceType[] = ['youtube', 'spotify', 'soundcloud'];
