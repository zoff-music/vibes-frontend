import { classNames, usePageVisibility } from '@vibes/shared';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { useRef } from 'react';
import { SparklesIcon } from '../icons';

interface GenerationSparklesProps {
  active?: boolean;
  className?: string;
}

export function GenerationSparkles({
  active = true,
  className,
}: GenerationSparklesProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  const visible = usePageVisibility();
  const reducedMotion = useReducedMotion();
  const animate = active && inView && visible && !reducedMotion;

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={classNames(
        'flex h-20 w-20 items-center justify-center rounded-full bg-secondary/10 text-cyan-700 dark:text-secondary',
        className,
      )}
    >
      <motion.div
        initial={false}
        animate={{
          scale: animate ? [0.72, 1.18, 0.9, 0.72] : 1,
          opacity: animate ? [0.35, 1, 0.55, 0.35] : 1,
        }}
        transition={{
          duration: animate ? 1.8 : 0,
          repeat: animate ? Number.POSITIVE_INFINITY : 0,
          ease: 'easeInOut',
        }}
      >
        <SparklesIcon className="h-10 w-10" />
      </motion.div>
    </div>
  );
}
