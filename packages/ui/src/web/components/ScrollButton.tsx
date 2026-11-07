import { classNames } from '@vibes/shared';
import { m as motion, useReducedMotion } from 'framer-motion';
import { ChevronDownIcon } from '../icons';

interface ScrollButtonProps {
  direction: 'top' | 'bottom';
  onClick: () => void;
}

export function ScrollButton({ direction, onClick }: ScrollButtonProps) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={
        reducedMotion
          ? false
          : { opacity: 0, y: direction === 'top' ? -12 : 12 }
      }
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reducedMotion ? 0 : 0.18, ease: 'easeOut' }}
      className="pointer-events-auto flex cursor-pointer items-center gap-1 rounded-full border border-white/40 bg-primary px-3 py-1.5 font-pixel text-3xs text-white shadow-primary-button focus-visible:outline-2 focus-visible:outline-secondary focus-visible:outline-offset-2"
    >
      Scroll to {direction}
      <ChevronDownIcon
        aria-hidden="true"
        className={classNames('h-3 w-3', direction === 'top' && 'rotate-180')}
      />
    </motion.button>
  );
}
