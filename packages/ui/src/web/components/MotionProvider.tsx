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

export function MotionProvider({ children }: MotionProviderProps) {
  return <LazyMotion features={loadFeatures}>{children}</LazyMotion>;
}
