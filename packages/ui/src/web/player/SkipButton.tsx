import { classNames } from '@vibes/shared';
import { m as motion } from 'framer-motion';
import { Button, type ButtonVariant } from '../components/Button';
import { IconButton } from '../components/IconButton';
import { Tooltip } from '../components/Tooltip';
import { SkipIcon } from '../icons';

interface SkipButtonProps {
  canSkip: boolean;
  variant?: ButtonVariant;
  isSkipping?: boolean;
  showLabel?: boolean;
  onSkip: () => void;
}

export function SkipButton({
  canSkip,
  variant = 'tertiary',
  isSkipping = false,
  showLabel = false,
  onSkip,
}: SkipButtonProps) {
  const Control = showLabel ? Button : IconButton;

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
        <Control
          onClick={onSkip}
          disabled={!canSkip || isSkipping}
          variant={isSkipping ? 'tertiary-active' : variant}
          aria-label={
            isSkipping ? 'Skipping song' : showLabel ? 'Skip song' : 'Skip'
          }
          aria-busy={isSkipping}
          className={classNames(
            'group',
            showLabel && 'min-h-12 w-full gap-2',
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
            <SkipIcon className="h-5 w-5" />
          </motion.span>
          {showLabel && <span>{isSkipping ? 'Skipping…' : 'Skip song'}</span>}
        </Control>
      </motion.div>
    </Tooltip>
  );
}
