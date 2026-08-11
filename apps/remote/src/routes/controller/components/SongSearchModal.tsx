import type { SearchResult } from '@vibes/models';
import {
  Button,
  CloseIcon,
  Input,
  Modal,
  PlusIcon,
  ProviderIcon,
} from '@vibes/ui/web';
import { useState } from 'react';
import type { useFetcher } from 'react-router';
import type { ControllerActionData } from '../action';

interface Props {
  fetcher: ReturnType<typeof useFetcher<ControllerActionData>>;
  isOpen: boolean;
  onClose: () => void;
  providers: string[];
  roomId: string;
}

export function SongSearchModal({
  fetcher,
  isOpen,
  onClose,
  providers,
  roomId,
}: Props) {
  const [provider, setProvider] = useState<
    'soundcloud' | 'spotify' | 'youtube'
  >('youtube');
  const rawResults =
    fetcher.data?.intent === 'search' ? (fetcher.data.searchResults ?? []) : [];
  const results: SearchResult[] = rawResults.map((result) => ({
    channelTitle: result.channelTitle,
    duration: result.duration,
    id: result.id,
    playbackRestriction: result.playbackRestriction,
    providerUrl: result.providerUrl,
    source: 'source' in result ? result.source : 'youtube',
    thumbnailUrl: result.thumbnailUrl,
    title: result.title,
  }));

  return (
    <Modal
      ariaLabelledBy="remote-search-title"
      isOpen={isOpen}
      onClose={onClose}
      size="md"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2
            id="remote-search-title"
            className="font-display text-lg text-theme"
          >
            Add a song
          </h2>
          <p className="mt-2 text-sm text-theme-muted">
            Search enabled providers from the remote.
          </p>
        </div>
        <Button
          type="button"
          onClick={onClose}
          variant="ghost"
          size="icon"
          aria-label="Close search"
        >
          <CloseIcon className="h-5 w-5" />
        </Button>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {providers.map((item) => (
          <Button
            key={item}
            type="button"
            onClick={() => setProvider(item as typeof provider)}
            variant={provider === item ? 'tertiary-active' : 'tertiary'}
          >
            <ProviderIcon
              className="h-4 w-4"
              provider={item as typeof provider}
            />
            {item}
          </Button>
        ))}
      </div>

      <fetcher.Form method="post" className="mt-5 flex gap-3">
        <input type="hidden" name="intent" value="search" />
        <input type="hidden" name="roomId" value={roomId} />
        <input type="hidden" name="provider" value={provider} />
        <Input name="query" minLength={3} placeholder="Search songs" required />
        <Button type="submit" variant="primary">
          Search
        </Button>
      </fetcher.Form>

      <div className="mt-4 max-h-[50vh] space-y-2 overflow-y-auto">
        {results.map((result) => (
          <fetcher.Form
            key={`${result.source}-${result.id}`}
            method="post"
            className="flex items-center gap-3 rounded-2xl border border-theme bg-theme-surface p-3"
          >
            <input type="hidden" name="intent" value="addSong" />
            <input type="hidden" name="roomId" value={roomId} />
            <input type="hidden" name="sourceType" value={result.source} />
            <input type="hidden" name="sourceId" value={result.id} />
            <input
              type="hidden"
              name="providerUrl"
              value={result.providerUrl ?? ''}
            />
            <input type="hidden" name="title" value={result.title} />
            <input
              type="hidden"
              name="artist"
              value={result.channelTitle ?? ''}
            />
            <input
              type="hidden"
              name="thumbnailUrl"
              value={result.thumbnailUrl ?? ''}
            />
            <input
              type="hidden"
              name="duration"
              value={result.duration ?? ''}
            />
            <img
              src={result.thumbnailUrl}
              alt=""
              className="h-12 w-12 rounded-xl object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-theme text-xs">{result.title}</p>
              <p className="mt-1 truncate text-theme-muted text-xs">
                {result.channelTitle}
              </p>
            </div>
            <Button
              type="submit"
              variant="secondary"
              size="icon"
              aria-label={`Add ${result.title}`}
            >
              <PlusIcon className="h-4 w-4" />
            </Button>
          </fetcher.Form>
        ))}
      </div>
    </Modal>
  );
}
