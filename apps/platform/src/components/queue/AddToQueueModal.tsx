import {
  generatedPlaylistPromptMaxLength,
  type PlaybackRestriction,
  type Providers,
  type RoomV2,
} from '@vibes/models';
import {
  type AddPlaylistItemOutcome,
  formatDuration,
  getProviderItemUrl,
  parseISODuration,
  parseProviderItemLink,
  parseProviderPlaylistLink,
  resolvePlaylistItemThumbnail,
  type SourceType,
  useQueueStore,
} from '@vibes/shared';
import {
  TerminalButton,
  TerminalFeedback,
  TerminalField,
  TerminalInput,
  TerminalInputGroup,
  TerminalListButton,
  TerminalModal,
  TerminalSection,
} from '@vibes/ui/konami';
import {
  AlertCircleIcon,
  Button,
  CheckIcon,
  CloseIcon,
  InfoIcon,
  Modal,
  PlaylistItemSearchResult,
  PlusIcon,
  SearchIcon,
  SoundCloudIcon,
  SparklesIcon,
  Tooltip,
  YouTubeIcon,
} from '@vibes/ui/web';
import React, { useEffect, useRef, useState } from 'react';
import { useFetcher } from 'react-router';
import type { RoomActionData } from '../../routes/rooms.$id/action';

interface Props {
  room: RoomV2;
  providers: Providers;
  isVisible: boolean;
  onClose: () => void;
  onOpenAdminLogin: () => void;
  generationCount: number;
  roomGenerationMaxDailyCount: number;
  roomGenerationMaxExistingPlaylistItems: number;
  hasGenerationPermission: boolean;
  isGenerating: boolean;
  onGenerationStarted: () => void;
  terminalMode?: boolean;
}

interface ProviderItem {
  id: string;
  title: string;
  publisher: string;
  thumbnailUrl: string;
  duration?: string;
  providerUrl?: string;
  source: SourceType;
  playbackRestriction?: PlaybackRestriction;
}

interface PlaylistPreview {
  title?: string;
  items: PreviewItem[];
  truncated: boolean;
  skippedEmbeddingCount: number;
  skippedMadeForKidsCount: number;
}

interface PreviewItem extends ProviderItem {
  key: string;
}

