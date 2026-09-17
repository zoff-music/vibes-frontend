import { classNames } from '@vibes/shared';
import { Button, PlusIcon } from '@vibes/ui/web';
import { motion, useReducedMotion } from 'framer-motion';
import { useId, useState } from 'react';
import type { ProductSection } from '../../seo/productPages';

export function ProductAccordion({ title, body }: ProductSection) {
  const id = useId();
  const [isOpen, setIsOpen] = useState(false);
  const reduceMotion = useReducedMotion();

  return (
    <section className="border-theme border-b last:border-b-0">
      <h2>
        <Button
          id={`${id}-heading`}
          aria-expanded={isOpen}
          aria-controls={`${id}-content`}
          onClick={() => setIsOpen((open) => !open)}
          variant="ghost"
          size="none"
          contentAlignment="between"
          className="min-h-16 w-full gap-4 px-5 py-5 font-pixel text-base text-theme hover:bg-theme-surface sm:px-7"
        >
          {title}
          <PlusIcon
            aria-hidden="true"
            className={classNames(
              'h-4 w-4 shrink-0 text-secondary transition-transform duration-200 motion-reduce:transition-none',
              isOpen && 'rotate-45',
            )}
          />
        </Button>
      </h2>
      <motion.div
        id={`${id}-content`}
        role="region"
        aria-labelledby={`${id}-heading`}
        aria-hidden={!isOpen}
        inert={!isOpen}
        initial={false}
        animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.24, ease: 'easeInOut' }}
        className="overflow-hidden"
      >
        <p className="max-w-3xl px-5 pb-6 text-sm text-theme-muted leading-relaxed sm:px-7">
          {body}
        </p>
      </motion.div>
    </section>
  );
}
