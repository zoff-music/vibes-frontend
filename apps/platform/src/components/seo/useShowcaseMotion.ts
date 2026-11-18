import { usePageVisibility } from '@vibes/shared';
import { useInView, useReducedMotion } from 'framer-motion';
import { useRef, useState } from 'preact/compat';

// Section demos wait for a press; only a page's hero plays on its own.
export function useShowcaseMotion(autoplay = true) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { amount: 0.2 });
  const visible = usePageVisibility();
  const reduceMotion = useReducedMotion();
  const [paused, setPaused] = useState(!autoplay);

  return {
    ref,
    state: {
      playing: inView && visible && !reduceMotion && !paused,
      paused: paused || reduceMotion === true,
    },
    actions: { toggle: () => setPaused((value) => !value) },
  };
}
