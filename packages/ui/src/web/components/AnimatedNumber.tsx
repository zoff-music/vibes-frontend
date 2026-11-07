import { usePageVisibility } from '@vibes/shared';
import { useInView, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState } from 'preact/compat';

interface AnimatedNumberProps {
  value: number;
}

const formatter = new Intl.NumberFormat('en');
const duration = 1200;

// cubic-bezier(0.16, 1, 0.3, 1): a requestAnimationFrame count-up keeps the animation engine off the startup path.
function easeOut(progress: number) {
  const [x1, y1, x2, y2] = [0.16, 1, 0.3, 1];
  const curve = (a: number, b: number, t: number) =>
    3 * a * (1 - t) ** 2 * t + 3 * b * (1 - t) * t ** 2 + t ** 3;
  let low = 0;
  let high = 1;
  let t = progress;
  for (let step = 0; step < 20; step++) {
    t = (low + high) / 2;
    if (curve(x1, x2, t) < progress) low = t;
    else high = t;
  }

  return curve(y1, y2, t);
}

export function AnimatedNumber({ value }: AnimatedNumberProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref);
  const visible = usePageVisibility();
  const reducedMotion = useReducedMotion();
  const [current, setCurrent] = useState<number | null>(null);
  // Resume from the shown count, as the previous motion value did, when visibility interrupts a run.
  const shown = useRef(0);

  useEffect(() => {
    if (reducedMotion) {
      shown.current = value;
      setCurrent(value);

      return;
    }

    if (!inView || !visible) return;

    let frame = 0;
    const from = shown.current;
    const started = performance.now();
    const step = (now: number) => {
      const progress = Math.min(1, (now - started) / duration);
      shown.current = from + (value - from) * easeOut(progress);
      setCurrent(Math.round(shown.current));
      if (progress < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);

    return () => cancelAnimationFrame(frame);
  }, [value, inView, visible, reducedMotion]);

  return (
    <span ref={ref}>
      <span className="sr-only">{formatter.format(value)}</span>
      <span aria-hidden="true">{formatter.format(current ?? value)}</span>
    </span>
  );
}
