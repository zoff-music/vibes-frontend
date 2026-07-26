import { Toast } from '@vibes/ui';
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
    dismissToast,
    handleLocalAlignmentChange,
    handleLocalPlayerInteraction,
    handlePlayPause,
    handleReset,
    handleSkip,
    handleVote,
    hasLocalPlaybackChanges,
    isPlaying,
    positionMs,
    requestProviderToken,
    room,
    songs,
    spotifyTokenLoading,
    spotifyToken,
    toast,
    youtubeTokenLoading,
    youtubeToken,
  } = useEmbedRoom(loaderData);
  const durationMs = (currentSong?.duration ?? 0) * 1000;
  const queuedSongs = songs.filter((song) => song.id !== currentSong?.id);
  const enabledProviders = loaderData.providers.filter((provider) =>
    room.settings.enabledSources.includes(provider),
  );
  const player = options.player && (
    <EmbedPlayerCard
      currentSong={currentSong}
      durationMs={durationMs}
      enabledProviders={enabledProviders}
      onLocalAlignmentChange={handleLocalAlignmentChange}
      onLocalInteraction={handleLocalPlayerInteraction}
      positionMs={positionMs}
      requestProviderToken={requestProviderToken}
      spotifyTokenLoading={spotifyTokenLoading}
      spotifyToken={spotifyToken}
      songs={songs}
      youtubeTokenLoading={youtubeTokenLoading}
      youtubeToken={youtubeToken}
    />
  );
  const showPlayerAndPlaylist = options.player && options.playlist;
  const showPlayerOnly = options.player && !options.playlist;
  const showPlaylistOnly = !options.player && options.playlist;
  const showEmptyState = !options.player && !options.playlist;
  const canSkip =
    Boolean(currentSong) && room.mode !== 'host' && room.settings.skipAllowed;

  return (
    <main className="h-dvh overflow-hidden bg-theme text-theme">
      <section className="panel-strong flex h-full w-full flex-col overflow-hidden">
        <EmbedRoomHeader
          canSkip={canSkip}
          isPlaying={isPlaying}
          showPlaybackControls={Boolean(currentSong)}
          onPlayPause={handlePlayPause}
          onReset={handleReset}
          onSkip={handleSkip}
          room={room}
          roomId={roomId}
          showReset={Boolean(currentSong) && hasLocalPlaybackChanges}
          showSkip={options.skip}
        />

        {showPlayerAndPlaylist && (
          <div className="grid min-h-0 flex-1 grid-rows-[minmax(0,1.2fr)_minmax(0,0.8fr)] gap-4 p-4 md:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)] md:grid-rows-1">
            {player}
            <EmbedPlaylist
              songs={queuedSongs}
              votingEnabled={options.vote}
              onVote={handleVote}
            />
          </div>
        )}
        {showPlayerOnly && (
          <div className="flex min-h-0 flex-1 justify-center overflow-hidden p-3 sm:p-4">
            <div className="h-full min-h-0 w-full max-w-5xl">{player}</div>
          </div>
        )}
        {showPlaylistOnly && (
          <div className="min-h-0 flex-1 p-3 sm:p-4">
            <EmbedPlaylist
              songs={queuedSongs}
              votingEnabled={options.vote}
              onVote={handleVote}
            />
          </div>
        )}
        {showEmptyState && (
          <div className="flex min-h-0 flex-1 items-center justify-center p-4 text-center text-theme-muted text-xs">
            This embed has no visible player or playlist.
          </div>
        )}
      </section>
      {toast && (
        <Toast
          message={toast.message}
          onClose={dismissToast}
          type={toast.type}
        />
      )}
    </main>
  );
}
