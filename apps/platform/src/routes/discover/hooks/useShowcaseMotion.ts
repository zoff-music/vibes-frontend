import { usePageVisibility } from '@vibes/shared';
import { useInView, useReducedMotion } from 'framer-motion';
import { useRef, useState } from 'react';

export function useShowcaseMotion() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { amount: 0.2 });
  const visible = usePageVisibility();
  const reduceMotion = useReducedMotion();
  const [paused, setPaused] = useState(false);

  return {
    state: {
      ref,
      playing: inView && visible && !reduceMotion && !paused,
      paused,
      reduceMotion,
    },
    toggle: () => setPaused((current) => !current),
  };
}
