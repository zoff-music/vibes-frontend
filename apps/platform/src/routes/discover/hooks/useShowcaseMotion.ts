import { usePageVisibility } from '@vibes/shared';
import { useInView, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

export function useShowcaseMotion() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { amount: 0.2 });
  const visible = usePageVisibility();
  const reduceMotion = useReducedMotion();
  const [started, setStarted] = useState(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (inView && visible && !reduceMotion) setStarted(true);
  }, [inView, visible, reduceMotion]);

  return {
    ref,
    animated: started && !reduceMotion,
    playing: started && inView && visible && !reduceMotion && !paused,
    paused,
    reduceMotion,
    toggle: () => setPaused((current) => !current),
  };
}
