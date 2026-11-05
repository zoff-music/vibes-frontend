import { LazyMotion } from 'framer-motion';
import type { ReactNode } from 'preact/compat';

interface MotionProviderProps {
  children: ReactNode;
}

const loadFeatures = () =>
  import('./motionFeatures').then((module) => module.domMin);

export function MotionProvider({ children }: MotionProviderProps) {
  return <LazyMotion features={loadFeatures}>{children}</LazyMotion>;
}
