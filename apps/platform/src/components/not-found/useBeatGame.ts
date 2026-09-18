import { usePageVisibility } from '@vibes/shared';
import { useInView, useReducedMotion } from 'framer-motion';
import { useEffect, useReducer, useRef } from 'react';
import {
  beatGameReducer,
  initialBeatGame,
  type Pad,
  TOTAL_ROUNDS,
} from './beatGameState';

const PADS: Pad[] = [0, 1, 2, 3];

export function useBeatGame() {
  const [game, dispatch] = useReducer(beatGameReducer, initialBeatGame);
  const ref = useRef<HTMLFieldSetElement>(null);
  const inView = useInView(ref, { amount: 0.5 });
  const visible = usePageVisibility();
  const reducedMotion = useReducedMotion();
  const active = inView && visible;

  useEffect(() => {
    if (!active || reducedMotion || game.phase !== 'showing') {
      return;
    }

    const delay = game.cue === null ? 350 : 700;
    const timer = window.setTimeout(() => dispatch({ type: 'tick' }), delay);
    return () => window.clearTimeout(timer);
  }, [active, reducedMotion, game.phase, game.cue]);

  function start() {
    const sequence = Array.from(
      { length: TOTAL_ROUNDS + 1 },
      () => PADS[Math.floor(Math.random() * PADS.length)],
    );
    dispatch({ type: 'start', sequence });
  }

  return {
    state: { ...game, ref, reducedMotion, active },
    actions: {
      start,
      press: (pad: Pad) => dispatch({ type: 'press', pad }),
      ready: () => dispatch({ type: 'ready' }),
      next: () => dispatch({ type: 'next' }),
    },
  };
}
