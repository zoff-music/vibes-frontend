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
  const voteCount = song.voteCount ?? 0;
  const content = (
    <>
      <img
        src={resolveSongThumbnail(song.thumbnailUrl)}
        alt=""
        className="h-11 w-11 shrink-0 rounded-lg object-cover"
        decoding="async"
        fetchPriority="low"
        loading="lazy"
      />
      <span className="min-w-0 flex-1 text-left">
        <span className="block truncate text-theme text-xs">{song.title}</span>
        <span className="mt-0.5 block truncate text-theme-muted text-xs">
          {song.artist || 'Unknown artist'} ·{' '}
          {formatPlaybackSeconds(song.duration)}
        </span>
      </span>
      <span className="flex shrink-0 items-center gap-1.5 rounded-lg border border-secondary/20 bg-secondary/10 px-2 py-1.5 text-theme text-xs">
        <VoteIcon aria-hidden="true" className="h-3.5 w-3.5 text-secondary" />
        {voteCount}
        <span className="sr-only"> votes</span>
      </span>
    </>
  );

  if (!votingEnabled) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-theme bg-theme-surface p-3">
        {content}
      </div>
    );
  }

  return (
    <Button
      variant="tertiary"
      size="none"
      className="w-full justify-start gap-3 rounded-2xl p-3 text-left transition-shadow hover:shadow-primary-soft"
      onClick={() => onVote(song.id)}
      title={`Vote for ${song.title} (${voteCount} votes)`}
    >
      {content}
    </Button>
  );
}
