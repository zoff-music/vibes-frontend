import { usePageVisibility } from '@vibes/shared';
import { useInView, useReducedMotion } from 'framer-motion';
import { useEffect, useReducer, useRef } from 'preact/compat';
import { beatGameReducer, initialBeatGame, type Pad } from './beatGameState';

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

    // Speed up each round, easing toward a readable 360 ms per beat.
    const tempoScale = 0.6 + 0.4 * 0.88 ** (game.round - 1);
    const delay = Math.round((game.cue === null ? 180 : 420) * tempoScale);
    const timer = window.setTimeout(() => dispatch({ type: 'tick' }), delay);

    return () => window.clearTimeout(timer);
  }, [active, reducedMotion, game.phase, game.cue, game.round]);

  useEffect(() => {
    if (!active || game.phase !== 'cleared') return;
    const timer = window.setTimeout(
      () =>
        dispatch({
          type: 'next',
          pad: PADS[Math.floor(Math.random() * PADS.length)],
        }),
      900,
    );
    return () => window.clearTimeout(timer);
  }, [active, game.phase]);

  function start() {
    const sequence = Array.from(
      { length: 2 },
      () => PADS[Math.floor(Math.random() * PADS.length)],
    );
    dispatch({ type: 'start', sequence });
  }

  return {
    ref,
    state: { ...game, reducedMotion, active },
    actions: {
      start,
      press: (pad: Pad) => dispatch({ type: 'press', pad }),
      ready: () => dispatch({ type: 'ready' }),
    },
  };
}
