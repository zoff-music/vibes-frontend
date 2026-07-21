import type { Song } from '@vibes/models';
import { Button, VoteIcon } from '@vibes/ui';

interface Props {
  song: Song;
  votingEnabled: boolean;
  onVote: (songId: string) => void;
}

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes}:${remainder.toString().padStart(2, '0')}`;
}

export function EmbedQueueSong({ song, votingEnabled, onVote }: Props) {
  const content = (
    <>
      <img
        src={song.thumbnailUrl}
        alt=""
        className="h-11 w-11 shrink-0 rounded-lg object-cover"
        loading="lazy"
      />
      <span className="min-w-0 flex-1 text-left">
        <span className="block truncate text-theme text-xs">{song.title}</span>
        <span className="mt-0.5 block truncate text-theme-muted text-xs">
          {song.artist || 'Unknown artist'} · {formatDuration(song.duration)}
        </span>
      </span>
      {(song.voteCount ?? 0) > 0 && (
        <span className="flex shrink-0 items-center gap-1 text-secondary text-xs">
          <VoteIcon className="h-3.5 w-3.5" />
          {song.voteCount}
        </span>
      )}
    </>
  );

  if (!votingEnabled) {
    return (
      <div className="flex items-center gap-3 bg-transparent p-4">
        {content}
      </div>
    );
  }

  return (
    <Button
      variant="ghost"
      size="none"
      className="w-full justify-start gap-3 rounded-2xl border border-theme bg-theme-surface p-4 text-left transition-shadow hover:shadow-[0_0_20px_rgba(255,46,151,0.2)]"
      onClick={() => onVote(song.id)}
      title={`Vote for ${song.title}`}
    >
      {content}
    </Button>
  );
}
