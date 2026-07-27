import { getProviderTrackUrl, resolveSongThumbnail, Song } from '@vibes/shared';
import React from 'react';
import {
  SoundCloudIcon,
  SpotifyIcon,
  TrashIcon,
  VoteIcon,
  YouTubeIcon,
} from '../../icons';
import { Button } from '../Button';
import { Tooltip } from '../Tooltip';

interface Props {
  song: Song;
  position: number;
  onRemove?: (id: string) => void;
  onVote?: (id: string) => void;
  isAdmin?: boolean;
}

export const QueueItem: React.FC<Props> = ({
  song,
  position,
  onRemove,
  onVote,
  isAdmin,
}) => {
  const formatDuration = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  const handleVote = () => {
    onVote?.(song.id);
  };

  const handleRemove = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onRemove?.(song.id);
  };

  const cardClass =
    'group block w-full cursor-pointer overflow-hidden rounded-2xl border border-theme bg-theme-surface p-4 text-left transition-colors hover:border-theme-strong focus:outline-hidden focus:ring-2 focus:ring-secondary/40 focus:ring-offset-2 focus:ring-offset-transparent';

  const providerUrl = getProviderTrackUrl(
    song.sourceType,
    song.sourceId,
    song.providerUrl,
  );
  const ProviderIcon = providerIcons[song.sourceType];

  const content = (
    <div className="flex min-w-0 items-center gap-4">
      {/* Position number */}
      <div className="w-8 shrink-0 text-center">
        <span className="text-theme-subtle text-xs">{position}</span>
      </div>

      {/* Thumbnail */}
      <div className="relative shrink-0">
        <img
          src={resolveSongThumbnail(song.thumbnailUrl)}
          alt={song.title}
          className="h-16 w-16 rounded-xl border border-theme bg-theme-surface object-cover"
          loading="lazy"
        />
      </div>

      {/* Song info */}
      <div className="min-w-0 flex-1 overflow-hidden">
        <h4 className="mb-1 block max-w-full truncate text-left text-theme text-xs">
          {song.title}
        </h4>
        <div className="flex min-w-0 items-center gap-2 overflow-hidden text-theme-muted text-xs">
          <span className="min-w-0 truncate">
            {song.artist || 'Unknown Artist'}
          </span>
          <span className="text-theme-subtle">•</span>
          <span className="shrink-0 text-theme-subtle text-xs">
            {formatDuration(song.duration)}
          </span>
          {(song.voteCount || 0) > 0 && (
            <>
              <span className="text-theme-subtle">•</span>
              <span className="flex items-center gap-1 text-2xs text-secondary">
                <VoteIcon className="h-3 w-3" />
                {song.voteCount}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-3 pr-3">
        {/* Source Icon */}
        <div className="h-5 w-5" aria-hidden="true" />

        {isAdmin && <div className="h-10 w-10 shrink-0" aria-hidden="true" />}
      </div>
    </div>
  );

  const removeButton = isAdmin && (
    <div className="absolute top-1/2 right-5 -translate-y-1/2">
      <Tooltip className="inline-flex" content="Remove">
        <Button
          onClick={handleRemove}
          variant="destructive"
          size="none"
          className="p-2.5"
          aria-label="Remove from queue"
        >
          <TrashIcon className="h-5 w-5" />
        </Button>
      </Tooltip>
    </div>
  );

  let sourceLinkClass = 'absolute top-1/2 right-5 z-10 -translate-y-1/2';
  if (isAdmin) {
    sourceLinkClass = 'absolute top-1/2 right-24 z-10 -translate-y-1/2';
  }

  const sourceLink = providerUrl && (
    <div className={sourceLinkClass}>
      <Tooltip
        className="inline-flex"
        content={`Open on ${providerNames[song.sourceType]}`}
      >
        <a
          href={providerUrl}
          target="_blank"
          rel="noreferrer"
          className="cursor-pointer rounded-md p-1 opacity-70 transition-opacity hover:opacity-100 focus:outline-hidden focus:ring-2 focus:ring-secondary/40"
          aria-label={`Open ${song.title} on ${providerNames[song.sourceType]}`}
        >
          <ProviderIcon className="h-5 w-5 text-white" />
        </a>
      </Tooltip>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <div className="relative">
        <Tooltip className="block w-full" content="Vote">
          <button
            type="button"
            onClick={handleVote}
            className={cardClass}
            aria-label={`Vote for ${song.title} by ${song.artist || 'Unknown Artist'}`}
          >
            {content}
          </button>
        </Tooltip>
        {sourceLink}
        {removeButton}
      </div>
    </div>
  );
};

const providerNames: Record<Song['sourceType'], string> = {
  soundcloud: 'SoundCloud',
  spotify: 'Spotify',
  youtube: 'YouTube',
};

const providerIcons: Record<
  Song['sourceType'],
  React.ComponentType<React.SVGProps<SVGSVGElement>>
> = {
  soundcloud: SoundCloudIcon,
  spotify: SpotifyIcon,
  youtube: YouTubeIcon,
};