export const AddToQueueModal: React.FC<Props> = ({
  room,
  providers,
  isVisible,
  onClose,
  onOpenAdminLogin,
  generationCount,
  roomGenerationMaxDailyCount,
  roomGenerationMaxExistingPlaylistItems,
  hasGenerationPermission,
  isGenerating,
  onGenerationStarted,
  terminalMode = false,
}) => {
  const searchFetcher = useFetcher<RoomActionData>();
  const playlistItemFetcher = useFetcher<RoomActionData>();
  const generationFetcher = useFetcher<RoomActionData>();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAIMode, setIsAIMode] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<ProviderItem[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewItem, setPreviewItem] = useState<ProviderItem | null>(null);
  const [previewPlaylist, setPreviewPlaylist] =
    useState<PlaylistPreview | null>(null);
  const [justAdded, setJustAdded] = useState(false);
  const [addOutcome, setAddOutcome] = useState<AddPlaylistItemOutcome | null>(
    null,
  );
  const [queuedPlaylistCount, setQueuedPlaylistCount] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const playlistItems = useQueueStore((state) => state.playlistItems);
  const playlistItemCountCutoff = roomGenerationMaxExistingPlaylistItems + 1;
  const isAbovePlaylistItemLimit =
    playlistItems.length >= playlistItemCountCutoff;
  const isAboveDailyLimit = generationCount >= roomGenerationMaxDailyCount;
  let generationUnavailableReason = '';
  if (!hasGenerationPermission) {
    generationUnavailableReason = 'Log in as room admin to fill this playlist.';
  }
  if (hasGenerationPermission && isAbovePlaylistItemLimit) {
    generationUnavailableReason = `AI fill is unavailable when the room has ${playlistItemCountCutoff} songs or more.`;
  }
  if (hasGenerationPermission && !isAbovePlaylistItemLimit && isGenerating) {
    generationUnavailableReason = 'A playlist is already being generated.';
  }
  if (
    hasGenerationPermission &&
    !isAbovePlaylistItemLimit &&
    !isGenerating &&
    isAboveDailyLimit
  ) {
    generationUnavailableReason = `This room has used its ${roomGenerationMaxDailyCount} playlist generations for the day.`;
  }
  const canGenerate = !generationUnavailableReason;
  const isGenerationSubmitting = generationFetcher.state !== 'idle';

  const enabledSources = room.settings.enabledSources ?? [
    'youtube',
    'soundcloud',
  ];

  const providerList = orderedProviders.filter(
    (p) => (providers || []).includes(p) && enabledSources.includes(p),
  );

  const [selectedProvider, setSelectedProvider] = useState<SourceType>(
    providerList[0] ?? 'youtube',
  );

  useEffect(() => {
    if (providerList.length > 0 && !providerList.includes(selectedProvider)) {
      setSelectedProvider(providerList[0]);
    }
  }, [providerList, selectedProvider]);

  useEffect(() => {
    if (!isVisible) {
      setTimeout(() => {
        setSearchQuery('');
        setIsAIMode(false);
        setSearchResults([]);
        setShowResults(false);
        setPreviewItem(null);
        setPreviewPlaylist(null);
        setError(null);
        setJustAdded(false);
        setAddOutcome(null);
        setQueuedPlaylistCount(0);
      }, 300);
    }
  }, [isVisible]);

  useEffect(() => {
    if (
      generationFetcher.state !== 'idle' ||
      generationFetcher.data?.intent !== 'generatePlaylist'
    ) {
      return;
    }

    if (generationFetcher.data.error || !generationFetcher.data.generation) {
      setError(
        generationFetcher.data.error ?? 'Could not start playlist generation.',
      );
      return;
    }

    setSearchQuery('');
    onGenerationStarted();
    onClose();
  }, [
    generationFetcher.data,
    generationFetcher.state,
    onClose,
    onGenerationStarted,
  ]);

  useEffect(() => {
    if (searchFetcher.state !== 'idle' || !searchFetcher.data) return;
    setIsSearching(false);

    if (searchFetcher.data.error) {
      setError(searchFetcher.data.error);
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    if (
      searchFetcher.data.intent === 'providerPlaylist' &&
      searchFetcher.data.playlist
    ) {
      const playlist = searchFetcher.data.playlist;
      setPreviewPlaylist({
        title: playlist.title,
        items: playlist.items.map((item) => ({
          publisher: item.publisher ?? 'Unknown',
          duration: item.duration,
          id: item.id,
          key: crypto.randomUUID(),
          providerUrl: item.providerUrl,
          playbackRestriction: item.playbackRestriction,
          source: item.source,
          thumbnailUrl: item.thumbnailUrl ?? '',
          title: item.title,
        })),
        truncated: playlist.truncated,
        skippedEmbeddingCount: playlist.skippedEmbeddingCount ?? 0,
        skippedMadeForKidsCount: playlist.skippedMadeForKidsCount ?? 0,
      });
      return;
    }

    if (
      searchFetcher.data.intent === 'providerItem' &&
      searchFetcher.data.item
    ) {
      const item = searchFetcher.data.item;
      setPreviewItem({
        publisher: item.publisher ?? 'Unknown',
        duration: item.duration,
        id: item.id,
        providerUrl: item.providerUrl,
        playbackRestriction: item.playbackRestriction,
        source: item.source,
        thumbnailUrl: item.thumbnailUrl ?? '',
        title: item.title,
      });
      return;
    }

    if (
      searchFetcher.data.intent === 'search' &&
      searchFetcher.data.searchResults
    ) {
      setSearchResults(
        searchFetcher.data.searchResults.map((result) => ({
          publisher: result.publisher || 'Unknown',
          duration: result.duration,
          id: result.id,
          providerUrl: result.providerUrl,
          playbackRestriction:
            'playbackRestriction' in result
              ? result.playbackRestriction
              : undefined,
          source: 'source' in result ? result.source : 'youtube',
          thumbnailUrl: result.thumbnailUrl ?? '',
          title: result.title,
        })),
      );
      setShowResults(true);
    }
  }, [searchFetcher.data, searchFetcher.state]);

  useEffect(() => {
    if (playlistItemFetcher.state !== 'idle' || !playlistItemFetcher.data)
      return;
    if (
      playlistItemFetcher.data.intent !== 'addPlaylistItem' &&
      playlistItemFetcher.data.intent !== 'addPlaylist'
    )
      return;
    setIsLoading(false);

    if (playlistItemFetcher.data.intent === 'addPlaylist') {
      if (
        playlistItemFetcher.data.error ||
        !playlistItemFetcher.data.addPlaylist
      ) {
        setError(
          playlistItemFetcher.data.error ?? 'Failed to add playlist to queue',
        );
        return;
      }

      setQueuedPlaylistCount(playlistItemFetcher.data.addPlaylist.queuedCount);
      setJustAdded(true);
      const timeout = window.setTimeout(onClose, 1600);
      return () => window.clearTimeout(timeout);
    }

    if (
      playlistItemFetcher.data.error ||
      !playlistItemFetcher.data.addPlaylistItem
    ) {
      setError(playlistItemFetcher.data.error ?? 'Failed to add song to queue');
      return;
    }

    const result = playlistItemFetcher.data.addPlaylistItem;
    setAddOutcome(result.outcome);
    setJustAdded(true);
    const timeout = window.setTimeout(
      onClose,
      result.outcome === 'added' ? 800 : 1600,
    );
    return () => window.clearTimeout(timeout);
  }, [onClose, playlistItemFetcher.data, playlistItemFetcher.state]);

  const performSearch = (query: string) => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }
    if (isSearching) return;

    setIsSearching(true);
    setError(null);
    setPreviewItem(null);
    setPreviewPlaylist(null);
    setSearchResults([]);
    setShowResults(false);

    const providerPlaylistLink = parseProviderPlaylistLink(trimmedQuery);
    if (providerPlaylistLink) {
      if (!room.settings.playlistImport) {
        setIsSearching(false);
        setError('Playlist importing is disabled in this room');
        return;
      }
      if (!providerList.includes(providerPlaylistLink.provider)) {
        setIsSearching(false);
        setError(
          `${providerNames[providerPlaylistLink.provider]} is not enabled in this room`,
        );
        return;
      }

      setSelectedProvider(providerPlaylistLink.provider);
      searchFetcher.submit(
        {
          intent: 'providerPlaylist',
          provider: providerPlaylistLink.provider,
          ...(providerPlaylistLink.sourceId
            ? { sourceId: providerPlaylistLink.sourceId }
            : {}),
          ...(providerPlaylistLink.providerUrl
            ? { providerUrl: providerPlaylistLink.providerUrl }
            : {}),
        },
        { encType: 'application/json', method: 'post' },
      );
      return;
    }

    const providerTrackLink = parseProviderItemLink(trimmedQuery);
    if (providerTrackLink) {
      if (!providerList.includes(providerTrackLink.provider)) {
        setIsSearching(false);
        setError(
          `${providerNames[providerTrackLink.provider]} is not enabled in this room`,
        );
        return;
      }

      setSelectedProvider(providerTrackLink.provider);
      searchFetcher.submit(
        {
          intent: 'providerItem',
          provider: providerTrackLink.provider,
          ...(providerTrackLink.sourceId
            ? { sourceId: providerTrackLink.sourceId }
            : {}),
          ...(providerTrackLink.providerUrl
            ? { providerUrl: providerTrackLink.providerUrl }
            : {}),
        },
        { encType: 'application/json', method: 'post' },
      );
      return;
    }

    if (trimmedQuery.length < MINIMUM_SEARCH_QUERY_LENGTH) {
      setIsSearching(false);
      setError(
        `Enter at least ${MINIMUM_SEARCH_QUERY_LENGTH} characters to search`,
      );
      return;
    }

    searchFetcher.submit(
      {
        intent: 'search',
        prompt: trimmedQuery,
        provider: selectedProvider,
      },
      { encType: 'application/json', method: 'post' },
    );
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(
      isAIMode ? query.slice(0, generatedPlaylistPromptMaxLength) : query,
    );
    setError(null);
    setPreviewItem(null);
    setPreviewPlaylist(null);
    setSearchResults([]);
    setShowResults(false);

    if (!query.trim()) {
      setIsSearching(false);
      return;
    }
  };

  const handleSelectResult = (playlistItem: ProviderItem) => {
    setIsLoading(true);
    const durationSec = parseISODuration(playlistItem.duration);
    playlistItemFetcher.submit(
      {
        intent: 'addPlaylistItem',
        playlistItem: {
          publisher: playlistItem.publisher,
          duration: durationSec,
          sourceId: playlistItem.id,
          sourceType: playlistItem.source,
          thumbnailUrl: playlistItem.thumbnailUrl,
          title: playlistItem.title,
          ...(playlistItem.providerUrl
            ? { providerUrl: playlistItem.providerUrl }
            : {}),
        },
      },
      { encType: 'application/json', method: 'post' },
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (isAIMode) {
        handleGenerate();
        return;
      }
      performSearch(searchQuery);
    }
  };

  const handleToggleAIMode = () => {
    if (!isAIMode && !canGenerate) {
      setError(generationUnavailableReason);
      return;
    }

    setIsAIMode((current) => !current);
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
    setPreviewItem(null);
    setPreviewPlaylist(null);
    setError(null);
  };

  const handleGenerate = () => {
    const prompt = searchQuery.trim();
    if (!prompt || isGenerationSubmitting) {
      return;
    }
    if (!canGenerate) {
      setError(generationUnavailableReason);
      return;
    }

    setError(null);
    generationFetcher.submit(
      { intent: 'generatePlaylist', prompt },
      { encType: 'application/json', method: 'post' },
    );
  };

  const handleAdd = () => {
    if (!previewItem || justAdded) return;
    handleSelectResult(previewItem);
  };

  const handleAddPlaylist = () => {
    if (!room.settings.playlistImport) {
      setError('Playlist importing is disabled in this room');
      return;
    }
    if (!previewPlaylist || justAdded || previewPlaylist.items.length === 0)
      return;

    setIsLoading(true);
    playlistItemFetcher.submit(
      {
        intent: 'addPlaylist',
        playlist: {
          playlistItems: previewPlaylist.items.map((item) => ({
            publisher: item.publisher,
            duration: parseISODuration(item.duration),
            sourceId: item.id,
            sourceType: item.source,
            thumbnailUrl: item.thumbnailUrl,
            title: item.title,
            ...(item.providerUrl ? { providerUrl: item.providerUrl } : {}),
          })),
        },
      },
      { encType: 'application/json', method: 'post' },
    );
  };

  const handleSearchInputChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    handleSearchChange(event.target.value);
  };

  const handleSearch = () => {
    performSearch(searchQuery);
  };

  const handlePrimaryAction = () => {
    if (isAIMode) {
      handleGenerate();
      return;
    }
    handleSearch();
  };

  const providerPlaylistLink = parseProviderPlaylistLink(searchQuery);
  const providerTrackLink = parseProviderItemLink(searchQuery);
  const canSubmitSearch =
    Boolean(providerPlaylistLink) ||
    Boolean(providerTrackLink) ||
    searchQuery.trim().length >= MINIMUM_SEARCH_QUERY_LENGTH;
  const canSubmitPrimaryAction = isAIMode
    ? canGenerate && Boolean(searchQuery.trim())
    : canSubmitSearch;
  const isPrimaryActionBusy = isAIMode ? isGenerationSubmitting : isSearching;

  let successTitle = 'Added to Queue!';
  let successDescription = 'Everyone will hear it soon';
  if (addOutcome === 'duplicate_voted') {
    successTitle = 'Song already exists, voted on song';
    successDescription = 'Your vote moved it up the queue';
  }
  if (addOutcome === 'duplicate_already_voted') {
    successTitle = 'Song already exists, vote already counted';
    successDescription = 'Your existing vote is still counted';
  }
  if (queuedPlaylistCount > 0) {
    successTitle = `Queued ${queuedPlaylistCount} songs`;
    successDescription = 'Songs will appear as the playlist is imported';
  }

  if (!isVisible) return null;

  if (terminalMode) {
    return (
      <TerminalModal
        ariaLabelledBy="terminal-add-song-title"
        initialFocusRef={searchInputRef}
        isOpen={isVisible}
        onClose={onClose}
        size="lg"
        title={`ZOFF QUEUE.EXE / ${isAIMode ? 'GENERATE' : 'SEARCH'}`}
      >
        {!isAIMode && (
          <div className="mb-4 flex flex-wrap gap-2">
            {providerList.map((provider) => (
              <TerminalButton
                key={provider}
                onClick={() => {
                  setSelectedProvider(provider);
                  setSearchResults([]);
                  setSearchQuery('');
                  setPreviewItem(null);
                  setPreviewPlaylist(null);
                }}
              >
                [{selectedProvider === provider ? 'X' : ' '}] {provider}
              </TerminalButton>
            ))}
          </div>
        )}

        <TerminalSection
          label={
            isAIMode
              ? 'PLAYLIST GENERATION COMMAND'
              : `${selectedProvider.toUpperCase()} QUERY OR URL`
          }
          status={isPrimaryActionBusy ? 'WORKING' : 'READY'}
        >
          <TerminalField htmlFor="terminal-song-search" label="COMMAND INPUT">
            <TerminalInputGroup className="flex-col sm:flex-row">
              <TerminalInput
                id="terminal-song-search"
                onChange={handleSearchInputChange}
                onKeyDown={handleKeyDown}
                placeholder={
                  isAIMode
                    ? 'DESCRIBE REQUESTED PLAYLIST'
                    : `SEARCH ${selectedProvider.toUpperCase()}`
                }
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                {...(isAIMode && {
                  maxLength: generatedPlaylistPromptMaxLength,
                })}
              />
              <TerminalButton
                disabled={!canSubmitPrimaryAction || isPrimaryActionBusy}
                onClick={handlePrimaryAction}
              >
                {isPrimaryActionBusy ? '[ WORKING ]' : '[ EXECUTE ]'}
              </TerminalButton>
              <TerminalButton onClick={handleToggleAIMode}>
                {isAIMode ? '[ SEARCH MODE ]' : '[ AI MODE ]'}
              </TerminalButton>
            </TerminalInputGroup>
          </TerminalField>
          {error && (
            <TerminalFeedback className="mt-3" tone="error">
              ERROR: {error}
              {playlistItemFetcher.data?.error === error &&
                playlistItemFetcher.data.errorAction === 'adminLogin' && (
                  <button
                    type="button"
                    className="ml-1 underline underline-offset-4 focus-visible:outline-2"
                    onClick={onOpenAdminLogin}
                  >
                    Log in as room admin
                  </button>
                )}
            </TerminalFeedback>
          )}
          {!canGenerate && (
            <TerminalFeedback className="mt-3">
              {generationUnavailableReason}
            </TerminalFeedback>
          )}
        </TerminalSection>

        {!isAIMode &&
          showResults &&
          searchResults.length > 0 &&
          !isLoading &&
          !justAdded && (
            <TerminalSection
              className="mt-4"
              contentClassName="max-h-80 overflow-y-auto !p-2"
              label="SEARCH RESULTS"
              status={`${searchResults.length} FOUND`}
            >
              {searchResults.map((result, index) => (
                <TerminalListButton
                  action="ADD"
                  index={(index + 1).toString().padStart(2, '0')}
                  key={result.id}
                  metadata={`${result.publisher} / ${result.source}`}
                  onClick={() => handleSelectResult(result)}
                  title={result.title}
                />
              ))}
            </TerminalSection>
          )}

        {previewItem && !justAdded && (
          <TerminalSection className="mt-4" label="TRACK PREVIEW">
            <p className="text-[#71f5ad]/55 text-[0.6rem] uppercase">
              TRACK PREVIEW
            </p>
            <p className="mt-2 text-[#e0ffef] text-sm uppercase">
              {previewItem.title}
            </p>
            <p className="mt-1 text-[#a6ffd0]/55 text-xs uppercase">
              {previewItem.publisher} / {previewItem.source} /{' '}
              {formatDuration(parseISODuration(previewItem.duration))}
            </p>
            <div className="mt-4 flex gap-2">
              <TerminalButton disabled={isLoading} onClick={handleAdd}>
                {isLoading ? '[ ADDING ]' : '[ ADD TO QUEUE ]'}
              </TerminalButton>
              <TerminalButton onClick={onClose}>[ CANCEL ]</TerminalButton>
            </div>
          </TerminalSection>
        )}

        {previewPlaylist && !justAdded && (
          <TerminalSection
            className="mt-4"
            label="PLAYLIST PREVIEW"
            status={`${previewPlaylist.items.length} TRACKS`}
          >
            <p className="text-[#71f5ad]/55 text-[0.6rem] uppercase">
              IMPORT MANIFEST
            </p>
            <p className="mt-2 text-[#e0ffef] text-sm uppercase">
              {previewPlaylist.title ?? 'UNNAMED PLAYLIST'}
            </p>
            {previewPlaylist.skippedEmbeddingCount > 0 && (
              <p role="status" className="mt-2 text-theme-muted text-xs">
                Skipped {previewPlaylist.skippedEmbeddingCount} songs because
                YouTube does not allow them to play in embedded players.
              </p>
            )}
            {previewPlaylist.skippedMadeForKidsCount > 0 && (
              <p role="status" className="mt-2 text-theme-muted text-xs">
                Skipped {previewPlaylist.skippedMadeForKidsCount} videos marked
                as made for kids on YouTube. Zoff does not support these videos.
              </p>
            )}
            <ol className="mt-3 max-h-52 overflow-y-auto border-[#71f5ad]/20 border-t">
              {previewPlaylist.items.map((item, index) => (
                <li
                  className="flex gap-3 border-[#71f5ad]/15 border-b px-2 py-2 text-xs"
                  key={item.key}
                >
                  <span className="text-[#71f5ad]/45">
                    {(index + 1).toString().padStart(2, '0')}
                  </span>
                  <span className="min-w-0 truncate text-[#dffff0]">
                    {item.title}
                  </span>
                </li>
              ))}
            </ol>
            <div className="mt-4 flex gap-2">
              <TerminalButton
                disabled={isLoading || previewPlaylist.items.length === 0}
                onClick={handleAddPlaylist}
              >
                {isLoading ? '[ ADDING ]' : '[ IMPORT PLAYLIST ]'}
              </TerminalButton>
              <TerminalButton onClick={onClose}>[ CANCEL ]</TerminalButton>
            </div>
          </TerminalSection>
        )}

        {justAdded && (
          <TerminalFeedback className="mt-4 p-6 text-center" tone="success">
            <strong className="block text-[#e0ffef] text-sm">
              {successTitle}
            </strong>
            <span className="mt-2 block text-[#a6ffd0]/60">
              {successDescription}
            </span>
          </TerminalFeedback>
        )}
      </TerminalModal>
    );
  }

  return (
    <Modal
      alignment="top"
      ariaLabelledBy="add-song-title"
      initialFocusRef={searchInputRef}
      isOpen={isVisible}
      onClose={onClose}
      size="lg"
    >
      {/* Header */}
      <div className="mb-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 id="add-song-title" className="text-base text-theme">
              {isAIMode ? 'Fill Playlist' : 'Add a Song'}
            </h2>
            <p className="mt-1 text-theme-muted text-xs">
              {isAIMode
                ? 'Describe the playlist you want AI to build'
                : room.settings.playlistImport
                  ? 'Search by title, or paste a song or playlist link'
                  : 'Search by title, or paste a song link'}
            </p>
          </div>
          <Button
            onClick={onClose}
            variant="tertiary"
            size="icon"
            aria-label={
              isAIMode ? 'Close playlist fill' : 'Close add-song search'
            }
          >
            <CloseIcon className="h-5 w-5 text-theme-muted" />
          </Button>
        </div>

        {/* Provider Tabs */}
        {!isAIMode && (
          <div className="scrollbar-none flex gap-2 overflow-x-auto pb-2">
            {providerList.map((p) => (
              <Button
                key={p}
                onClick={() => {
                  setSelectedProvider(p);
                  setSearchResults([]);
                  setSearchQuery('');
                  setPreviewItem(null);
                  setPreviewPlaylist(null);
                }}
                variant={selectedProvider === p ? 'tertiary' : 'ghost'}
              >
                <ProviderIcon className="h-5 w-5" provider={p} />
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* SoundCloud Disclaimer */}
      {!isAIMode && selectedProvider === 'soundcloud' && (
        <div className="mb-6 animate-slide-down rounded-2xl border border-orange-400/30 bg-orange-400/10 p-4 transition-all">
          <div className="flex gap-3">
            <div className="mt-0.5 text-orange-400">
              <InfoIcon className="h-5 w-5" />
            </div>
            <p className="text-sm text-theme-muted leading-relaxed">
              <span className="text-2xs text-orange-400">Note:</span> Some
              SoundCloud searches may return empty results due to rights or
              copyright restrictions on certain items.
            </p>
          </div>
        </div>
      )}

      {/* Search Input */}
      <div className="relative mb-6">
        <div className="flex gap-2">
          <div className="relative flex-1">
            {/* Auth Check Logic Removed: searching allowed without prior active source check */}

            <div className="absolute top-1/2 left-4 -translate-y-1/2 text-theme-muted">
              {isPrimaryActionBusy && (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              )}
              {!isPrimaryActionBusy && !isAIMode && (
                <SearchIcon className="h-5 w-5" />
              )}
              {!isPrimaryActionBusy && isAIMode && (
                <SparklesIcon className="h-5 w-5" />
              )}
            </div>
            <input
              ref={searchInputRef}
              type="text"
              placeholder={
                isAIMode
                  ? 'Late-night synthwave for a rainy drive'
                  : `Search ${selectedProvider}...`
              }
              value={searchQuery}
              onChange={handleSearchInputChange}
              onKeyDown={handleKeyDown}
              {...(isAIMode && {
                maxLength: generatedPlaylistPromptMaxLength,
              })}
              className="w-full rounded-2xl border border-theme bg-theme-surface py-4 pr-12 pl-12 text-base text-theme placeholder:text-theme-subtle focus:border-secondary focus:outline-hidden focus:ring-2 focus:ring-secondary/30"
            />
            {searchQuery && (
              <Button
                onClick={() => handleSearchChange('')}
                variant="ghost"
                size="none"
                aria-label="Clear search"
                className="absolute top-1/2 right-3 -translate-y-1/2 p-1.5"
              >
                <CloseIcon
                  className="h-5 w-5 text-theme-subtle"
                  strokeWidth={2}
                />
              </Button>
            )}
          </div>
          <Button
            aria-checked={isAIMode}
            aria-label={isAIMode ? 'Turn off AI mode' : 'Fill playlist with AI'}
            className="h-14 w-14 shrink-0 rounded-2xl p-0"
            onClick={handleToggleAIMode}
            role="switch"
            size="none"
            title={
              canGenerate
                ? isAIMode
                  ? 'Turn off AI mode'
                  : 'Fill playlist with AI'
                : generationUnavailableReason
            }
            variant={isAIMode ? 'secondary' : 'tertiary'}
          >
            <SparklesIcon className="h-5 w-5" />
          </Button>
        </div>

        {isAIMode && (
          <p className="mt-2 text-right text-theme-subtle text-xs tabular-nums">
            {searchQuery.length}/{generatedPlaylistPromptMaxLength}
          </p>
        )}

        {!canGenerate && (
          <p className="mt-3 text-theme-muted text-xs">
            {generationUnavailableReason}
          </p>
        )}

        <Button
          className="mt-3 w-full gap-2"
          disabled={!canSubmitPrimaryAction || isPrimaryActionBusy}
          onClick={handlePrimaryAction}
          variant="primary"
        >
          {!isPrimaryActionBusy && !isAIMode && (
            <SearchIcon className="h-5 w-5" />
          )}
          {!isPrimaryActionBusy && isAIMode && (
            <SparklesIcon className="h-5 w-5" />
          )}
          {isPrimaryActionBusy && (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          )}
          {isPrimaryActionBusy
            ? isAIMode
              ? 'Starting generation…'
              : 'Searching…'
            : isAIMode
              ? 'Generate playlist'
              : 'Search'}
        </Button>

        {error && (
          <div className="mt-3 flex animate-slide-down items-start gap-2 text-error text-sm">
            <AlertCircleIcon className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              {error}
              {playlistItemFetcher.data?.error === error &&
                playlistItemFetcher.data.errorAction === 'adminLogin' && (
                  <button
                    type="button"
                    className="ml-1 underline underline-offset-4 focus-visible:outline-2"
                    onClick={onOpenAdminLogin}
                  >
                    Log in as room admin
                  </button>
                )}
            </span>
          </div>
        )}

        {/* Search Results Dropdown */}
        {!isAIMode &&
          showResults &&
          searchResults.length > 0 &&
          !isLoading &&
          !justAdded && (
            <div className="mt-2 max-h-128 w-full animate-scale-in overflow-hidden overflow-y-auto rounded-2xl border border-theme bg-theme-surface shadow-primary-popover">
              {searchResults.map((result) => (
                <PlaylistItemSearchResult
                  key={result.id}
                  title={result.title}
                  publisher={result.publisher}
                  thumbnailUrl={result.thumbnailUrl}
                  {...(result.duration && {
                    durationSeconds: parseISODuration(result.duration),
                  })}
                  onSelect={() => handleSelectResult(result)}
                  attribution={<ProviderAttribution result={result} />}
                >
                  <PlaybackRestrictionNotice result={result} />
                </PlaylistItemSearchResult>
              ))}
            </div>
          )}
      </div>

      {/* Loading State */}
      {isSearching &&
        !previewItem &&
        !previewPlaylist &&
        (providerTrackLink || providerPlaylistLink) && (
          <div className="animate-scale-in rounded-2xl border border-theme bg-theme-surface p-8 text-center">
            <div className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-theme bg-theme">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            </div>
            <p className="text-sm text-theme-muted">Loading preview...</p>
          </div>
        )}

      {/* Video Preview */}
      {previewItem && !justAdded && (
        <div className="mb-6 animate-scale-in rounded-2xl border border-theme bg-theme-surface p-4">
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <img
                src={resolvePlaylistItemThumbnail(previewItem.thumbnailUrl)}
                alt={previewItem.title}
                className="h-24 w-32 rounded-xl border border-theme bg-theme-surface object-cover"
              />
              <div className="absolute right-1.5 bottom-1.5 rounded-md bg-theme px-2 py-0.5 text-2xs text-theme backdrop-blur-sm">
                {formatDuration(parseISODuration(previewItem.duration))}
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="mb-2 line-clamp-2 text-sm text-theme">
                {previewItem.title}
              </h3>
              <p className="line-clamp-1 text-theme-muted text-xs">
                {previewItem.publisher}
              </p>
              <PlaybackRestrictionNotice result={previewItem} />
            </div>
            <ProviderAttribution result={previewItem} />
          </div>
        </div>
      )}

      {previewPlaylist && !justAdded && (
        <div className="mb-6 animate-scale-in overflow-hidden rounded-2xl border border-theme bg-theme-surface">
          <div className="border-theme border-b p-4">
            <h3 className="text-sm text-theme">
              {previewPlaylist.title ?? 'Playlist ready to import'}
            </h3>
            <p className="mt-1 text-theme-muted text-xs">
              {previewPlaylist.items.length} songs found
            </p>
            {previewPlaylist.skippedEmbeddingCount > 0 && (
              <p role="status" className="mt-2 text-theme-muted text-xs">
                Skipped {previewPlaylist.skippedEmbeddingCount} songs because
                YouTube does not allow them to play in embedded players.
              </p>
            )}
            {previewPlaylist.skippedMadeForKidsCount > 0 && (
              <p role="status" className="mt-2 text-theme-muted text-xs">
                Skipped {previewPlaylist.skippedMadeForKidsCount} videos marked
                as made for kids on YouTube. Zoff does not support these videos.
              </p>
            )}
            {previewPlaylist.truncated && (
              <p className="mt-2 text-orange-400 text-xs">
                This playlist is very large. The available songs shown below
                will be added.
              </p>
            )}
          </div>
          <div className="max-h-72 overflow-y-auto">
            {previewPlaylist.items.map((item, index) => (
              <div
                key={item.key}
                className="flex items-center gap-3 border-theme border-t px-4 py-3 first:border-t-0"
              >
                <span className="w-6 shrink-0 text-right text-theme-subtle text-xs">
                  {index + 1}
                </span>
                <img
                  src={resolvePlaylistItemThumbnail(item.thumbnailUrl)}
                  alt=""
                  className="h-12 w-12 shrink-0 rounded-lg border border-theme object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-theme text-xs">{item.title}</p>
                  <p className="mt-1 truncate text-theme-muted text-xs">
                    {item.publisher}
                  </p>
                  <PlaybackRestrictionNotice result={item} />
                </div>
                <ProviderAttribution result={item} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Success State */}
      {justAdded && (
        <div className="animate-scale-in rounded-2xl border border-secondary/40 bg-secondary/10 p-10 text-center">
          <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-2xl border border-secondary/40 bg-secondary/20">
            <CheckIcon className="h-10 w-10 text-secondary" />
          </div>
          <h3 className="mb-2 text-base text-theme">{successTitle}</h3>
          <p className="mb-1 text-sm text-theme-muted">{successDescription}</p>
          <p className="jp-art text-theme-subtle text-xs">追加されました</p>
        </div>
      )}

      {/* Action Buttons */}
      {previewItem && !justAdded && (
        <div className="flex gap-3">
          <Button onClick={onClose} variant="tertiary" className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleAdd}
            disabled={isLoading}
            variant="primary"
            className="flex-1 gap-2"
          >
            {isLoading && (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                <span>Adding...</span>
              </>
            )}
            {!isLoading && (
              <>
                <PlusIcon className="h-5 w-5" />
                <span>Add to Queue</span>
              </>
            )}
          </Button>
        </div>
      )}

      {previewPlaylist && !justAdded && (
        <div className="flex gap-3">
          <Button onClick={onClose} variant="tertiary" className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleAddPlaylist}
            disabled={isLoading || previewPlaylist.items.length === 0}
            variant="primary"
            className="flex-1 gap-2"
          >
            {isLoading && (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            )}
            {!isLoading && <PlusIcon className="h-5 w-5" />}
            <span>
              {isLoading
                ? 'Adding playlist...'
                : `Add all ${previewPlaylist.items.length}`}
            </span>
          </Button>
        </div>
      )}
    </Modal>
  );
};

interface ProviderIconProps {
  className: string;
  provider: SourceType;
}

const ProviderIcon: React.FC<ProviderIconProps> = ({ className, provider }) => {
  if (provider === 'soundcloud') {
    return <SoundCloudIcon className={className} />;
  }

  return <YouTubeIcon className={className} />;
};

interface ProviderAttributionProps {
  result: ProviderItem;
}

const ProviderAttribution: React.FC<ProviderAttributionProps> = ({
  result,
}) => {
  const providerUrl = getProviderItemUrl(
    result.source,
    result.id,
    result.providerUrl,
  );

  if (providerUrl) {
    return (
      <a
        href={providerUrl}
        target="_blank"
        rel="noreferrer"
        className="flex min-w-10 shrink-0 cursor-pointer items-center justify-center self-stretch px-2 text-theme-muted transition-colors hover:bg-theme hover:text-theme focus:outline-hidden focus:ring-2 focus:ring-secondary/40 sm:min-w-14 sm:px-4"
        aria-label={`Open ${result.title} on ${providerNames[result.source]}`}
        title={`Open on ${providerNames[result.source]}`}
      >
        <ProviderIcon className="h-4 w-4" provider={result.source} />
      </a>
    );
  }

  return (
    <div
      className="flex min-w-10 shrink-0 items-center justify-center self-stretch px-2 text-theme-muted sm:min-w-14 sm:px-4"
      role="img"
      aria-label={`${providerNames[result.source]} result`}
      title={`${providerNames[result.source]} result`}
    >
      <ProviderIcon className="h-4 w-4" provider={result.source} />
    </div>
  );
};

interface PlaybackRestrictionNoticeProps {
  result: ProviderItem;
}

const PlaybackRestrictionNotice: React.FC<PlaybackRestrictionNoticeProps> = ({
  result,
}) => {
  if (!result.playbackRestriction) return null;

  const message = playbackRestrictionMessages[result.playbackRestriction];

  if (result.playbackRestriction === 'age') {
    return (
      <Tooltip className="mt-1 w-fit" content={message} side="bottom">
        <span
          aria-label={message}
          className="relative flex h-5 w-5 items-center justify-center overflow-hidden rounded-full border border-orange-400 font-pixel text-3xs text-orange-400"
          role="img"
        >
          18
          <span className="absolute h-px w-6 rotate-45 bg-orange-400" />
        </span>
      </Tooltip>
    );
  }

  if (result.playbackRestriction === 'region') {
    return (
      <Tooltip className="mt-1 w-fit" content={message} side="bottom">
        <span
          aria-label={message}
          className="relative flex h-5 w-5 items-center justify-center overflow-hidden rounded-full border border-orange-400 text-orange-400"
          role="img"
        >
          <span className="relative h-3 w-3 rounded-full border border-orange-400">
            <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-orange-400" />
            <span className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-orange-400" />
          </span>
          <span className="absolute h-px w-6 rotate-45 bg-orange-400" />
        </span>
      </Tooltip>
    );
  }

  return (
    <Tooltip className="mt-1 w-fit" content={message} side="bottom">
      <span
        aria-label={message}
        className="flex h-5 items-center gap-1 rounded-full border border-orange-400 px-1.5 font-pixel text-3xs text-orange-400"
        role="img"
      >
        <InfoIcon className="h-3 w-3 shrink-0" />
        <span>{playbackRestrictionLabels[result.playbackRestriction]}</span>
      </span>
    </Tooltip>
  );
};

const orderedProviders: SourceType[] = ['youtube', 'soundcloud'];

const providerNames: Record<SourceType, string> = {
  soundcloud: 'SoundCloud',
  youtube: 'YouTube',
};

const playbackRestrictionMessages: Record<
  Exclude<PlaybackRestriction, undefined>,
  string
> = {
  age: 'Age-restricted. May not play in Zoff or on Chromecast.',
  embedding: 'YouTube limits embedded playback for this video.',
  region: 'Region-restricted. Availability depends on location.',
};

const playbackRestrictionLabels: Record<
  Exclude<PlaybackRestriction, 'age' | 'region' | undefined>,
  string
> = {
  embedding: 'Embed',
};

const MINIMUM_SEARCH_QUERY_LENGTH = 3;
