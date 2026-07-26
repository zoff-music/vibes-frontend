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
      <div className="flex shrink-0 items-center gap-3 pr-4">
        {/* Source Icon */}
        <div className="flex items-center justify-center opacity-70">
          {providerUrl && <div className="h-5 w-5" aria-hidden="true" />}
          {!providerUrl && song.sourceType === 'soundcloud' && (
            <SoundCloudIcon className="h-5 w-5" />
          )}
        </div>

        {isAdmin && <div className="h-10 w-10 shrink-0" aria-hidden="true" />}
      </div>
    </div>
  );

  const removeButton = isAdmin && (
    <Button
      onClick={handleRemove}
      variant="destructive"
      className="absolute top-1/2 right-6 -translate-y-1/2 p-2.5"
      title="Remove from queue"
    >
      <TrashIcon className="h-5 w-5" />
    </Button>
  );

  let sourceLinkClass =
    'absolute top-1/2 right-6 z-10 -translate-y-1/2 cursor-pointer rounded-md p-1 opacity-70 transition-opacity hover:opacity-100 focus:outline-hidden focus:ring-2 focus:ring-secondary/40';
  if (isAdmin) {
    sourceLinkClass =
      'absolute top-1/2 right-20 z-10 -translate-y-1/2 cursor-pointer rounded-md p-1 opacity-70 transition-opacity hover:opacity-100 focus:outline-hidden focus:ring-2 focus:ring-secondary/40';
  }

  const sourceLink = providerUrl && (
    <a
      href={providerUrl}
      target="_blank"
      rel="noreferrer"
      className={sourceLinkClass}
      aria-label={`Open ${song.title} on ${providerNames[song.sourceType]}`}
      title={`Open on ${providerNames[song.sourceType]}`}
    >
      {song.sourceType === 'youtube' && <YouTubeIcon className="h-5 w-5" />}
      {song.sourceType === 'spotify' && <SpotifyIcon className="h-5 w-5" />}
      {song.sourceType === 'soundcloud' && (
        <SoundCloudIcon className="h-5 w-5" />
      )}
    </a>
  );

  return (
    <div className="animate-fade-in overflow-hidden">
      <div className="relative">
        <button
          type="button"
          onClick={handleVote}
          className={cardClass}
          aria-label={`Vote for ${song.title} by ${song.artist || 'Unknown Artist'}`}
        >
          {content}
        </button>
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
