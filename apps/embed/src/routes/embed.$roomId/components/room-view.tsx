import { Toast } from '@vibes/ui/web';
import {
  getEmbedPlaybackCapabilities,
  useEmbedLocalPlayback,
  useEmbedRoomActions,
  useEmbedRoomState,
} from '../hooks/use-embed-room';
import type { EmbedLoaderData } from '../loader';
import { EmbedPlayerCard } from './player-card';
import { EmbedPlaylist } from './playlist';
import { EmbedRoomHeader } from './room-header';

interface Props {
  loaderData: EmbedLoaderData;
}

export function EmbedRoomView({ loaderData }: Props) {
  const { roomId, options } = loaderData;
  const roomState = useEmbedRoomState(loaderData);
  const actions = useEmbedRoomActions({ roomMode: roomState.room.mode });
  const capabilities = getEmbedPlaybackCapabilities(
    options,
    roomState.currentSong,
  );
  const localPlayback = useEmbedLocalPlayback({
    ...capabilities,
    currentSong: roomState.currentSong,
    isPlaying: roomState.isPlaying,
    onSkip: actions.handleSkip,
    roomId,
    roomMode: roomState.room.mode,
  });
  const {
    currentSong,
    hasLocalPlaybackChanges,
    isPlaying,
    positionMs,
    room,
    songs,
  } = roomState;
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
      hasLocalPlayerInteraction={localPlayback.hasLocalPlayerInteraction}
      onLocalAlignmentChange={localPlayback.handleLocalAlignmentChange}
      onLocalInteraction={localPlayback.handleLocalPlayerInteraction}
      onStartPlayback={localPlayback.handlePlay}
      positionMs={positionMs}
      songs={songs}
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
          canControlPlayback={Boolean(currentSong)}
          canSkip={canSkip}
          isPlaying={isPlaying}
          showPlaybackControls={options.player}
          onPlayPause={localPlayback.handlePlayPause}
          onReset={actions.handleReset}
          onSkip={actions.handleSkip}
          room={room}
          roomId={roomId}
          showReset={
            options.player && Boolean(currentSong) && hasLocalPlaybackChanges
          }
          showSkip={options.skip}
        />

        {showPlayerAndPlaylist && (
          <div className="grid min-h-0 flex-1 grid-rows-[minmax(0,1.2fr)_minmax(0,0.8fr)] gap-4 p-4 md:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)] md:grid-rows-1">
            {player}
            <EmbedPlaylist
              songs={queuedSongs}
              votingEnabled={options.vote}
              onVote={actions.handleVote}
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
              onVote={actions.handleVote}
            />
          </div>
        )}
        {showEmptyState && (
          <div className="flex min-h-0 flex-1 items-center justify-center p-4 text-center text-theme-muted text-xs">
            This embed has no visible player or playlist.
          </div>
        )}
      </section>
      {actions.toast && (
        <Toast
          message={actions.toast.message}
          onClose={actions.dismissToast}
          type={actions.toast.type}
        />
      )}
    </main>
  );
}
