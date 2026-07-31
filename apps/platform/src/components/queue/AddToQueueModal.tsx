import type { Room } from '@vibes/models';
import {
  type AddSongOutcome,
  formatDuration,
  getProviderTrackUrl,
  parseISODuration,
  parseProviderTrackLink,
  resolveSongThumbnail,
  type SourceType,
  usePlaybackStore,
  useQueueStore,
} from '@vibes/shared';
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
  SpotifyIcon,
  YouTubeIcon,
} from '@vibes/ui';
import React, { useEffect, useRef, useState } from 'react';
import { useFetcher } from 'react-router';
import type { RoomActionData } from '../../routes/rooms.$id/action';

interface Props {
  room: Room;
  providers: string[];
  isVisible: boolean;
  onClose: () => void;
}

interface SearchResult {
  id: string;
  title: string;
  artist: string;
  thumbnailUrl: string;
  duration?: string;
  providerUrl?: string;
  source: SourceType;
}

export const AddToQueueModal: React.FC<Props> = ({
  room,
  providers,
  isVisible,
  onClose,
}) => {
  const searchFetcher = useFetcher<RoomActionData>();
  const songFetcher = useFetcher<RoomActionData>();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewTrack, setPreviewTrack] = useState<SearchResult | null>(null);
  const [justAdded, setJustAdded] = useState(false);
  const [addOutcome, setAddOutcome] = useState<AddSongOutcome | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { songs } = useQueueStore();
  const { currentSong } = usePlaybackStore();

  const hasSpotifySongs =
    songs.some((s) => s.sourceType === 'spotify') ||
    currentSong?.sourceType === 'spotify';

  const enabledSources = room.settings.enabledSources ?? [
    'youtube',
    'spotify',
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
        setSearchResults([]);
        setShowResults(false);
        setPreviewTrack(null);
        setError(null);
        setJustAdded(false);
        setAddOutcome(null);
      }, 300);
    }
  }, [isVisible]);

  useEffect(() => {
    if (searchFetcher.state !== 'idle' || !searchFetcher.data) return;
    setIsSearching(false);

    if (searchFetcher.data.error) {
      setError(
        searchFetcher.data.intent === 'providerTrack'
          ? 'Could not load that track'
          : searchFetcher.data.error,
      );
      setSearchResults([]);
      setShowResults(false);
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
    if (songFetcher.data.intent !== 'addSong') return;
    setIsLoading(false);

    if (songFetcher.data.error || !songFetcher.data.addSong) {
      setError('Failed to add song to queue');
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
    setSearchResults([]);
    setShowResults(false);

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
    setSearchQuery(query);
    setError(null);
    setPreviewTrack(null);
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
      performSearch(searchQuery);
    }
  };

  const handleAdd = () => {
    if (!previewTrack || justAdded) return;
    handleSelectResult(previewTrack);
  };

  const handleSearchInputChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    handleSearchChange(event.target.value);
  };

  const handleSearch = () => {
    performSearch(searchQuery);
  };

  const providerTrackLink = parseProviderTrackLink(searchQuery);
  const canSubmitSearch =
    Boolean(providerTrackLink) ||
    searchQuery.trim().length >= MINIMUM_SEARCH_QUERY_LENGTH;

  if (!isVisible) return null;

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
              Add a Song
            </h2>
            <p className="mt-1 text-sm text-theme-muted">
              Search or paste a link
            </p>
          </div>
          <Button
            onClick={onClose}
            variant="tertiary"
            size="icon"
            aria-label="Close add-song search"
          >
            <CloseIcon className="h-5 w-5 text-theme-muted" />
          </Button>
        </div>

        {/* Provider Tabs */}
        <div className="scrollbar-none flex gap-2 overflow-x-auto pb-2">
          {providerList.map((p) => (
            <Button
              key={p}
              onClick={() => {
                setSelectedProvider(p);
                setSearchResults([]);
                setSearchQuery('');
                setPreviewTrack(null);
              }}
              variant={selectedProvider === p ? 'tertiary' : 'ghost'}
            >
              <ProviderIcon className="h-5 w-5" provider={p} />
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Spotify Disclaimer */}
      {selectedProvider === 'spotify' && !hasSpotifySongs && (
        <div className="mb-6 animate-slide-down rounded-2xl border border-orange-400/30 bg-orange-400/10 p-4 transition-all">
          <div className="flex gap-3">
            <div className="mt-0.5 text-orange-400">
              <InfoIcon className="h-5 w-5" />
            </div>
            <p className="text-sm text-theme-muted leading-relaxed">
              <span className="text-2xs text-orange-400">Note:</span> By adding
              Spotify, viewers are required to have{' '}
              <span className="font-semibold text-theme">Spotify Premium</span>{' '}
              to view content.
            </p>
          </div>
        </div>
      )}

      {/* SoundCloud Disclaimer */}
      {selectedProvider === 'soundcloud' && (
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
              {isSearching && (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              )}
              {!isSearching && <SearchIcon className="h-5 w-5" />}
            </div>
            <input
              ref={searchInputRef}
              type="text"
              placeholder={`Search ${selectedProvider}...`}
              value={searchQuery}
              onChange={handleSearchInputChange}
              onKeyDown={handleKeyDown}
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
            onClick={handleSearch}
            disabled={!canSubmitSearch || isSearching}
            variant="primary"
          >
            Search
          </Button>
        </div>

        {error && (
          <div className="mt-3 flex animate-slide-down items-start gap-2 text-error text-sm">
            <AlertCircleIcon className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Search Results Dropdown */}
        {showResults &&
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
                    </div>
                  </Button>
                  <ProviderAttribution result={result} />
                </div>
              ))}
            </div>
          )}
      </div>

      {/* Loading State */}
      {isSearching && !previewTrack && providerTrackLink && (
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
            </div>
            <ProviderAttribution result={previewTrack} />
          </div>
        </div>
      )}

      {/* Success State */}
      {justAdded && (
        <div className="animate-scale-in rounded-2xl border border-secondary/40 bg-secondary/10 p-10 text-center">
          <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-2xl border border-secondary/40 bg-secondary/20">
            <CheckIcon className="h-10 w-10 text-secondary" />
          </div>
          <h3 className="mb-2 text-base text-theme">
            {addOutcome === 'duplicate_voted'
              ? 'song already exists, voted on song'
              : addOutcome === 'duplicate_already_voted'
                ? 'song already exists, vote already counted'
                : 'Added to Queue!'}
          </h3>
          <p className="mb-1 text-sm text-theme-muted">
            {addOutcome === 'duplicate_voted'
              ? 'Your vote moved it up the queue'
              : addOutcome === 'duplicate_already_voted'
                ? 'Your existing vote is still counted'
                : 'Everyone will hear it soon'}
          </p>
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
    </Modal>
  );
};

interface ProviderIconProps {
  className: string;
  provider: SourceType;
}

const ProviderIcon: React.FC<ProviderIconProps> = ({ className, provider }) => {
  if (provider === 'spotify') {
    return <SpotifyIcon className={className} />;
  }

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

const orderedProviders: SourceType[] = ['youtube', 'spotify', 'soundcloud'];

const providerNames: Record<SourceType, string> = {
  soundcloud: 'SoundCloud',
  spotify: 'Spotify',
  youtube: 'YouTube',
};

const MINIMUM_SEARCH_QUERY_LENGTH = 3;
