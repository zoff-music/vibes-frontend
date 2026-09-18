import {
  ArrowRightIcon,
  Button,
  NowPlayingSong,
  PauseIcon,
  PlaybackProgress,
  PlayIcon,
  RemoteIcon,
  SkipIcon,
} from '@vibes/ui/web';
import { Link } from 'react-router';
import { useRemotePreview } from '../hooks/useRemotePreview';

export function RemotePreview() {
  const { state, actions } = useRemotePreview();

  return (
    <section
      aria-labelledby="remote-heading"
      className="grid items-center gap-12 py-20 sm:py-28 lg:grid-cols-5 lg:gap-16"
    >
      <div className="lg:order-2 lg:col-span-2">
        <p className="font-pixel text-secondary text-xs tracking-label">
          REMOTE CONTROL
        </p>
        <h2
          id="remote-heading"
          className="mt-4 font-pixel text-4xl normal-case leading-tight tracking-tight sm:text-5xl"
        >
          Your phone is the remote.
        </h2>
        <p className="mt-5 text-theme-muted leading-relaxed">
          Scan the player’s QR code or enter its pairing code. Control playback
          from your phone while the music stays on the other device.
        </p>
        <p className="mt-4 text-sm text-theme-muted">
          Try pausing, skipping or seeking here. The player follows.
        </p>
        <Link
          to="/discovery/apps"
          className="mt-6 inline-flex min-h-11 items-center gap-3 rounded-xl border border-theme bg-theme-surface px-5 py-3 text-sm text-theme hover:border-secondary/60 hover:bg-theme focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
        >
          Apps and remotes <ArrowRightIcon className="h-4 w-4" />
        </Link>
      </div>
      <figure
        ref={state.ref}
        aria-label="Remote controlling the electro player"
        className="min-w-0 lg:order-1 lg:col-span-3"
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
    </section>
  );
}
