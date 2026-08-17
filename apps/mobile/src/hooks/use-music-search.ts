import type {
  MusicPlaylist,
  Providers,
  SearchResult,
  SourceType,
} from '@vibes/models';
import { generatedPlaylistPromptMaxLength } from '@vibes/models';
import { useFetcher } from '@vibes/native-router';
import {
  parseISODuration,
  parseProviderPlaylistLink,
  parseProviderTrackLink,
} from '@vibes/shared';
import { useEffect, useState } from 'react';
import { Keyboard } from 'react-native';
import { useToast } from '@/components/toast';
import { useRoomActions, useRoomSession } from '@/providers/app-provider';
import type { SearchActionData } from '@/routes/rooms.$id.search/action';
import type { SearchData } from '@/routes/rooms.$id.search/loader';

interface SearchRemoteCredentials {
  controllerToken: string;
  remoteId: string;
}

interface UseMusicSearchOptions {
  canGenerate: boolean;
  generationUnavailableReason: string;
  onAdded?: () => Promise<void>;
  onClose: () => void;
  onGenerated: () => Promise<void>;
  providersOverride?: Providers;
  remoteCredentials?: SearchRemoteCredentials;
  roomIdOverride?: string;
}

interface MusicSearchActions {
  add: (result: SearchResult) => Promise<void>;
  addPlaylist: () => Promise<void>;
  search: () => Promise<void>;
  setProvider: (provider: SourceType) => void;
  toggleAIMode: () => void;
  updateQuery: (query: string) => void;
}

interface MusicSearchState {
  enabledProviders: SourceType[];
  error: string;
  isAIMode: boolean;
  loading: boolean;
  playlist: MusicPlaylist | null;
  provider: SourceType;
  query: string;
  results: SearchResult[];
}

export function useMusicSearch({
  canGenerate,
  generationUnavailableReason,
  onAdded,
  onClose,
  onGenerated,
  providersOverride,
  remoteCredentials,
  roomIdOverride,
}: UseMusicSearchOptions): readonly [MusicSearchState, MusicSearchActions] {
  const { showToast } = useToast();
  const { providers, roomId } = useRoomSession();
  const { refresh } = useRoomActions();
  const [provider, setProvider] = useState<SourceType>('youtube');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [playlist, setPlaylist] = useState<MusicPlaylist | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isAIMode, setIsAIMode] = useState(false);
  const targetRoomId = roomIdOverride ?? roomId;
  const searchLoader = useFetcher<SearchData>({
    params: {
      controllerToken: remoteCredentials?.controllerToken ?? '',
      remoteId: remoteCredentials?.remoteId ?? '',
      roomId: targetRoomId,
    },
    routeId: 'rooms.$id.search',
  });
  const searchAction = useFetcher<SearchActionData>({
    params: {
      controllerToken: remoteCredentials?.controllerToken ?? '',
      remoteId: remoteCredentials?.remoteId ?? '',
      roomId: targetRoomId,
    },
    routeId: 'rooms.$id.search',
  });
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
    const result = await searchAction.submit(
      {
        intent: 'generate',
        prompt,
        ...(remoteCredentials ? { credentials: remoteCredentials } : {}),
      },
      { params: { id: targetRoomId } },
    );
    setLoading(false);
    if (!result.data) {
      setError(result.error || 'Could not start playlist generation.');
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

    const linkedProvider = playlistLink?.provider ?? trackLink?.provider;
    if (linkedProvider && !enabledProviders.includes(linkedProvider)) {
      setLoading(false);
      setError(`${linkedProvider} is not enabled in this room.`);
      return;
    }
    const result = await searchLoader.load({
      params: {
        id: targetRoomId,
        provider,
        query: trimmedQuery,
        ...(remoteCredentials ?? {}),
      },
    });
    setLoading(false);
    if (!result.data) {
      setError(result.error || 'Could not search for music.');
      return;
    }
    setProvider(result.data.provider);
    setPlaylist(result.data.playlist);
    setResults(result.data.results);
  };

  const add = async (result: SearchResult) => {
    if (!targetRoomId) {
      setError('Join a room before adding music.');
      return;
    }
    const actionResult = await searchAction.submit(
      {
        intent: 'addSong',
        request: {
          sourceType: result.source,
          sourceId: result.id,
          providerUrl: result.providerUrl,
          title: result.title,
          artist: result.channelTitle,
          thumbnailUrl: result.thumbnailUrl ?? '',
          duration: parseISODuration(result.duration),
        },
        ...(remoteCredentials ? { credentials: remoteCredentials } : {}),
      },
      { params: { id: targetRoomId } },
    );
    if (actionResult.error) {
      setError(actionResult.error);
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
    const result = await searchAction.submit(
      {
        intent: 'addPlaylist',
        request: {
          songs: playlist.tracks.map((track) => ({
            artist: track.channelTitle,
            duration: parseISODuration(track.duration),
            providerUrl: track.providerUrl,
            sourceId: track.id,
            sourceType: track.source,
            thumbnailUrl: track.thumbnailUrl ?? '',
            title: track.title,
          })),
        },
        ...(remoteCredentials ? { credentials: remoteCredentials } : {}),
      },
      { params: { id: targetRoomId } },
    );
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    if (onAdded) await onAdded();
    if (!onAdded) await refresh();
    onClose();
  };

  return [
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
  ];
}

const supportedProviders: SourceType[] = ['youtube', 'spotify', 'soundcloud'];
