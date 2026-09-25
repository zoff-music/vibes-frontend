import { usePageVisibility } from '@vibes/shared';
import { useInView, useReducedMotion } from 'framer-motion';
import { useRef } from 'react';

export function useShowcaseMotion() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { amount: 0.2 });
  const visible = usePageVisibility();
  const reduceMotion = useReducedMotion();

  return {
    ref,
    state: {
      playing: inView && visible && !reduceMotion,
    },
  };
}
