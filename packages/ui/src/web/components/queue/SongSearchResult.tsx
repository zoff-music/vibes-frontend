import { formatDuration, resolveSongThumbnail } from '@vibes/shared';
import type { ReactNode } from 'react';
import { Button } from '../Button';

interface SongSearchResultProps {
  title: string;
  artist: string;
  thumbnailUrl: string;
  durationSeconds?: number;
  onSelect: () => void;
  attribution: ReactNode;
  children?: ReactNode;
}

export function SongSearchResult({
  title,
  artist,
  thumbnailUrl,
  durationSeconds,
  onSelect,
  attribution,
  children,
}: SongSearchResultProps) {
  return (
    <div className="flex min-w-0 border-theme border-t first:border-t-0">
      <Button
        onClick={onSelect}
        variant="ghost"
        size="none"
        aria-label={`Add ${title} by ${artist}`}
        className="min-w-0 flex-1 justify-start gap-2 p-3 text-left hover:bg-theme sm:gap-3 sm:p-4"
      >
        <div className="relative shrink-0">
          <img
            src={resolveSongThumbnail(thumbnailUrl)}
            alt=""
            className="h-16 w-20 rounded-xl border border-theme bg-theme-surface object-cover sm:h-20 sm:w-28"
          />
          {durationSeconds !== undefined && (
            <div className="absolute right-1 bottom-1 rounded-md bg-theme px-1.5 py-0.5 text-2xs text-theme backdrop-blur-sm sm:right-1.5 sm:bottom-1.5 sm:px-2">
              {formatDuration(durationSeconds)}
            </div>
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-center">
          <h4 className="mb-1.5 line-clamp-2 text-sm text-theme leading-snug">
            {title}
          </h4>
          <p className="line-clamp-1 text-theme-muted text-xs">{artist}</p>
          {children}
        </div>
      </Button>
      {attribution}
    </div>
  );
}
