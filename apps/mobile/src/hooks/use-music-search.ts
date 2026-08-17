import {
  type ApiClient,
  useProviderPlaylistRequest,
  useProviderSearchRequest,
  useProviderTrackRequest,
  useQueueAddRequests,
  useRoomQueueRequests,
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
  const fetchPlaylist = useProviderPlaylistRequest(client);
  const fetchTrack = useProviderTrackRequest(client);
  const searchProvider = useProviderSearchRequest(client);
  const queueAddRequests = useQueueAddRequests(client);
  const queueRequests = useRoomQueueRequests(client);
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
    const [requestError, result] = await queueRequests.generatePlaylist(
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
      const playlistSource =
        playlistLink.sourceId ?? playlistLink.providerUrl ?? '';
      const [requestError, nextPlaylist] = await fetchPlaylist(
        playlistLink.provider,
        playlistSource,
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
      const trackSource = trackLink.sourceId ?? trackLink.providerUrl ?? '';
      const [requestError, track] = await fetchTrack(
        trackLink.provider,
        trackSource,
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

    const [requestError, nextResults] = await searchProvider(
      provider,
      trimmedQuery,
    );
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
    const [requestError] = await queueAddRequests.addSong(targetRoomId, {
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
    const [requestError] = await queueAddRequests.addPlaylist(targetRoomId, {
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
