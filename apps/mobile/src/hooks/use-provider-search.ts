import { playlistAuthorizationUrl } from '@vibes/api';
import {
  generatedPlaylistPromptMaxLength,
  type ProviderItem,
  type ProviderPlaylist,
  type Providers,
  type RoomType,
  type SourceType,
} from '@vibes/models';
import {
  parseISODuration,
  parseProviderItemLink,
  parseProviderPlaylistLink,
  safeWrapAsync,
} from '@vibes/shared';
import { useMutation, useRequest } from '@vibes/shared/use-request';
import { getRoomLabels } from '@vibes/ui/shared';
import { useEffect, useState } from 'react';
import { Keyboard, Linking } from 'react-native';
import { useToast } from '@/components/toast';
import { apiUrl } from '@/lib/api';
import { mobileProviders } from '@/lib/mobile-content';
import { useRoomActions, useRoomSession } from '@/providers/app-provider';
import { loadSearch } from '@/requests/load-search';
import { updateSearch } from '@/requests/update-search';

interface SearchRemoteCredentials {
  controllerToken: string;
  remoteId: string;
}

interface UseProviderSearchOptions {
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

interface ProviderSearchActions {
  authenticate: () => Promise<void>;
  setImportCode: (value: string) => void;
  add: (result: ProviderItem) => Promise<void>;
  addPlaylist: () => Promise<void>;
  search: () => Promise<void>;
  setProvider: (provider: SourceType) => void;
  toggleAIMode: () => void;
  updateQuery: (query: string) => void;
}

interface ProviderSearchState {
  authenticationRequired: boolean;
  importCode: string;
  enabledProviders: SourceType[];
  error: string;
  isAIMode: boolean;
  loading: boolean;
  playlist: ProviderPlaylist | null;
  provider: SourceType;
  query: string;
  results: ProviderItem[];
}

export function useProviderSearch({
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
}: UseProviderSearchOptions): readonly [
  ProviderSearchState,
  ProviderSearchActions,
] {
  const { showToast } = useToast();
  const labels = getRoomLabels(roomType);
  const { providers, roomId } = useRoomSession();
  const { refresh } = useRoomActions();
  const [provider, setProvider] = useState<SourceType>('youtube');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ProviderItem[]>([]);
  const [playlist, setPlaylist] = useState<ProviderPlaylist | null>(null);
  const [authenticationRequired, setAuthenticationRequired] = useState(false);
  const [importCode, setImportCode] = useState('');
  const authenticate = async () => {
    const link = parseProviderPlaylistLink(query);
    const source = link?.sourceId ?? link?.providerUrl;
    if (!link || !source) return;
    const [openError] = await safeWrapAsync(
      Linking.openURL(
        playlistAuthorizationUrl(
          link.provider,
          source,
          `${apiUrl.replace(/\/$/, '')}/api/v1`,
        ),
      ),
    );
    if (openError) setError('Could not open the provider sign-in page.');
  };
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isAIMode, setIsAIMode] = useState(false);
  const targetRoomId = roomIdOverride ?? roomId;
  const [, searchLoaderLoad] = useRequest(loadSearch, {
    controllerToken: remoteCredentials?.controllerToken ?? '',
    remoteId: remoteCredentials?.remoteId ?? '',
    roomId: targetRoomId,
  });
  const [, searchActionSubmit] = useMutation(updateSearch, {
    controllerToken: remoteCredentials?.controllerToken ?? '',
    remoteId: remoteCredentials?.remoteId ?? '',
    roomId: targetRoomId,
  });
  const roomProviders = providersOverride ?? providers;
  const enabledProviders = mobileProviders.filter(
    (source) =>
      providers.includes(source) &&
      roomProviders.includes(source) &&
      (roomType !== 'WATCH' || source === 'youtube'),
  );

  useEffect(() => {
    if (enabledProviders.length === 0 || enabledProviders.includes(provider)) {
      return;
    }

    setProvider(enabledProviders[0]);
  }, [enabledProviders, provider]);

  const updateQuery = (nextQuery: string) => {
    setAuthenticationRequired(false);
    setImportCode('');
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

    setAuthenticationRequired(false);
    setImportCode('');
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
    const result = await searchActionSubmit(
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
      setError('This room has no enabled providers.');

      return;
    }

    const playlistLink = parseProviderPlaylistLink(trimmedQuery);
    const itemLink = parseProviderItemLink(trimmedQuery);

    if (playlistLink && !playlistImportAllowed) {
      setError('Playlist importing is disabled in this room.');

      return;
    }

    if (!playlistLink && !itemLink && trimmedQuery.length < 3) {
      setError('Search needs at least 3 characters.');

      return;
    }

    setError('');
    setPlaylist(null);
    setLoading(true);
    Keyboard.dismiss();

    const linkedProvider = playlistLink?.provider ?? itemLink?.provider;

    if (linkedProvider && !enabledProviders.includes(linkedProvider)) {
      setLoading(false);
      setError(`${linkedProvider} is not enabled in this room.`);

      return;
    }

    const result = await searchLoaderLoad({
      params: {
        id: targetRoomId,
        provider,
        query: trimmedQuery,
        importCode: importCode.trim(),
        ...(remoteCredentials ?? {}),
      },
    });
    setLoading(false);

    if (!result.data) {
      setError(result.error || `Could not search for ${labels.items}.`);

      return;
    }

    setAuthenticationRequired(Boolean(result.data.authenticationRequired));
    setImportCode('');
    setProvider(result.data.provider);
    setPlaylist(result.data.playlist);
    setResults(result.data.results);
  };

  const add = async (result: ProviderItem) => {
    if (!targetRoomId) {
      setError(`Join a room before adding ${labels.items}.`);

      return;
    }

    const actionResult = await searchActionSubmit(
      {
        intent: 'addPlaylistItem',
        request: {
          sourceType: result.source,
          sourceId: result.id,
          providerUrl: result.providerUrl,
          title: result.title,
          publisher: result.publisher,
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
    if (!playlistImportAllowed) {
      setError('Playlist importing is disabled in this room.');

      return;
    }

    if (!targetRoomId) {
      setError('Join a room before adding a playlist.');

      return;
    }

    if (!playlist || playlist.items.length === 0) return;

    setLoading(true);
    const result = await searchActionSubmit(
      {
        intent: 'addPlaylist',
        request: {
          playlistItems: playlist.items.map((item) => ({
            publisher: item.publisher,
            duration: parseISODuration(item.duration),
            providerUrl: item.providerUrl,
            sourceId: item.id,
            sourceType: item.source,
            thumbnailUrl: item.thumbnailUrl ?? '',
            title: item.title,
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

    showToast(
      `Queued ${result.data?.queuedCount ?? playlist.items.length} ${labels.items}. They will appear as the playlist is imported.`,
    );
    onClose();
  };

  return [
    {
      authenticationRequired,
      importCode,
      enabledProviders,
      error,
      isAIMode,
      loading,
      playlist,
      provider,
      query,
      results,
    },
    {
      authenticate,
      setImportCode,
      add,
      addPlaylist,
      search,
      setProvider,
      toggleAIMode,
      updateQuery,
    },
  ];
}
