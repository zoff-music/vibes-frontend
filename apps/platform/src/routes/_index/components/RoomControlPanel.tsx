import {
  Button,
  CheckIcon,
  ContentTransition,
  PauseIcon,
  PlayIcon,
  ResetIcon,
} from '@vibes/ui/web';
import { MotionConfig } from 'framer-motion';
import { roomSetups } from '../hooks/roomSetups';
import { useRoomSetup } from '../hooks/useRoomSetup';
import { RoomSetupScene } from './RoomSetupScene';
import { RoomSetupSettings } from './RoomSetupSettings';

export function RoomControlPanel() {
  const { state, actions } = useRoomSetup();
  const { settings } = state;

  return (
    <MotionConfig reducedMotion="user">
      <figure
        aria-label="Try different settings for the electro room"
        className="relative isolate min-w-0"
        onFocusCapture={(event) => {
          if (
            event.target instanceof HTMLElement &&
            !event.target.closest('[data-animation-control]')
          ) {
            actions.takeControl();
          }
        }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-16 -z-10 h-112 overflow-hidden [mask-image:radial-gradient(ellipse,black,transparent_70%)]"
        >
          <div className="absolute inset-0 bg-radial from-secondary/10 via-primary/5 to-transparent" />
        </div>

        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-3 font-pixel text-theme-muted text-xs tracking-label">
              ROOM / SERVER MODE
            </p>
            <p className="font-pixel text-5xl text-theme leading-none tracking-tight sm:text-7xl">
              electro
              <span aria-hidden="true" className="text-primary">
                .
              </span>
            </p>
          </div>
          <fieldset className="min-w-0 lg:w-3/5">
            <legend className="mb-3 font-pixel text-theme-muted text-xs">
              Choose a setup to see it in action
            </legend>
            <div className="grid grid-cols-3 gap-2">
              {roomSetups.map((setup, index) => (
                <Button
                  key={setup.id}
                  size="none"
                  variant={
                    state.setupId === setup.id ? 'tertiary-active' : 'tertiary'
                  }
                  aria-pressed={state.setupId === setup.id}
                  onClick={() => actions.selectSetup(setup.id)}
                  className="min-h-17 flex-col items-start gap-2 rounded-xl px-3 py-3 text-left text-xs sm:px-4 sm:text-sm"
                >
                  <span
                    aria-hidden="true"
                    className="flex w-full items-center justify-between text-2xs text-theme-muted"
                  >
                    0{index + 1}
                    {state.setupId === setup.id && (
                      <CheckIcon className="h-3 w-3 text-secondary" />
                    )}
                  </span>
                  {setup.label}
                </Button>
              ))}
            </div>
          </fieldset>
        </div>

        <div
          ref={state.ref}
          className="mt-8 border-theme border-t pt-8 sm:mt-10 sm:pt-10"
        >
          <ContentTransition transitionKey={state.revision}>
            <RoomSetupScene
              setupId={state.setupId}
              settings={settings}
              active={state.active}
              reducedMotion={state.reducedMotion}
              announce={state.manual}
            />
          </ContentTransition>
        </div>

        <div className="mt-8 flex items-center justify-between gap-4 border-theme border-b pb-5">
          <p className="font-pixel text-primary text-xs tracking-label">
            CHANGE THE RULES
          </p>
          <div className="flex gap-2">
            <Button
              variant="tertiary"
              size="icon"
              data-animation-control
              onClick={actions.togglePlayback}
              disabled={state.reducedMotion}
              aria-label={
                state.paused ? 'Play room setups' : 'Pause room setups'
              }
            >
              {state.paused && (
                <PlayIcon aria-hidden="true" className="h-4 w-4" />
              )}
              {!state.paused && (
                <PauseIcon aria-hidden="true" className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="tertiary"
              size="small"
              data-animation-control
              onClick={actions.replay}
              aria-label="Replay room setup example"
              className="min-h-11 gap-2"
            >
              <ResetIcon aria-hidden="true" className="h-3.5 w-3.5" />
              Replay
            </Button>
          </div>
        </div>
        <ContentTransition transitionKey={state.setupId} className="mt-6">
          <RoomSetupSettings
            setupId={state.setupId}
            settings={settings}
            onChange={actions.updateSetting}
          />
        </ContentTransition>
        <figcaption className="mt-8 text-theme-muted text-xs">
          A room password protects your admin controls.
        </figcaption>
        <p role="status" className="sr-only">
          {state.announcement}
        </p>
      </figure>
    </MotionConfig>
  );
}
