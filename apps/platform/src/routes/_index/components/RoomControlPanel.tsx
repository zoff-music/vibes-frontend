import { classNames } from '@vibes/shared';
import { Button, ContentTransition } from '@vibes/ui/web';
import { LayoutGroup, MotionConfig, motion } from 'framer-motion';
import { useId } from 'react';
import { roomSetups } from '../hooks/roomSetups';
import { useRoomSetup } from '../hooks/useRoomSetup';
import { RoomSetupScene } from './RoomSetupScene';
import { RoomSetupSettings } from './RoomSetupSettings';

export function RoomControlPanel() {
  const { state, actions } = useRoomSetup();
  const layoutId = useId();
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
        <fieldset
          ref={state.ref}
          tabIndex={-1}
          className="min-w-0 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
        >
          <legend className="sr-only">Room setting example</legend>
          <div className="mb-4">
            <p className="text-theme-muted text-xs">electro</p>
            <p className="font-pixel text-lg text-theme sm:text-xl">{rule}</p>
          </div>
          <ContentTransition transitionKey={state.revision}>
            <RoomSetupScene
              setupId={state.setupId}
              settings={state.settings}
              active={state.active}
              reducedMotion={state.reducedMotion}
              onAction={actions.completeAction}
            />
          </ContentTransition>
        </fieldset>
        <p role="status" className="sr-only">
          {state.announcement}
        </p>
      </figure>
    </MotionConfig>
  );
}
