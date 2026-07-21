import {
  type SearchApiResult,
  useAuthCache,
  useMusicSearch,
  useQueue,
  useRoom,
} from '@vibes/api';
import {
  type AddSongOutcome,
  formatDuration,
  parseISODuration,
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
} from '@vibes/ui';
import React, { useEffect, useRef, useState } from 'react';

interface Props {
  roomId: string;
  isVisible: boolean;
  onClose: () => void;
}

interface SearchResult {
  id: string;
  title: string;
  artist: string;
  thumbnailUrl: string;
  duration?: string;
  url?: string;
  source?: string;
}

const vinylPlaceholder =
  'data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%27http%3A//www.w3.org/2000/svg%27%20width%3D%27200%27%20height%3D%27200%27%20viewBox%3D%270%200%20200%20200%27%3E%3Crect%20width%3D%27200%27%20height%3D%27200%27%20rx%3D%2724%27%20fill%3D%27%2316161c%27/%3E%3Ccircle%20cx%3D%27100%27%20cy%3D%27100%27%20r%3D%2772%27%20fill%3D%27%231f1f27%27/%3E%3Ccircle%20cx%3D%27100%27%20cy%3D%27100%27%20r%3D%2752%27%20fill%3D%27%232a2a34%27/%3E%3Ccircle%20cx%3D%27100%27%20cy%3D%27100%27%20r%3D%2718%27%20fill%3D%27%23141418%27/%3E%3Ccircle%20cx%3D%27100%27%20cy%3D%27100%27%20r%3D%276%27%20fill%3D%27%23c7c7d1%27/%3E%3Cpath%20d%3D%27M100%2028a72%2072%200%200%201%2072%2072%27%20stroke%3D%27%233a3a46%27%20stroke-width%3D%276%27%20fill%3D%27none%27%20stroke-linecap%3D%27round%27/%3E%3C/svg%3E';

const resolveThumbnail = (value?: string) =>
  value && value.trim().length > 0 ? value : vinylPlaceholder;

