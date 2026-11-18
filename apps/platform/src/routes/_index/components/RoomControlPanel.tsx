import { classNames } from '@vibes/shared';
import { ContentTransition, SegmentedToggle } from '@vibes/ui/web';
import { MotionConfig } from 'framer-motion';
import { MusicDemo } from '../../../components/seo/MusicDemo';
import type { RoomSetupId, RoomSetupSettings } from '../hooks/roomSetups';
import { useRoomSetup } from '../hooks/useRoomSetup';
import { RoomSetupScene } from './RoomSetupScene';

interface RuleRow {
  id: RoomSetupId;
  key: keyof RoomSetupSettings;
  label: string;
  description: string;
  inverted: boolean;
}

// Same labels and copy as the room's settings menu.
const rules: RuleRow[] = [
  {
    id: 'adding',
    key: 'onlyAdminAddPlaylistItems',
    label: 'Admins Only Add',
    description: 'Only admins add songs',
    inverted: false,
  },
  {
    id: 'skipping',
    key: 'skipAllowed',
    label: 'Admins Only Skip',
    description: 'Only room admins can skip songs',
    inverted: true,
  },
  {
    id: 'repeating',
    key: 'removeOnPlay',
    label: 'Remove Played',
    description: 'Removed after play',
    inverted: false,
  },
];

export function RoomControlPanel() {
  const { ref, state, actions } = useRoomSetup();

  return (
    <MotionConfig reducedMotion="user">
      <MusicDemo
        elementRef={ref}
        label="Your room. Your rules."
        detail="Change a room setting and see what a listener gets."
        caption={
          state.setupId === 'skipping' && !state.settings.skipAllowed
            ? 'Only admins skip. Mira can still vote, add and listen.'
            : 'Flip a switch. Everyone in the room follows it.'
        }
        paused={state.paused || state.reducedMotion}
        onToggle={actions.toggle}
      >
        <div className="@container grid min-w-0">
          <section
            aria-label="Room settings preview"
            className="border-theme bg-theme-surface/60 min-w-0 border-b p-4 sm:p-5"
          >
            <p className="border-theme font-pixel text-2xs text-theme-muted tracking-label mb-2 border-b pb-2">
              Room Control
            </p>
            <div className="grid gap-1 @2xl:grid-cols-3 @2xl:gap-3">
              {rules.map((rule) => {
                const value = state.settings[rule.key];
                const checked = rule.inverted ? !value : value;

                return (
                  <div
                    key={rule.id}
                    className={classNames(
                      '-mx-2 rounded-2xl px-2 py-1 transition-colors duration-300',
                      state.setupId === rule.id
                        ? 'bg-secondary/10'
                        : 'bg-transparent',
                    )}
                  >
                    <SegmentedToggle
                      label={rule.label}
                      description={rule.description}
                      variant="plain-full"
                      checked={checked}
                      onChange={(next) =>
                        actions.changeRule(
                          rule.id,
                          rule.key,
                          rule.inverted ? !next : next,
                        )
                      }
                    />
                  </div>
                );
              })}
            </div>
          </section>
          <section
            aria-label="What a listener sees"
            className="min-w-0 p-4 sm:p-5"
          >
            <p className="text-theme-muted mb-3 flex items-center gap-2 text-xs">
              <span
                aria-hidden="true"
                className="bg-secondary/10 font-pixel dark:text-secondary flex size-6 items-center justify-center rounded-full text-cyan-800"
              >
                M
              </span>
              What Mira sees
            </p>
            <ContentTransition transitionKey={state.revision}>
              <RoomSetupScene
                setupId={state.setupId}
                settings={state.settings}
                active={state.cycling}
                reducedMotion={state.reducedMotion}
                onAction={actions.completeAction}
              />
            </ContentTransition>
          </section>
        </div>
      </MusicDemo>
      <p role="status" className="sr-only">
        {state.announcement}
      </p>
    </MotionConfig>
  );
}
