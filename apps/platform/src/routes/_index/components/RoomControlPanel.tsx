import {
  Button,
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
          className="pointer-events-none absolute inset-x-0 top-28 -z-10 h-80 bg-radial from-secondary/10 via-primary/5 to-transparent [mask-image:radial-gradient(ellipse,black,transparent_70%)]"
        />
        <div className="flex items-center justify-between gap-4">
          <p className="font-pixel text-2xl text-theme sm:text-3xl">
            electro
            <span aria-hidden="true" className="text-primary">
              .
            </span>
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
              size="icon"
              data-animation-control
              onClick={actions.replay}
              aria-label="Replay room setup example"
            >
              <ResetIcon aria-hidden="true" className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <fieldset className="mt-4">
          <legend className="sr-only">Choose a room setting to try</legend>
          <div className="grid grid-cols-3 gap-2">
            {roomSetups.map((setup) => (
              <Button
                key={setup.id}
                size="none"
                variant={
                  state.setupId === setup.id ? 'tertiary-active' : 'tertiary'
                }
                aria-pressed={state.setupId === setup.id}
                onClick={() => actions.selectSetup(setup.id)}
                className="min-h-11 rounded-xl px-2 py-2 text-xs sm:text-sm"
              >
                {setup.label}
              </Button>
            ))}
          </div>
        </fieldset>
        <div className="mt-5 border-theme border-y py-4 sm:mt-6 sm:py-5">
          <div className="max-w-lg">
            <RoomSetupSettings
              setupId={state.setupId}
              settings={state.settings}
              onChange={actions.updateSetting}
            />
          </div>
        </div>
        <div ref={state.ref} className="pt-4 sm:pt-6">
          <ContentTransition transitionKey={state.revision}>
            <RoomSetupScene
              setupId={state.setupId}
              settings={state.settings}
              active={state.active}
              reducedMotion={state.reducedMotion}
              announce={state.manual}
            />
          </ContentTransition>
        </div>
        <p role="status" className="sr-only">
          {state.announcement}
        </p>
      </figure>
    </MotionConfig>
  );
}
