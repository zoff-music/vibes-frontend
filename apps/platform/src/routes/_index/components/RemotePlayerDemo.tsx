import {
  Button,
  NowPlayingSong,
  PauseIcon,
  PlaybackProgress,
  PlayIcon,
  RemoteIcon,
  SkipIcon,
} from '@vibes/ui/web';
import { useRemotePreview } from '../hooks/useRemotePreview';

export function RemotePlayerDemo() {
  const { state, actions } = useRemotePreview();

  return (
    <figure
      ref={state.ref}
      aria-label="Remote controlling the electro player"
      className="min-w-0"
    >
      <div className="grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        <section
          aria-label="Phone remote"
          className="min-w-0 rounded-3xl border border-theme bg-theme p-5"
        >
          <div className="mb-6 flex items-center justify-between gap-3 border-theme border-b pb-4">
            <div>
              <p className="font-pixel text-secondary text-xs">
                Controlling machine
              </p>
              <p className="mt-2 text-sm text-theme">electro</p>
            </div>
            <RemoteIcon className="h-6 w-6 shrink-0 text-secondary" />
          </div>
          <p className="font-pixel text-theme-muted text-xs">Now playing</p>
          <h3 className="mt-4 truncate font-display text-lg text-theme">
            {state.song.title}
          </h3>
          <p className="mt-2 text-sm text-theme-muted">{state.song.artist}</p>
          <div className="mt-6 flex items-center gap-3">
            <Button
              variant="secondary"
              size="icon"
              aria-label={
                state.playing ? 'Pause from remote' : 'Play from remote'
              }
              onClick={actions.togglePlayback}
            >
              {state.playing && <PauseIcon className="h-5 w-5" />}
              {!state.playing && <PlayIcon className="h-5 w-5" />}
            </Button>
            <Button
              variant="tertiary"
              size="icon"
              aria-label="Skip from remote"
              onClick={actions.skip}
            >
              <SkipIcon className="h-5 w-5" />
            </Button>
          </div>
          <div className="mt-6">
            <PlaybackProgress
              disabled={false}
              durationMs={state.durationMs}
              positionMs={state.position}
              onChange={(event) =>
                actions.seek(Number(event.currentTarget.value))
              }
            />
          </div>
        </section>
        <section
          aria-label="Controlled player"
          className="min-w-0 rounded-3xl border border-theme bg-theme p-5"
        >
          <div className="mb-6 flex items-center justify-between gap-3 border-theme border-b pb-4">
            <span className="font-pixel text-sm text-theme">Player</span>
            <span className="text-secondary text-xs">electro</span>
          </div>
          <NowPlayingSong
            song={state.song}
            isPlaying={state.playing}
            providerLink={false}
            animate={false}
          />
          <div className="mt-5">
            <PlaybackProgress
              durationMs={state.durationMs}
              positionMs={state.position}
            />
          </div>
        </section>
      </div>
    </figure>
  );
}
