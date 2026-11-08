import type { PlaylistItem } from '@vibes/models';
import { resolvePlaylistItemThumbnail } from '@vibes/shared';
import { formatPlaybackSeconds } from '../../../shared';
import { VoteIcon } from '../../icons';
import { Button } from '../Button';

interface Props {
  playlistItem: PlaylistItem;
  votingEnabled: boolean;
  onVote: (playlistItemId: string) => void;
}

export function EmbedQueuePlaylistItem({
  playlistItem,
  votingEnabled,
  onVote,
}: Props) {
  const voteCount = playlistItem.voteCount ?? 0;
  const content = (
    <>
      <img
        src={resolvePlaylistItemThumbnail(playlistItem.thumbnailUrl, true)}
        alt=""
        className="h-11 w-11 shrink-0 rounded-lg object-cover"
        decoding="async"
        fetchPriority="low"
        loading="lazy"
      />
      <span className="min-w-0 flex-1 text-left">
        <span className="text-theme block truncate text-xs">
          {playlistItem.title}
        </span>
        <span className="text-theme-muted mt-0.5 block truncate text-xs">
          {playlistItem.publisher || 'Unknown artist'} ·{' '}
          {formatPlaybackSeconds(playlistItem.duration)}
        </span>
      </span>
      <span className="border-secondary/20 bg-secondary/10 text-theme relative flex shrink-0 items-center gap-1.5 rounded-lg border px-2 py-1.5 text-xs">
        <VoteIcon aria-hidden="true" className="text-secondary h-3.5 w-3.5" />
        {voteCount}
        <span className="sr-only"> votes</span>
      </span>
    </>
  );

  if (!votingEnabled) {
    return (
      <div className="border-theme bg-theme-surface flex items-center gap-3 rounded-2xl border p-3">
        {content}
      </div>
    );
  }

  return (
    <Button
      variant="tertiary"
      size="none"
      shape="rounded"
      className="hover:shadow-primary-soft w-full justify-start gap-3 p-3 text-left transition-shadow"
      onClick={() => onVote(playlistItem.id)}
      aria-label={`Vote for ${playlistItem.title} by ${playlistItem.publisher || 'Unknown Artist'}, ${voteCount} ${voteCount === 1 ? 'vote' : 'votes'}`}
      title={`Vote for ${playlistItem.title} (${voteCount} votes)`}
    >
      {content}
    </Button>
  );
}
