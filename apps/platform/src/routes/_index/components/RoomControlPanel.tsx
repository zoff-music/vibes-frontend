import { classNames } from '@vibes/shared';
import {
  Button,
  ContentTransition,
  PauseIcon,
  PlayIcon,
  ResetIcon,
} from '@vibes/ui/web';
import { LayoutGroup, MotionConfig, motion } from 'framer-motion';
import { useId, useRef } from 'react';
import { roomSetups } from '../hooks/roomSetups';
import { useRoomSetup } from '../hooks/useRoomSetup';
import { RoomSetupScene } from './RoomSetupScene';
import { RoomSetupSettings } from './RoomSetupSettings';

export function RoomControlPanel() {
  const { state, actions } = useRoomSetup();
  const layoutId = useId();
  const replayRef = useRef<HTMLButtonElement>(null);
  let rule = state.settings.onlyAdminAddSongs
    ? 'Only admins add.'
    : 'Everyone can add.';

  if (state.setupId === 'skipping') {
    rule = state.settings.skipAllowed
      ? 'Anyone can skip.'
      : 'Only admins skip.';
  }

  if (state.setupId === 'repeating') {
    rule = state.settings.removeOnPlay
      ? 'Play each song once.'
      : 'Keep the songs.';
  }

  return (
    <MotionConfig reducedMotion="user">
      <figure
        aria-label="Try different settings for the electro room"
        className="relative isolate grid min-w-0 items-center gap-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16"
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
          className="pointer-events-none absolute inset-0 -z-10 bg-radial from-secondary/10 via-primary/5 to-transparent [mask-image:radial-gradient(ellipse,black,transparent_70%)]"
        />
        <div className="min-w-0">
          <fieldset className="min-w-0">
            <legend className="sr-only">Choose a room setting to try</legend>
            <LayoutGroup id={layoutId}>
              <div className="grid grid-cols-3 border-theme border-b">
                {roomSetups.map((setup) => (
                  <Button
                    key={setup.id}
                    size="none"
                    variant="ghost"
                    aria-pressed={state.setupId === setup.id}
                    onClick={() => actions.selectSetup(setup.id)}
                    className={classNames(
                      'relative min-h-12 px-1 text-sm hover:bg-theme-surface',
                      state.setupId === setup.id && 'text-theme',
                    )}
                  >
                    {setup.label}
                    {state.setupId === setup.id && (
                      <motion.span
                        aria-hidden="true"
                        layoutId="selected-setting"
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        className="absolute inset-x-0 bottom-0 h-0.5 bg-current shadow-secondary-soft"
                      />
                    )}
                  </Button>
                ))}
              </div>
            </LayoutGroup>
          </fieldset>
          <div className="mt-5 lg:mt-8">
            <RoomSetupSettings
              setupId={state.setupId}
              settings={state.settings}
              onChange={actions.updateSetting}
            />
          </div>
        </div>
        <div ref={state.ref} className="min-w-0">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-theme-muted text-xs">electro</p>
              <p className="font-pixel text-lg text-theme sm:text-xl">{rule}</p>
            </div>
            <fieldset className="flex shrink-0 items-center gap-1">
              <legend className="sr-only">Example playback controls</legend>
              <Button
                variant="tertiary"
                size="icon"
                data-animation-control
                onClick={actions.togglePlayback}
                disabled={state.reducedMotion}
                aria-label={
                  state.paused ? 'Play room examples' : 'Pause room examples'
                }
                title={
                  state.paused ? 'Play room examples' : 'Pause room examples'
                }
              >
                {state.paused && (
                  <PlayIcon aria-hidden="true" className="h-5 w-5" />
                )}
                {!state.paused && (
                  <PauseIcon aria-hidden="true" className="h-5 w-5" />
                )}
              </Button>
              <Button
                variant="tertiary"
                size="icon"
                data-animation-control
                onClick={actions.replay}
                aria-label="Replay room setup example"
                title="Replay this example"
                ref={replayRef}
              >
                <ResetIcon aria-hidden="true" className="h-5 w-5" />
              </Button>
            </fieldset>
          </div>
          <ContentTransition transitionKey={state.revision}>
            <RoomSetupScene
              setupId={state.setupId}
              settings={state.settings}
              active={state.active}
              reducedMotion={state.reducedMotion}
              announce={state.manual}
              onAction={() => replayRef.current?.focus({ preventScroll: true })}
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
