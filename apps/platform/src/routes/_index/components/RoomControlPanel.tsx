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
        className="relative isolate grid min-h-164 min-w-0 content-start items-start gap-6 overflow-hidden rounded-3xl border border-theme bg-theme p-5 lg:min-h-120 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:content-center lg:items-center lg:gap-10 lg:p-8"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -right-24 -z-10 h-80 w-80 rounded-full bg-primary/5 blur-3xl"
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
                      state.setupId === setup.id &&
                        'bg-secondary/10 text-secondary',
                    )}
                  >
                    {setup.label}
                    {state.setupId === setup.id && (
                      <motion.span
                        aria-hidden="true"
                        layoutId="selected-setting"
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        className="absolute inset-x-0 bottom-0 h-0.5 bg-secondary shadow-secondary-soft"
                      />
                    )}
                  </Button>
                ))}
              </div>
            </LayoutGroup>
          </fieldset>
          <div className="mt-5 min-h-20 lg:mt-8">
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
          className="relative min-w-0 overflow-hidden rounded-2xl border border-theme bg-theme-surface p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
        >
          <legend className="sr-only">Room setting example</legend>
          <motion.div
            key={state.revision}
            aria-hidden="true"
            initial={{ scaleX: 0, opacity: 1 }}
            animate={{
              scaleX: 1,
              opacity: state.reducedMotion ? 1 : [1, 1, 0],
            }}
            transition={{ duration: state.reducedMotion ? 0 : 0.8 }}
            className="pointer-events-none absolute inset-x-0 top-0 h-0.5 origin-left bg-linear-to-r from-primary to-secondary"
          />
          <div className="mb-4 min-h-12">
            <p className="flex items-center gap-2 text-theme-muted text-xs">
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full bg-secondary"
              />
              electro
            </p>
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
