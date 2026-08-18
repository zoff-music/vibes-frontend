import {
  generatedPlaylistPromptMaxLength,
  type PlaybackRestriction,
  type Providers,
  type Room,
} from '@vibes/models';
import {
  type AddSongOutcome,
  formatDuration,
  getProviderTrackUrl,
  parseISODuration,
  parseProviderPlaylistLink,
  parseProviderTrackLink,
  resolveSongThumbnail,
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
  room: Room;
  providers: Providers;
  isVisible: boolean;
  onClose: () => void;
  generationCount: number;
  roomGenerationMaxDailyCount: number;
  roomGenerationMaxExistingSongs: number;
  hasGenerationPermission: boolean;
  isGenerating: boolean;
  onGenerationStarted: () => void;
  terminalMode?: boolean;
}

interface SearchResult {
  id: string;
  title: string;
  artist: string;
  thumbnailUrl: string;
  duration?: string;
  providerUrl?: string;
  source: SourceType;
  playbackRestriction?: PlaybackRestriction;
}

interface PlaylistPreview {
  title?: string;
  tracks: PlaylistTrack[];
  truncated: boolean;
}

interface PlaylistTrack extends SearchResult {
  key: string;
}

export const AddToQueueModal: React.FC<Props> = ({
  room,
  providers,
  isVisible,
  onClose,
  generationCount,
  roomGenerationMaxDailyCount,
  roomGenerationMaxExistingSongs,
  hasGenerationPermission,
  isGenerating,
  onGenerationStarted,
  terminalMode = false,
}) => {
  const searchFetcher = useFetcher<RoomActionData>();
  const songFetcher = useFetcher<RoomActionData>();
  const generationFetcher = useFetcher<RoomActionData>();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAIMode, setIsAIMode] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewTrack, setPreviewTrack] = useState<SearchResult | null>(null);
  const [previewPlaylist, setPreviewPlaylist] =
    useState<PlaylistPreview | null>(null);
  const [justAdded, setJustAdded] = useState(false);
  const [addOutcome, setAddOutcome] = useState<AddSongOutcome | null>(null);
  const [addedPlaylistCount, setAddedPlaylistCount] = useState(0);
  const [existingPlaylistCount, setExistingPlaylistCount] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const songs = useQueueStore((state) => state.songs);
  const songCountCutoff = roomGenerationMaxExistingSongs + 1;
  const isAboveSongLimit = songs.length >= songCountCutoff;
  const isAboveDailyLimit = generationCount >= roomGenerationMaxDailyCount;
  let generationUnavailableReason = '';
  if (!hasGenerationPermission) {
    generationUnavailableReason = 'Log in as room admin to fill this playlist.';
  }
  if (hasGenerationPermission && isAboveSongLimit) {
    generationUnavailableReason = `AI fill is unavailable when the room has ${songCountCutoff} songs or more.`;
  }
  if (hasGenerationPermission && !isAboveSongLimit && isGenerating) {
    generationUnavailableReason = 'A playlist is already being generated.';
  }
  if (
    hasGenerationPermission &&
    !isAboveSongLimit &&
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
        setPreviewTrack(null);
        setPreviewPlaylist(null);
        setError(null);
        setJustAdded(false);
        setAddOutcome(null);
        setAddedPlaylistCount(0);
        setExistingPlaylistCount(0);
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
      setError(
        searchFetcher.data.intent === 'providerTrack'
          ? 'Could not load that track'
          : searchFetcher.data.intent === 'providerPlaylist'
            ? 'Could not load that playlist'
            : searchFetcher.data.error,
      );
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
        tracks: playlist.tracks.map((track) => ({
          artist: track.channelTitle ?? 'Unknown',
          duration: track.duration,
          id: track.id,
          key: crypto.randomUUID(),
          providerUrl: track.providerUrl,
          playbackRestriction: track.playbackRestriction,
          source: track.source,
          thumbnailUrl: track.thumbnailUrl ?? '',
          title: track.title,
        })),
        truncated: playlist.truncated,
      });
      return;
    }

    if (
      searchFetcher.data.intent === 'providerTrack' &&
      searchFetcher.data.track
    ) {
      const track = searchFetcher.data.track;
      setPreviewTrack({
        artist: track.channelTitle ?? 'Unknown',
        duration: track.duration,
        id: track.id,
        providerUrl: track.providerUrl,
        playbackRestriction: track.playbackRestriction,
        source: track.source,
        thumbnailUrl: track.thumbnailUrl ?? '',
        title: track.title,
      });
      return;
    }

    if (
      searchFetcher.data.intent === 'search' &&
      searchFetcher.data.searchResults
    ) {
      setSearchResults(
        searchFetcher.data.searchResults.map((result) => ({
          artist: result.channelTitle || 'Unknown',
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
    if (songFetcher.state !== 'idle' || !songFetcher.data) return;
    if (
      songFetcher.data.intent !== 'addSong' &&
      songFetcher.data.intent !== 'addPlaylist'
    )
      return;
    setIsLoading(false);

    if (songFetcher.data.intent === 'addPlaylist') {
      if (songFetcher.data.error || !songFetcher.data.addPlaylist) {
        setError(songFetcher.data.error ?? 'Failed to add playlist to queue');
        return;
      }

      const addedCount = songFetcher.data.addPlaylist.results.filter(
        (result) => result.outcome === 'added',
      ).length;
      setAddedPlaylistCount(addedCount);
      setExistingPlaylistCount(
        songFetcher.data.addPlaylist.results.length - addedCount,
      );
      setJustAdded(true);
      const timeout = window.setTimeout(onClose, 1600);
      return () => window.clearTimeout(timeout);
    }

    if (songFetcher.data.error || !songFetcher.data.addSong) {
      setError(songFetcher.data.error ?? 'Failed to add song to queue');
      return;
    }

    const result = songFetcher.data.addSong;
    setAddOutcome(result.outcome);
    setJustAdded(true);
    const timeout = window.setTimeout(
      onClose,
      result.outcome === 'added' ? 800 : 1600,
    );
    return () => window.clearTimeout(timeout);
  }, [onClose, songFetcher.data, songFetcher.state]);

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
    setPreviewTrack(null);
    setPreviewPlaylist(null);
    setSearchResults([]);
    setShowResults(false);

    const providerPlaylistLink = parseProviderPlaylistLink(trimmedQuery);
    if (providerPlaylistLink) {
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
            ? { songId: providerPlaylistLink.sourceId }
            : {}),
          ...(providerPlaylistLink.providerUrl
            ? { providerUrl: providerPlaylistLink.providerUrl }
            : {}),
        },
        { encType: 'application/json', method: 'post' },
      );
      return;
    }

    const providerTrackLink = parseProviderTrackLink(trimmedQuery);
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
          intent: 'providerTrack',
          provider: providerTrackLink.provider,
          ...(providerTrackLink.sourceId
            ? { songId: providerTrackLink.sourceId }
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
    setPreviewTrack(null);
    setPreviewPlaylist(null);
    setSearchResults([]);
    setShowResults(false);

    if (!query.trim()) {
      setIsSearching(false);
      return;
    }
  };

  const handleSelectResult = (song: SearchResult) => {
    setIsLoading(true);
    const durationSec = parseISODuration(song.duration);
    songFetcher.submit(
      {
        intent: 'addSong',
        song: {
          artist: song.artist,
          duration: durationSec,
          sourceId: song.id,
          sourceType: song.source,
          thumbnailUrl: song.thumbnailUrl,
          title: song.title,
          ...(song.providerUrl ? { providerUrl: song.providerUrl } : {}),
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
    setPreviewTrack(null);
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
    if (!previewTrack || justAdded) return;
    handleSelectResult(previewTrack);
  };

  const handleAddPlaylist = () => {
    if (!previewPlaylist || justAdded || previewPlaylist.tracks.length === 0)
      return;

    setIsLoading(true);
    songFetcher.submit(
      {
        intent: 'addPlaylist',
        playlist: {
          songs: previewPlaylist.tracks.map((track) => ({
            artist: track.artist,
            duration: parseISODuration(track.duration),
            sourceId: track.id,
            sourceType: track.source,
            thumbnailUrl: track.thumbnailUrl,
            title: track.title,
            ...(track.providerUrl ? { providerUrl: track.providerUrl } : {}),
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
  const providerTrackLink = parseProviderTrackLink(searchQuery);
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
  if (existingPlaylistCount > 0) {
    successTitle = 'Playlist songs are already in the queue';
    successDescription = 'All of these songs were already in the queue';
  }
  if (addedPlaylistCount > 0) {
    successTitle = `Added ${addedPlaylistCount} songs to the queue!`;
    successDescription = 'The playlist is ready for everyone in the room';
    if (existingPlaylistCount > 0) {
      successDescription = `${existingPlaylistCount} songs were already in the queue`;
    }
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
                  setPreviewTrack(null);
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
                  metadata={`${result.artist} / ${result.source}`}
                  onClick={() => handleSelectResult(result)}
                  title={result.title}
                />
              ))}
            </TerminalSection>
          )}

        {previewTrack && !justAdded && (
          <TerminalSection className="mt-4" label="TRACK PREVIEW">
            <p className="text-[#71f5ad]/55 text-[0.6rem] uppercase">
              TRACK PREVIEW
            </p>
            <p className="mt-2 text-[#e0ffef] text-sm uppercase">
              {previewTrack.title}
            </p>
            <p className="mt-1 text-[#a6ffd0]/55 text-xs uppercase">
              {previewTrack.artist} / {previewTrack.source} /{' '}
              {formatDuration(parseISODuration(previewTrack.duration))}
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
            status={`${previewPlaylist.tracks.length} TRACKS`}
          >
            <p className="text-[#71f5ad]/55 text-[0.6rem] uppercase">
              IMPORT MANIFEST
            </p>
            <p className="mt-2 text-[#e0ffef] text-sm uppercase">
              {previewPlaylist.title ?? 'UNNAMED PLAYLIST'}
            </p>
            <ol className="mt-3 max-h-52 overflow-y-auto border-[#71f5ad]/20 border-t">
              {previewPlaylist.tracks.map((track, index) => (
                <li
                  className="flex gap-3 border-[#71f5ad]/15 border-b px-2 py-2 text-xs"
                  key={track.key}
                >
                  <span className="text-[#71f5ad]/45">
                    {(index + 1).toString().padStart(2, '0')}
                  </span>
                  <span className="min-w-0 truncate text-[#dffff0]">
                    {track.title}
                  </span>
                </li>
              ))}
            </ol>
            <div className="mt-4 flex gap-2">
              <TerminalButton
                disabled={isLoading || previewPlaylist.tracks.length === 0}
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
                : 'Search by title, or paste a song or playlist link'}
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
                  setPreviewTrack(null);
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
              copyright restrictions on certain tracks.
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
            <span>{error}</span>
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
                <div
                  key={result.id}
                  className="flex border-theme border-t first:border-t-0"
                >
                  <Button
                    onClick={() => handleSelectResult(result)}
                    variant="ghost"
                    size="none"
                    className="min-w-0 flex-1 justify-start gap-2 p-3 text-left hover:bg-theme sm:gap-3 sm:p-4"
                  >
                    <div className="relative shrink-0">
                      <img
                        src={resolveSongThumbnail(result.thumbnailUrl)}
                        alt={result.title}
                        className="h-16 w-20 rounded-xl border border-theme bg-theme-surface object-cover sm:h-20 sm:w-28"
                      />
                      {result.duration && (
                        <div className="absolute right-1 bottom-1 rounded-md bg-theme px-1.5 py-0.5 text-2xs text-theme backdrop-blur-sm sm:right-1.5 sm:bottom-1.5 sm:px-2">
                          {formatDuration(parseISODuration(result.duration))}
                        </div>
                      )}
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col justify-center">
                      <h4 className="mb-1.5 line-clamp-2 text-sm text-theme leading-snug">
                        {result.title}
                      </h4>
                      <p className="line-clamp-1 text-theme-muted text-xs">
                        {result.artist}
                      </p>
                      <PlaybackRestrictionNotice result={result} />
                    </div>
                  </Button>
                  <ProviderAttribution result={result} />
                </div>
              ))}
            </div>
          )}
      </div>

      {/* Loading State */}
      {isSearching &&
        !previewTrack &&
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
      {previewTrack && !justAdded && (
        <div className="mb-6 animate-scale-in rounded-2xl border border-theme bg-theme-surface p-4">
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <img
                src={resolveSongThumbnail(previewTrack.thumbnailUrl)}
                alt={previewTrack.title}
                className="h-24 w-32 rounded-xl border border-theme bg-theme-surface object-cover"
              />
              <div className="absolute right-1.5 bottom-1.5 rounded-md bg-theme px-2 py-0.5 text-2xs text-theme backdrop-blur-sm">
                {formatDuration(parseISODuration(previewTrack.duration))}
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="mb-2 line-clamp-2 text-sm text-theme">
                {previewTrack.title}
              </h3>
              <p className="line-clamp-1 text-theme-muted text-xs">
                {previewTrack.artist}
              </p>
              <PlaybackRestrictionNotice result={previewTrack} />
            </div>
            <ProviderAttribution result={previewTrack} />
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
              {previewPlaylist.tracks.length} songs found
            </p>
            {previewPlaylist.truncated && (
              <p className="mt-2 text-orange-400 text-xs">
                This playlist is very large. The available songs shown below
                will be added.
              </p>
            )}
          </div>
          <div className="max-h-72 overflow-y-auto">
            {previewPlaylist.tracks.map((track, index) => (
              <div
                key={track.key}
                className="flex items-center gap-3 border-theme border-t px-4 py-3 first:border-t-0"
              >
                <span className="w-6 shrink-0 text-right text-theme-subtle text-xs">
                  {index + 1}
                </span>
                <img
                  src={resolveSongThumbnail(track.thumbnailUrl)}
                  alt=""
                  className="h-12 w-12 shrink-0 rounded-lg border border-theme object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-theme text-xs">{track.title}</p>
                  <p className="mt-1 truncate text-theme-muted text-xs">
                    {track.artist}
                  </p>
                  <PlaybackRestrictionNotice result={track} />
                </div>
                <ProviderAttribution result={track} />
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
      {previewTrack && !justAdded && (
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
            disabled={isLoading || previewPlaylist.tracks.length === 0}
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
                : `Add all ${previewPlaylist.tracks.length}`}
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
  result: SearchResult;
}

const ProviderAttribution: React.FC<ProviderAttributionProps> = ({
  result,
}) => {
  const providerUrl = getProviderTrackUrl(
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
  result: SearchResult;
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
  age: 'Age-restricted — may not play in Zoff or on Chromecast.',
  embedding: 'YouTube limits embedded playback for this video.',
  region: 'Region-restricted — availability depends on location.',
};

const playbackRestrictionLabels: Record<
  Exclude<PlaybackRestriction, 'age' | 'region' | undefined>,
  string
> = {
  embedding: 'Embed',
};

const MINIMUM_SEARCH_QUERY_LENGTH = 3;
