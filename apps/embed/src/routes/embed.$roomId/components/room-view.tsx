import { useEmbedRoom } from '../hooks/use-embed-room';
import type { EmbedLoaderData } from '../loader';
import { EmbedPlayerCard } from './player-card';
import { EmbedPlaylist } from './playlist';
import { EmbedRoomHeader } from './room-header';

interface Props {
  loaderData: EmbedLoaderData;
}

export function EmbedRoomView({ loaderData }: Props) {
  const { roomId, options } = loaderData;
  const {
    currentSong,
    handleSkip,
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
      canSkip={
        Boolean(currentSong) &&
        room.mode !== 'host' &&
        room.settings.skipAllowed
      }
      onSkip={handleSkip}
      positionMs={positionMs}
      showSkip={options.skip}
    />
  );

  return (
    <main className="min-h-screen bg-theme p-3 text-theme sm:p-5">
      <section className="panel-strong mx-auto max-w-3xl overflow-hidden rounded-2xl border border-theme shadow-2xl">
        <EmbedRoomHeader room={room} roomId={roomId} isPlaying={isPlaying} />

        {options.playlist ? (
          <div className="grid gap-4 p-4 sm:grid-cols-2">
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
          <div className="border-theme border-t px-4 py-2 text-center text-secondary text-xs">
            {message}
          </div>
        )}
      </section>
    </main>
  );
}