export const AddToQueueModal: React.FC<Props> = ({
  roomId,
  isVisible,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewVideo, setPreviewVideo] = useState<SearchResult | null>(null);
  const [justAdded, setJustAdded] = useState(false);
  const [addOutcome, setAddOutcome] = useState<AddSongOutcome | null>(null);
  const { addToQueue } = useQueue(roomId);
  const { songs } = useQueueStore();
  const { currentSong } = usePlaybackStore();

  const hasSpotifySongs =
    songs.some((s) => s.sourceType === 'spotify') ||
    currentSong?.sourceType === 'spotify';

  const { providers, fetchProviders } = useAuthCache();
  const { searchProvider, getYouTubeVideo } = useMusicSearch();
  const { room } = useRoom(roomId);
  const enabledSources = room?.settings.enabledSources ?? [
    'youtube',
    'spotify',
    'soundcloud',
  ];

  // Ensure YouTube is first, then Spotify, then SoundCloud
  const orderedProviders: SourceType[] = ['youtube', 'spotify', 'soundcloud'];
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

  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Fetch available providers and authorizations via cache
    const loadData = async () => {
      await fetchProviders();
      // Logic to set default provider is handled by initial state + effect if needed,
      // but 'youtube' as default is good enough if available.
    };
    loadData();
  }, [fetchProviders]);

  useEffect(() => {
    if (!isVisible) {
      setTimeout(() => {
        setSearchQuery('');
        setSearchResults([]);
        setShowResults(false);
        setPreviewVideo(null);
        setError(null);
        setJustAdded(false);
        setAddOutcome(null);
      }, 300);
    }
  }, [isVisible]);

  const extractYoutubeId = (url: string) => {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    setError(null);

    let err: Error | null = null;
    let results: SearchApiResult[] | null = null;

    const [providerErr, providerResults] = await searchProvider(
      selectedProvider,
      query,
    );
    err = providerErr;
    results = providerResults;

    setIsSearching(false);

    if (err || !results) {
      setError('Search failed. Please try again.');
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    // Backend returns MusicTracks with { id, title, artist, duration, thumbnail, url }
    // We map it to SearchResult { id, title, artist, thumbnailUrl, duration, url }
    const mappedResults: SearchResult[] = results.map((r) => ({
      id: r.id,
      title: r.title,
      artist: r.channelTitle || 'Unknown',
      thumbnailUrl: r.thumbnailUrl,
      duration: r.duration,
      url: r.url, // Backend might not send this, but keeping it optional
      source: r.source,
    }));

    setSearchResults(mappedResults);
    setShowResults(true);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setError(null);
    setPreviewVideo(null);

    // Check if it's a YouTube URL (only if strictly YouTube provider or maybe auto-detect?)
    // For now let's keep it simple: if generic URL detected, maybe switch to generic "add by URL"?
    // But existing logic was specific to YouTube ID extraction.
    const videoId = extractYoutubeId(query);
    if (videoId && selectedProvider === 'youtube') {
      setShowResults(false);
      setIsSearching(true);
      const loadVideoPreview = async () => {
        const [err, video] = await getYouTubeVideo(videoId);
        setIsSearching(false);
        if (err || !video) {
          setError('Could not find that video');
          return;
        }

        setPreviewVideo({
          id: video.id,
          title: video.title,
          artist: video.channelTitle,
          thumbnailUrl: video.thumbnailUrl,
          duration: video.duration,
        });
      };
      void loadVideoPreview();
      return;
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!query.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    searchTimeoutRef.current = setTimeout(() => {
      performSearch(query);
    }, 300);
  };

  const handleSelectResult = async (song: SearchResult) => {
    setIsLoading(true);
    const durationSec = parseISODuration(song.duration);

    // Determine sourceType from selectedProvider (which is 'youtube', 'spotify', etc.)
    // Assuming selectedProvider matches sourceType strings.
    const result = await addToQueue(
      selectedProvider,
      song.id,
      song.title,
      song.thumbnailUrl,
      durationSec,
      song.artist,
    );

    setIsLoading(false);
    if (result) {
      setAddOutcome(result.outcome);
      setJustAdded(true);
      setTimeout(
        () => {
          onClose();
        },
        result.outcome === 'added' ? 800 : 1600,
      );
    } else {
      setError('Failed to add song to queue');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (searchResults.length > 0) {
        handleSelectResult(searchResults[0]);
      }
    }
  };

  const handleAdd = async () => {
    if (!previewVideo || justAdded) return;
    handleSelectResult(previewVideo);
  };

  if (!isVisible) return null;

  return (
    <Modal ariaLabelledBy="add-song-title" isOpen={isVisible} onClose={onClose}>
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
                setPreviewVideo(null);
              }}
              variant={selectedProvider === p ? 'tertiary' : 'ghost'}
            >
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
              <span className="text-[10px] text-orange-400">Note:</span> By
              adding Spotify, viewers are required to have{' '}
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
              <span className="text-[10px] text-orange-400">Note:</span> Some
              SoundCloud searches may return empty results due to rights or
              copyright restrictions on certain tracks.
            </p>
          </div>
        </div>
      )}

      {/* Search Input */}
      <div className="relative mb-6">
        <div className="relative">
          {/* Auth Check Logic Removed: searching allowed without prior active source check */}

          <div className="absolute top-1/2 left-4 -translate-y-1/2 text-theme-muted">
            {isSearching ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <SearchIcon className="h-5 w-5" />
            )}
          </div>
          <input
            ref={inputRef}
            type="text"
            placeholder={`Search ${selectedProvider}...`}
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full rounded-2xl border border-theme bg-theme-surface py-4 pr-12 pl-12 text-base text-theme placeholder:text-theme-subtle focus:border-secondary focus:outline-hidden focus:ring-2 focus:ring-secondary/30"
            autoFocus
          />
          {searchQuery && (
            <Button
              onClick={() => handleSearchChange('')}
              variant="ghost"
              size="none"
              className="absolute top-1/2 right-3 -translate-y-1/2 p-1.5"
            >
              <CloseIcon
                className="h-5 w-5 text-theme-subtle"
                strokeWidth={2}
              />
            </Button>
          )}
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
            <div className="mt-2 max-h-96 w-full animate-scale-in overflow-hidden overflow-y-auto rounded-2xl border border-theme bg-theme-surface shadow-[0_0_24px_rgba(255,46,151,0.25)]">
              {searchResults.map((result) => (
                <Button
                  key={result.id}
                  onClick={() => handleSelectResult(result)}
                  variant="ghost"
                  size="none"
                  className="w-full justify-start gap-3 border-theme border-t p-4 text-left first:border-t-0 hover:bg-theme"
                >
                  <div className="relative shrink-0">
                    <img
                      src={resolveThumbnail(result.thumbnailUrl)}
                      alt={result.title}
                      className="h-20 w-28 rounded-xl border border-theme bg-theme-surface object-cover"
                    />
                    {result.duration && (
                      <div className="absolute right-1.5 bottom-1.5 rounded-md bg-theme px-2 py-0.5 text-[10px] text-theme backdrop-blur-sm">
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
              ))}
            </div>
          )}
      </div>

      {/* Loading State */}
      {isSearching && !previewVideo && extractYoutubeId(searchQuery) && (
        <div className="animate-scale-in rounded-2xl border border-theme bg-theme-surface p-8 text-center">
          <div className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-theme bg-theme">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          </div>
          <p className="text-sm text-theme-muted">Loading preview...</p>
        </div>
      )}

      {/* Video Preview */}
      {previewVideo && !justAdded && (
        <div className="mb-6 animate-scale-in rounded-2xl border border-theme bg-theme-surface p-4">
          <div className="flex gap-4">
            <div className="relative shrink-0">
              <img
                src={resolveThumbnail(previewVideo.thumbnailUrl)}
                alt={previewVideo.title}
                className="h-24 w-32 rounded-xl border border-theme bg-theme-surface object-cover"
              />
              <div className="absolute right-1.5 bottom-1.5 rounded-md bg-theme px-2 py-0.5 text-[10px] text-theme backdrop-blur-sm">
                {formatDuration(parseISODuration(previewVideo.duration))}
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="mb-2 line-clamp-2 text-sm text-theme">
                {previewVideo.title}
              </h3>
              <p className="line-clamp-1 text-theme-muted text-xs">
                {previewVideo.artist}
              </p>
            </div>
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
      {previewVideo && !justAdded && (
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
            {isLoading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                <span>Adding...</span>
              </>
            ) : (
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
