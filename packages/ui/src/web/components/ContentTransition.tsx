import { classNames } from '@vibes/shared';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';

interface ContentTransitionProps {
  children: ReactNode;
  transitionKey: string | number;
  className?: string;
}

export function ContentTransition({
  children,
  transitionKey,
  className,
}: ContentTransitionProps) {
  const reducedMotion = useReducedMotion();

  return (
    <AnimatePresence initial={false} mode="wait">
      <motion.div
        key={transitionKey}
        initial={{ opacity: 0, y: reducedMotion ? 0 : 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: reducedMotion ? 0 : -6 }}
        transition={{ duration: reducedMotion ? 0 : 0.28, ease: 'easeInOut' }}
        className={classNames('min-w-0', className)}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
