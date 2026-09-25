import { classNames } from '@vibes/shared';
import { Button } from '@vibes/ui/web';
import type { KeyboardEvent } from 'react';
import { type Pad, TOTAL_ROUNDS } from './beatGameState';
import { useBeatGame } from './useBeatGame';

const pads: { id: Pad; rest: string; lit: string }[] = [
  {
    id: 0,
    rest: 'data-[lit=false]:border-primary/40 data-[lit=false]:bg-primary/10 data-[lit=false]:text-pink-700 dark:data-[lit=false]:text-primary',
    lit: 'data-[lit=true]:border-primary data-[lit=true]:bg-primary data-[lit=true]:text-pink-950 data-[lit=true]:shadow-primary-soft',
  },
  {
    id: 1,
    rest: 'data-[lit=false]:border-secondary/40 data-[lit=false]:bg-secondary/10 data-[lit=false]:text-cyan-700 dark:data-[lit=false]:text-secondary',
    lit: 'data-[lit=true]:border-secondary data-[lit=true]:bg-secondary data-[lit=true]:text-cyan-950 data-[lit=true]:shadow-secondary-soft',
  },
  {
    id: 2,
    rest: 'data-[lit=false]:border-purple-400/40 data-[lit=false]:bg-purple-400/10 data-[lit=false]:text-purple-500 data-[lit=false]:dark:text-purple-300',
    lit: 'data-[lit=true]:border-purple-400 data-[lit=true]:bg-purple-400 data-[lit=true]:text-purple-950',
  },
  {
    id: 3,
    rest: 'data-[lit=false]:border-amber-400/40 data-[lit=false]:bg-amber-400/10 data-[lit=false]:text-amber-700 data-[lit=false]:dark:text-amber-300',
    lit: 'data-[lit=true]:border-amber-400 data-[lit=true]:bg-amber-400 data-[lit=true]:text-amber-950',
  },
];

export function BeatGame() {
  const { ref, state, actions } = useBeatGame();
  const showing = state.phase === 'showing';
  const playing = state.phase === 'playing';
  const cleared = state.phase === 'cleared';
  const won = state.phase === 'won';
  const manual = showing && state.reducedMotion;
  const pattern = state.sequence.slice(0, state.round + 1);
  const messages = {
    idle: 'Watch the pads. Then repeat the pattern.',
    showing: 'Watch the pads…',
    playing: `Your turn. ${state.answered} / ${pattern.length}`,
    cleared: 'Nice. One more beat?',
    lost: 'Missed a beat. Fancy a remix?',
    won: 'Perfect loop. You found the beat.',
  };
  let status = messages[state.phase];
  if (showing && !state.active) {
    status = 'Paused. Come back when you’re ready.';
  } else if (manual) {
    status = pattern.map((pad) => pad + 1).join(' → ');
  } else if (showing && state.cue !== null) {
    status = `Watch: ${state.cue + 1}`;
  }

  function handleKeyDown(event: KeyboardEvent<HTMLFieldSetElement>) {
    if (event.repeat || event.altKey || event.ctrlKey || event.metaKey) {
      return;
    }

    const pad = pads.find((item) => String(item.id + 1) === event.key);
    if (pad && playing) {
      event.preventDefault();
      actions.press(pad.id);
    }
  }

  function handleAction() {
    if (manual) {
      actions.ready();
      return;
    }
    if (cleared) {
      actions.next();
      return;
    }
    actions.start();
  }

  let actionLabel = 'Play a round';
  if (manual) {
    actionLabel = 'Ready';
  } else if (cleared) {
    actionLabel = 'Next round';
  } else if (won || state.phase === 'lost') {
    actionLabel = 'Play again';
  } else if (showing || playing) {
    actionLabel = 'Restart';
  }

  return (
    <fieldset
      ref={ref}
      aria-labelledby="beat-game-title"
      onKeyDown={handleKeyDown}
      className="mx-auto w-full max-w-sm rounded-3xl border border-theme bg-theme-surface p-5 shadow-panel sm:p-6"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 id="beat-game-title" className="font-pixel text-lg text-theme">
          Repeat the beat
        </h2>
        <span className="text-theme-muted text-xs tabular-nums">
          {state.round} / {TOTAL_ROUNDS}
        </span>
      </div>
      <p
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="mt-2 min-h-10 text-sm text-theme-muted"
      >
        {status}
      </p>
      <div className="mt-3 grid grid-cols-2 gap-3">
        {pads.map((pad) => (
          <Button
            key={pad.id}
            variant="ghost"
            size="none"
            aria-label={`Pad ${pad.id + 1}`}
            aria-disabled={!playing}
            data-lit={state.cue === pad.id}
            onClick={() => actions.press(pad.id)}
            className={classNames(
              'h-20 rounded-2xl border-2 font-pixel text-3xl motion-reduce:transition-none sm:h-24',
              pad.rest,
              pad.lit,
              playing &&
                'hover:brightness-125 active:brightness-150 motion-safe:active:scale-95',
              !playing && 'cursor-default',
            )}
          >
            {pad.id + 1}
          </Button>
        ))}
      </div>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <Button
          size="small"
          variant="tertiary"
          className="min-h-11"
          onClick={handleAction}
        >
          {actionLabel}
        </Button>
        <span className="text-theme-subtle text-xs">Tap or use 1–4</span>
      </div>
    </fieldset>
  );
}
