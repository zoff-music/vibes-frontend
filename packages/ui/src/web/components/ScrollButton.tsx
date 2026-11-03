import { classNames } from '@vibes/shared';
import { ChevronDownIcon } from '../icons';

interface ScrollButtonProps {
  direction: 'top' | 'bottom';
  onClick: () => void;
}

export function ScrollButton({ direction, onClick }: ScrollButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={classNames(
        'pointer-events-auto flex cursor-pointer items-center gap-1 rounded-full border border-white/40 bg-primary px-3 py-1.5 font-pixel text-3xs text-white shadow-primary-button focus-visible:outline-2 focus-visible:outline-secondary focus-visible:outline-offset-2',
        direction === 'top'
          ? 'motion-safe:animate-scroll-from-top'
          : 'motion-safe:animate-scroll-from-bottom',
      )}
    >
      Scroll to {direction}
      <ChevronDownIcon
        aria-hidden="true"
        className={direction === 'top' ? 'h-3 w-3 rotate-180' : 'h-3 w-3'}
      />
    </button>
  );
}
