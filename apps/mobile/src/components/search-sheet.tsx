import { type ApiClient, useProviderRequests } from '@vibes/api';
import type { MusicPlaylist, SearchResult, SourceType } from '@vibes/models';
import {
  parseISODuration,
  parseProviderPlaylistLink,
  parseProviderTrackLink,
} from '@vibes/shared';
import { Image } from 'expo-image';
import { useEffect, useRef, useState } from 'react';
import type { TextInput } from 'react-native';
import { FlatList, Modal, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  Button,
  Card,
  Copy,
  Field,
  Heading,
  Screen,
} from '@/components/native';
import { getRequestErrorMessage, mobileApi } from '@/lib/api';
import { useApp } from '@/providers/app-provider';

const supportedProviders: SourceType[] = ['youtube', 'spotify', 'soundcloud'];

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

  return (
    <Modal
      animationType="slide"
      presentationStyle="pageSheet"
      visible={visible}
      onRequestClose={onClose}
    >
      <Screen>
        <SafeAreaView className="flex-1 gap-3 p-4" edges={['top', 'bottom']}>
          <View className="flex-row items-center justify-between">
            <Heading>Add a song</Heading>
            <Button label="Done" tone="secondary" onPress={onClose} />
          </View>
          <Copy muted>Search by title, or paste a song or playlist link.</Copy>
          <View className="flex-row gap-2">
            {enabledProviders.map((source) => (
              <Pressable
                key={source}
                className={`min-h-10 justify-center rounded-xl px-4 ${
                  provider === source
                    ? 'bg-accent'
                    : 'bg-mobile-surface dark:bg-mobile-dark-surface'
                }`}
                onPress={() => setProvider(source)}
              >
                <Text className="font-mono text-mobile-text text-xs capitalize dark:text-mobile-dark-text">
                  {source}
                </Text>
              </Pressable>
            ))}
          </View>
          <View className="flex-row gap-2">
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
          {playlist && (
            <Button
              disabled={loading}
              label={`Add all ${playlist.tracks.length} songs`}
              onPress={() => void addPlaylist()}
            />
          )}
          {Boolean(error) && (
            <Text className="font-mono text-error text-xs">{error}</Text>
          )}
          <FlatList
            data={results}
            keyExtractor={(result) => `${result.source}:${result.id}`}
            renderItem={({ item }) => (
              <Pressable onPress={() => void add(item)}>
                <Card>
                  <View className="flex-row items-center gap-3">
                    <Image
                      className="h-13 w-17 rounded-xl bg-black"
                      source={item.thumbnailUrl}
                    />
                    <View className="min-w-0 flex-1 gap-1">
                      <Text
                        numberOfLines={2}
                        className="font-bold font-mono text-mobile-text text-sm dark:text-mobile-dark-text"
                      >
                        {item.title}
                      </Text>
                      <Copy muted>{item.channelTitle ?? item.source}</Copy>
                    </View>
                    <Text className="font-mono text-3xl text-accent">＋</Text>
                  </View>
                </Card>
              </Pressable>
            )}
            ItemSeparatorComponent={() => <View className="h-2" />}
          />
        </SafeAreaView>
      </Screen>
    </Modal>
  );
}
