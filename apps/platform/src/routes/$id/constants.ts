import type { Transition } from 'framer-motion';

export const GENERATION_REFRESH_DELAY_MS = 5 * 60 * 1000;

export const roomEntryInitialState = {
  opacity: 0,
  scale: 1.012,
  y: 14,
};

export const roomEntryTransition: Transition = {
  damping: 34,
  mass: 0.8,
  stiffness: 270,
  type: 'spring',
};

export const roomEntryVisibleState = {
  opacity: 1,
  scale: 1,
  y: 0,
};
