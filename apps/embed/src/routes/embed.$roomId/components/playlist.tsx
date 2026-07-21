import type { Song } from '@vibes/models';
import { EmbedQueueSong } from './queue-song';

interface EmbedPlaylistProps {
  songs: Song[];
  votingEnabled: boolean;
  onVote: (songId: string) => void;
}

export function EmbedPlaylist({
  songs,
  votingEnabled,
  onVote,
}: EmbedPlaylistProps) {
  return (
    <div className="min-h-0 min-w-0 sm:max-h-96 sm:overflow-y-auto sm:pr-1">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-pixel text-[10px] text-theme-muted tracking-[0.2em]">
          Up next
        </h2>
        {votingEnabled && (
          <span className="text-[10px] text-theme-subtle">
            Tap a track to vote
          </span>
        )}
      </div>
      <div className="space-y-2">
        {songs.map((song) => (
          <EmbedQueueSong
            key={song.id}
            song={song}
            votingEnabled={votingEnabled}
            onVote={onVote}
          />
        ))}
        {songs.length === 0 && (
          <div className="rounded-xl border border-theme bg-theme-surface p-6 text-center text-theme-muted text-xs">
            The queue is empty
          </div>
        )}
      </div>
    </div>
  );
}
