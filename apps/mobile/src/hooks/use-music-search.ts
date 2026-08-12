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
  parseISODuration,
  parseProviderPlaylistLink,
  parseProviderTrackLink,
} from '@vibes/shared';
import { getProviderDisplayName } from '@vibes/ui/shared';
import { useEffect, useState } from 'react';
import { Keyboard } from 'react-native';
import { useToast } from '@/components/toast';
import { getRequestErrorMessage } from '@/lib/api';
import { useApp } from '@/providers/app-provider';

interface UseMusicSearchOptions {
  canGenerate: boolean;
  client: ApiClient;
  generationUnavailableReason: string;
  onAdded?: () => Promise<void>;
  onClose: () => void;
  onGenerated: () => Promise<void>;
  providersOverride?: Providers;
  roomIdOverride?: string;
}

interface MusicSearchController {
  add: (result: SearchResult) => Promise<void>;
  addPlaylist: () => Promise<void>;
  enabledProviders: SourceType[];
  error: string;
  isAIMode: boolean;
  loading: boolean;
  playlist: MusicPlaylist | null;
  provider: SourceType;
  query: string;
  results: SearchResult[];
  search: () => Promise<void>;
  setProvider: (provider: SourceType) => void;
  toggleAIMode: () => void;
  updateQuery: (query: string) => void;
}

export function useMusicSearch({
  canGenerate,
  client,
  generationUnavailableReason,
  onAdded,
  onClose,
  onGenerated,
  providersOverride,
  roomIdOverride,
}: UseMusicSearchOptions): MusicSearchController {
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

  const updateQuery = (nextQuery: string) => {
    setQuery(
      isAIMode
        ? nextQuery.slice(0, generatedPlaylistPromptMaxLength)
        : nextQuery,
    );
    setError('');
    setPlaylist(null);
  };

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
          `Could not search ${getProviderDisplayName(provider)}. Check your connection and try again.`,
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
    if (onAdded) await onAdded();
    if (!onAdded) await refresh();
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
    if (onAdded) await onAdded();
    if (!onAdded) await refresh();
    onClose();
  };

  return {
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
  };
}

const supportedProviders: SourceType[] = ['youtube', 'spotify', 'soundcloud'];
