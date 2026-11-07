import { LazyMotion } from 'framer-motion';
import type { ReactNode } from 'preact/compat';

interface MotionProviderProps {
  children: ReactNode;
}

// Server-rendered markup needs no animation features; fetch them once the page has loaded
// so they never compete with the startup bundle for bandwidth.
function afterLoad() {
  return new Promise<void>((resolve) => {
    const idle = () => {
      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(() => resolve(), { timeout: 1000 });
        return;
      }
      setTimeout(resolve, 0);
    };

    if (document.readyState === 'complete') {
      idle();
      return;
    }
    window.addEventListener('load', idle, { once: true });
  });
}

const loadFeatures = () =>
  afterLoad()
    .then(() => import('./motionFeatures'))
    .then((module) => module.domMin);

// Layout projection (shared layout and reordering) is the largest feature set; screens that need it
// load it the same way, so their first paint and hydration never wait for it.
export const loadMotionLayoutFeatures = () =>
  afterLoad()
    .then(() => import('./motionLayoutFeatures'))
    .then((module) => module.domMax);

export function MotionProvider({ children }: MotionProviderProps) {
  return <LazyMotion features={loadFeatures}>{children}</LazyMotion>;
}
