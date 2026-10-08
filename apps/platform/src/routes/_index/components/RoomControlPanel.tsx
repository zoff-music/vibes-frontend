import { classNames } from '@vibes/shared';
import { ContentTransition } from '@vibes/ui/web';
import { MotionConfig } from 'framer-motion';
import { MusicDemo } from '../../../components/seo/MusicDemo';
import { roomSetups } from '../hooks/roomSetups';
import { useRoomSetup } from '../hooks/useRoomSetup';
import { RoomSetupScene } from './RoomSetupScene';
import { RoomSetupSettings } from './RoomSetupSettings';

export function RoomControlPanel() {
  const { ref, state, actions } = useRoomSetup();

  return (
    <MotionConfig reducedMotion="user">
      <MusicDemo
        elementRef={ref}
        label="Your room. Your rules."
        detail="A few switches. A different kind of room."
        caption={
          state.setupId === 'skipping'
            ? 'Try skipping as a listener. Vote-to-skip is off in this preview.'
            : 'Change a switch and see what happens for a listener.'
        }
        paused={state.paused || state.reducedMotion}
        onToggle={actions.toggle}
        className="h-166"
      >
        <div className="min-w-0">
          <div className="flex h-42 min-w-0 flex-col justify-between border-theme border-b bg-theme-surface/60 px-4 py-4 sm:px-6">
            <fieldset className="flex gap-2" aria-label="Room settings preview">
              {roomSetups.map((setup) => (
                <button
                  type="button"
                  key={setup.id}
                  aria-pressed={state.setupId === setup.id}
                  onClick={() => actions.selectSetup(setup.id)}
                  className={classNames(
                    'min-h-11 min-w-0 flex-1 cursor-pointer rounded-xl border px-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary',
                    state.setupId === setup.id
                      ? 'border-secondary bg-theme text-theme'
                      : 'border-transparent text-theme-muted hover:bg-theme hover:text-theme',
                  )}
                >
                  {setup.label}
                </button>
              ))}
            </fieldset>
            <div className="flex min-h-18 flex-col justify-center">
              <RoomSetupSettings
                setupId={state.setupId}
                settings={state.settings}
                onChange={actions.updateSetting}
              />
            </div>
          </div>
          <div className="min-w-0 px-4 pb-4 sm:px-6">
            <div className="flex h-14 items-center justify-between gap-3 text-theme-muted text-xs">
              <span className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="flex size-6 items-center justify-center rounded-full bg-secondary/10 font-pixel text-cyan-800 dark:text-secondary"
                >
                  M
                </span>
                Mira’s view
              </span>
              <span>Room settings applied ↓</span>
            </div>
            <ContentTransition transitionKey={state.revision}>
              <RoomSetupScene
                setupId={state.setupId}
                settings={state.settings}
                active={state.cycling}
                reducedMotion={state.reducedMotion}
                onAction={actions.completeAction}
              />
            </ContentTransition>
          </div>
        </div>
      </MusicDemo>
      <p role="status" className="sr-only">
        {state.announcement}
      </p>
    </MotionConfig>
  );
}
