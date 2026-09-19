import { usePageVisibility } from '@vibes/shared';
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

interface AnimatedNumberProps {
  value: number;
}

const formatter = new Intl.NumberFormat('en');

export function AnimatedNumber({ value }: AnimatedNumberProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref);
  const visible = usePageVisibility();
  const reducedMotion = useReducedMotion();
  const count = useMotionValue(0);
  const [started, setStarted] = useState(false);
  const formatted = useTransform(count, (current) =>
    formatter.format(Math.round(current)),
  );

  useEffect(() => {
    if (reducedMotion) {
      count.set(value);
      setStarted(true);
      return;
    }

    if (!inView || !visible) return;

    setStarted(true);
    const animation = animate(count, value, {
      duration: 1.2,
      ease: [0.16, 1, 0.3, 1],
    });

    return () => animation.stop();
  }, [count, value, inView, visible, reducedMotion]);

  return (
    <span ref={ref}>
      <span className="sr-only">{formatter.format(value)}</span>
      {!started && <span aria-hidden="true">{formatter.format(value)}</span>}
      {started && <motion.span aria-hidden="true">{formatted}</motion.span>}
    </span>
  );
}
