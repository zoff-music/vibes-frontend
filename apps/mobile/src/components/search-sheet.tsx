import { type ApiClient, useProviderRequests } from '@vibes/api';
import type { MusicPlaylist, SearchResult, SourceType } from '@vibes/models';
import {
  parseISODuration,
  parseProviderPlaylistLink,
  parseProviderTrackLink,
} from '@vibes/shared';
import { Image } from 'expo-image';
import { useEffect, useRef, useState } from 'react';
import type { ListRenderItemInfo, TextInput } from 'react-native';
import { FlatList, Keyboard, Modal, Pressable, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  Button,
  Copy,
  Empty,
  Field,
  IconButton,
  Screen,
} from '@/components/native';
import { ZoffIcon } from '@/components/zoff-icon';
import { getRequestErrorMessage, mobileApi } from '@/lib/api';
import { useApp } from '@/providers/app-provider';

interface SearchSheetProps {
  client?: ApiClient;
  onAdded?: () => Promise<void>;
  onClose: () => void;
  roomIdOverride?: string;
  visible: boolean;
}

export function SearchSheet({
  client = mobileApi,
  onAdded,
  onClose,
  roomIdOverride,
  visible,
}: SearchSheetProps) {
  const { providers, refresh, roomId } = useApp();
  const providerRequests = useProviderRequests(client);
  const [provider, setProvider] = useState<SourceType>('youtube');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [playlist, setPlaylist] = useState<MusicPlaylist | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<TextInput>(null);
  const targetRoomId = roomIdOverride ?? roomId;
  const enabledProviders = supportedProviders.filter((source) =>
    providers.includes(source),
  );

  useEffect(() => {
    if (visible) setTimeout(() => inputRef.current?.focus(), 250);
  }, [visible]);

  const search = async () => {
    const trimmedQuery = query.trim();
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
        setError(await getRequestErrorMessage(requestError, 'Search failed.'));
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
      setError(await getRequestErrorMessage(requestError, 'Search failed.'));
      return;
    }
    setResults(nextResults);
  };

  const add = async (result: SearchResult) => {
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

  const renderResult = ({ item, index }: ListRenderItemInfo<SearchResult>) => (
    <Animated.View
      entering={FadeInDown.duration(180).delay(Math.min(index, 8) * 24)}
    >
      <Pressable
        accessibilityLabel={`Add ${item.title}`}
        className="min-h-19 flex-row items-center gap-4 rounded-2xl border border-mobile-border bg-mobile-card p-4 active:border-accent active:bg-mobile-surface dark:border-mobile-dark-border dark:bg-mobile-dark-card dark:active:bg-mobile-dark-surface"
        onPress={() => void add(item)}
      >
        <Image
          contentFit="cover"
          source={item.thumbnailUrl}
          style={{ borderRadius: 12, height: 56, width: 72 }}
        />
        <View className="min-w-0 flex-1 gap-1">
          <Text
            numberOfLines={2}
            className="font-bold font-heading text-mobile-text text-sm dark:text-mobile-dark-text"
          >
            {item.title}
          </Text>
          <Text
            numberOfLines={1}
            className="font-heading text-mobile-muted text-xs dark:text-mobile-dark-muted"
          >
            {item.channelTitle ?? providerLabels[item.source]}
          </Text>
        </View>
        <View className="size-10 items-center justify-center rounded-xl bg-primary">
          <ZoffIcon color="#ffffff" name="add" size={16} />
        </View>
      </Pressable>
    </Animated.View>
  );

  return (
    <Modal
      animationType="slide"
      presentationStyle="pageSheet"
      visible={visible}
      onRequestClose={onClose}
    >
      <Screen>
        <SafeAreaView
          className="flex-1"
          edges={['top', 'bottom']}
          style={{ flex: 1, padding: 16 }}
        >
          <View className="mb-4 flex-row items-center justify-between gap-4">
            <IconButton
              accessibilityLabel="Close music search"
              icon="close"
              onPress={onClose}
            />
            <View className="min-w-0 flex-1 gap-0.5">
              <Text className="font-heading text-2xl text-mobile-text dark:text-mobile-dark-text">
                Add music
              </Text>
              <Copy muted>Search or paste a song or playlist link.</Copy>
            </View>
          </View>
          <View className="mb-4 gap-4">
            <View className="flex-row rounded-2xl border border-mobile-border bg-mobile-card p-1 dark:border-mobile-dark-border dark:bg-mobile-dark-card">
              {enabledProviders.map((source) => (
                <Pressable
                  accessibilityRole="tab"
                  accessibilityState={{ selected: provider === source }}
                  key={source}
                  className={`min-h-11 flex-1 items-center justify-center rounded-xl px-3 ${
                    provider === source ? 'bg-accent' : 'bg-transparent'
                  }`}
                  onPress={() => setProvider(source)}
                >
                  <Text className="font-heading text-mobile-text text-sm dark:text-mobile-dark-text">
                    {providerLabels[source]}
                  </Text>
                </Pressable>
              ))}
            </View>
            <View className="flex-row gap-3">
              <View className="flex-1">
                <Field
                  ref={inputRef}
                  value={query}
                  onChangeText={(value) => {
                    setQuery(value);
                    setError('');
                    setPlaylist(null);
                  }}
                  onSubmitEditing={() => void search()}
                  placeholder="Search music"
                />
              </View>
              <Button
                disabled={loading}
                label={loading ? 'Searching…' : 'Search'}
                onPress={() => void search()}
              />
            </View>
          </View>
          {playlist && (
            <View className="mb-4">
              <Button
                disabled={loading}
                label={`Add all ${playlist.tracks.length} songs`}
                onPress={() => void addPlaylist()}
              />
            </View>
          )}
          {Boolean(error) && (
            <Text className="mb-4 font-heading text-error text-xs">
              {error}
            </Text>
          )}
          <FlatList
            contentContainerStyle={{ flexGrow: 1, paddingBottom: 16 }}
            data={results}
            keyboardShouldPersistTaps="handled"
            keyExtractor={(result) => `${result.source}:${result.id}`}
            ListEmptyComponent={
              <View className="flex-1 px-8">
                {loading && <Empty loading>Searching for music…</Empty>}
                {!loading && (
                  <Empty>
                    Search {providerLabels[provider]} or paste a direct link.
                  </Empty>
                )}
              </View>
            }
            renderItem={renderResult}
            ItemSeparatorComponent={ResultSeparator}
          />
        </SafeAreaView>
      </Screen>
    </Modal>
  );
}

function ResultSeparator() {
  return <View className="h-4" />;
}

const providerLabels: Record<SourceType, string> = {
  soundcloud: 'SoundCloud',
  spotify: 'Spotify',
  youtube: 'YouTube',
};

const supportedProviders: SourceType[] = ['youtube', 'spotify', 'soundcloud'];
