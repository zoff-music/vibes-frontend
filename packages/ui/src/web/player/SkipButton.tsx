import { classNames } from '@vibes/shared';
import { motion } from 'framer-motion';
import { Button } from '../components/Button';
import { Tooltip } from '../components/Tooltip';
import { SkipIcon } from '../icons';

interface SkipButtonProps {
  canSkip: boolean;
  isSkipping?: boolean;
  onSkip: () => void;
}

export function SkipButton({
  canSkip,
  isSkipping = false,
  onSkip,
}: SkipButtonProps) {
  return (
    <Tooltip
      className="inline-flex"
      content={isSkipping ? 'Skipping song…' : 'Skip'}
    >
      <motion.div
        animate={isSkipping ? { x: [0, 5, -2, 0] } : { x: 0 }}
        transition={{ duration: 0.38 }}
      >
        <Button
          onClick={onSkip}
          disabled={!canSkip || isSkipping}
          variant="tertiary"
          size="icon"
          aria-label={isSkipping ? 'Skipping song' : 'Skip'}
          aria-busy={isSkipping}
          className={classNames(
            'group',
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
        </Button>
      </motion.div>
    </Tooltip>
  );
}
