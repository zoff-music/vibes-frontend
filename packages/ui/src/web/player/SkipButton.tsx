import { classNames } from '@vibes/shared';
import { motion } from 'framer-motion';
import { Button } from '../components/Button';
import { Tooltip } from '../components/Tooltip';
import { SkipIcon } from '../icons';

interface SkipButtonProps {
  canSkip: boolean;
  isSkipping?: boolean;
  showLabel?: boolean;
  onSkip: () => void;
}

export function SkipButton({
  canSkip,
  isSkipping = false,
  showLabel = false,
  onSkip,
}: SkipButtonProps) {
  return (
    <Tooltip
      className={classNames('inline-flex', showLabel && 'w-full')}
      content={isSkipping ? 'Skipping song…' : 'Skip'}
    >
      <motion.div
        className={classNames(showLabel && 'w-full')}
        animate={isSkipping ? { x: [0, 5, -2, 0] } : { x: 0 }}
        transition={{ duration: 0.38 }}
      >
        <Button
          onClick={onSkip}
          disabled={!canSkip || isSkipping}
          variant="tertiary"
          size={showLabel ? 'small' : 'icon'}
          aria-label={
            isSkipping ? 'Skipping song' : showLabel ? 'Skip song' : 'Skip'
          }
          aria-busy={isSkipping}
          className={classNames(
            'group',
            showLabel && 'min-h-12 w-full gap-2 text-sm',
            isSkipping &&
              'border-primary/60 bg-primary/15 shadow-secondary-soft',
          )}
        >
          <motion.span
            animate={
              isSkipping
                ? { opacity: [1, 0.45, 1], x: [0, 4, 0] }
                : { opacity: 1, x: 0 }
            }
            transition={{ duration: 0.38 }}
          >
            <SkipIcon className="h-5 w-5 text-theme-muted transition-colors group-hover:text-primary" />
          </motion.span>
          {showLabel && <span>{isSkipping ? 'Skipping…' : 'Skip song'}</span>}
        </Button>
      </motion.div>
    </Tooltip>
  );
}
