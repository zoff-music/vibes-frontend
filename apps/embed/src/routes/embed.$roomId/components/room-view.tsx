import { useEmbedRoom } from '../hooks/use-embed-room';
import type { EmbedLoaderData } from '../loader';
import { EmbedPlayerCard } from './player-card';
import { EmbedPlaylist } from './playlist';
import { EmbedRoomHeader } from './room-header';

interface EmbedRoomViewProps {
  loaderData: EmbedLoaderData;
}

export function EmbedRoomView({ loaderData }: EmbedRoomViewProps) {
  const { roomId, options } = loaderData;
  const {
    currentSong,
    handleVote,
    isPlaying,
    message,
    positionMs,
    room,
    songs,
  } = useEmbedRoom(loaderData);
  const durationMs = (currentSong?.duration ?? 0) * 1000;
  const queuedSongs = songs.filter((song) => song.id !== currentSong?.id);
  const player = (
    <EmbedPlayerCard
      autoplay={options.autoplay}
      currentSong={currentSong}
      durationMs={durationMs}
      positionMs={positionMs}
    />
  );

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,46,151,0.18),_transparent_45%),var(--theme-bg)] p-3 text-theme sm:p-5">
      <section className="panel-strong mx-auto max-w-3xl overflow-hidden rounded-2xl border border-theme shadow-2xl">
        <EmbedRoomHeader room={room} roomId={roomId} isPlaying={isPlaying} />

        {options.playlist ? (
          <div className="grid gap-4 p-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
            {player}
            <EmbedPlaylist
              songs={queuedSongs}
              votingEnabled={options.vote}
              onVote={handleVote}
            />
          </div>
        ) : (
          <div className="mx-auto max-w-md p-4">{player}</div>
        )}

        {message && (
          <div className="border-theme border-t px-4 py-2 text-center text-[10px] text-secondary">
            {message}
          </div>
        )}
      </section>
    </main>
  );
}
