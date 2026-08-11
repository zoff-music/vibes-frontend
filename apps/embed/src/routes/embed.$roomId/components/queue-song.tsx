import type { Song } from '@vibes/models';
import { resolveSongThumbnail } from '@vibes/shared';
import { formatPlaybackSeconds } from '@vibes/ui/shared';
import { Button, VoteIcon } from '@vibes/ui/web';

interface Props {
  song: Song;
  votingEnabled: boolean;
  onVote: (songId: string) => void;
}

export function EmbedQueueSong({ song, votingEnabled, onVote }: Props) {
  const content = (
    <>
      <img
        src={resolveSongThumbnail(song.thumbnailUrl)}
        alt=""
        className="h-11 w-11 shrink-0 rounded-lg object-cover"
        loading="lazy"
      />
      <span className="min-w-0 flex-1 text-left">
        <span className="block truncate text-theme text-xs">{song.title}</span>
        <span className="mt-0.5 block truncate text-theme-muted text-xs">
          {song.artist || 'Unknown artist'} ·{' '}
          {formatPlaybackSeconds(song.duration)}
        </span>
      </span>
      {votingEnabled && (song.voteCount ?? 0) > 0 && (
        <span className="flex shrink-0 items-center gap-1 text-secondary text-xs">
          <VoteIcon className="h-3.5 w-3.5" />
          {song.voteCount}
        </span>
      )}
    </>
  );

  if (!votingEnabled) {
    return (
      <div className="flex items-center gap-3 bg-transparent px-2 py-2.5">
        {content}
      </div>
    );
  }

  return (
    <Button
      variant="ghost"
      size="none"
      className="w-full justify-start gap-3 rounded-2xl border border-theme bg-theme-surface p-3 text-left transition-shadow hover:shadow-primary-soft"
      onClick={() => onVote(song.id)}
      title={`Vote for ${song.title}`}
    >
      {content}
    </Button>
  );
}
