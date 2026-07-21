import type { Song } from '@vibes/models';
import { EmbedQueueSong } from './queue-song';

interface Props {
  songs: Song[];
  votingEnabled: boolean;
  onVote: (songId: string) => void;
}

export function EmbedPlaylist({ songs, votingEnabled, onVote }: Props) {
  return (
    <div className="min-h-0 min-w-0 overflow-y-auto pr-1">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-pixel text-theme-muted text-xs tracking-widest">
          Up next
        </h2>
        {votingEnabled && (
          <span className="text-theme-subtle text-xs">Tap a track to vote</span>
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
