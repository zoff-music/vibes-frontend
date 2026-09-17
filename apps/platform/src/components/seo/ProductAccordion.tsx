import { classNames } from '@vibes/shared';
import { Button, PlusIcon } from '@vibes/ui/web';
import { useId, useState } from 'react';
import type { ProductSection } from '../../seo/productPages';

export function ProductAccordion({ title, body }: ProductSection) {
  const id = useId();
  const [isOpen, setIsOpen] = useState(false);

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
      <section
        id={`${id}-content`}
        aria-labelledby={`${id}-heading`}
        aria-hidden={!isOpen}
        inert={!isOpen}
        className={classNames(
          'grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none',
          isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <p className="max-w-3xl px-5 pb-6 text-sm text-theme-muted leading-relaxed sm:px-7">
            {body}
          </p>
        </div>
      </section>
    </section>
  );
}
