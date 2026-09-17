import { classNames } from '@vibes/shared';
import { PauseIcon, PlayIcon, SkipIcon } from '@vibes/ui/web';
import { Equalizer } from './Equalizer';
import './room-mode.css';

interface RoomModeSceneProps {
  hostMode: boolean;
}

export function RoomModeScene({ hostMode }: RoomModeSceneProps) {
  return (
    <div aria-hidden="true" className="scene-mode-timeline mb-6">
      <p className="font-pixel text-secondary text-xs tracking-wider">
        {hostMode ? 'THE HOST CALLS THE SHOTS' : 'THE QUEUE KEEPS GOING'}
      </p>
      <div className="mt-5 grid overflow-hidden">
        <div
          className={classNames(
            'col-start-1 row-start-1',
            hostMode ? 'scene-host-track-first' : 'scene-server-track-first',
          )}
        >
          <p className="truncate font-pixel text-theme text-xl">Night drive</p>
          <p className="mt-1 text-theme-subtle text-xs">Track 01</p>
        </div>
        <div
          className={classNames(
            'scene-mode-track-next col-start-1 row-start-1',
            hostMode ? 'scene-host-track-next' : 'scene-server-track-next',
          )}
        >
          <p className="truncate font-pixel text-theme text-xl">Daybreak</p>
          <p className="mt-1 text-theme-subtle text-xs">Track 02</p>
        </div>
      </div>
      <div className="my-5 flex h-14 items-end">
        <div
          className={classNames(
            'h-full w-full origin-bottom',
            hostMode && 'scene-host-levels',
          )}
        >
          <Equalizer className="h-full w-full" />
        </div>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-theme-surface">
        <span
          className={classNames(
            'scene-mode-progress block h-full w-full origin-left rounded-full bg-secondary',
            hostMode ? 'scene-host-progress' : 'scene-server-progress',
          )}
        />
      </div>
      <div className="mt-5 h-20">
        {hostMode && (
          <div className="grid h-full grid-cols-3 gap-2">
            <span className="scene-host-play flex flex-col items-center justify-center gap-2 rounded-xl border border-theme bg-theme-surface text-theme-muted">
              <PlayIcon className="h-5 w-5" />
              <span className="text-xs">Play</span>
            </span>
            <span className="scene-host-pause flex flex-col items-center justify-center gap-2 rounded-xl border border-theme bg-theme-surface text-theme-muted">
              <PauseIcon className="h-5 w-5" />
              <span className="text-xs">Pause</span>
            </span>
            <span className="scene-host-skip flex flex-col items-center justify-center gap-2 rounded-xl border border-theme bg-theme-surface text-theme-muted">
              <SkipIcon className="h-5 w-5" />
              <span className="text-xs">Skip</span>
            </span>
          </div>
        )}
        {!hostMode && (
          <div className="flex h-full flex-col justify-center gap-3">
            <div className="scene-sequencer grid h-8 grid-cols-8 gap-1.5">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((step) => (
                <span
                  key={step}
                  className="rounded-md border border-secondary/30 bg-secondary/20"
                />
              ))}
            </div>
            <p className="text-center text-theme-muted text-xs">
              Next track. No button needed.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
