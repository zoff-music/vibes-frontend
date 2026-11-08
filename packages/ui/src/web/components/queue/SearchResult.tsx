import { formatDuration, resolvePlaylistItemThumbnail } from '@vibes/shared';
import type { ReactNode } from 'preact/compat';
import { Button } from '../Button';

interface PlaylistItemSearchResultProps {
  title: string;
  publisher: string;
  thumbnailUrl: string;
  durationSeconds?: number;
  onSelect: () => void;
  attribution: ReactNode;
  children?: ReactNode;
}

export function PlaylistItemSearchResult({
  title,
  publisher,
  thumbnailUrl,
  durationSeconds,
  onSelect,
  attribution,
  children,
}: PlaylistItemSearchResultProps) {
  return (
    <div className="border-theme flex min-w-0 border-t first:border-t-0">
      <Button
        onClick={onSelect}
        variant="ghost"
        shape="rounded"
        size="none"
        aria-label={`Add ${title} by ${publisher}`}
        className="hover:bg-theme min-w-0 flex-1 justify-start gap-2 p-3 text-left sm:gap-3 sm:p-4"
      >
        <div className="relative shrink-0">
          <img
            src={resolvePlaylistItemThumbnail(thumbnailUrl)}
            alt=""
            loading="lazy"
            decoding="async"
            width={112}
            height={80}
            className="border-theme bg-theme-surface h-16 w-20 rounded-xl border object-cover sm:h-20 sm:w-28"
          />
          {durationSeconds !== undefined && (
            <div className="bg-theme text-2xs text-theme absolute right-1 bottom-1 rounded-md px-1.5 py-0.5 backdrop-blur-sm sm:right-1.5 sm:bottom-1.5 sm:px-2">
              {formatDuration(durationSeconds)}
            </div>
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-center">
          <h4 className="text-theme mb-1.5 line-clamp-2 text-sm leading-snug">
            {title}
          </h4>
          <p className="text-theme-muted line-clamp-1 text-xs">{publisher}</p>
          {children}
        </div>
      </Button>
      {attribution}
    </div>
  );
}
