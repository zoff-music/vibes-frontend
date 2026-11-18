import { classNames } from '@vibes/shared';
import { PlusIcon } from '@vibes/ui/web';
import { useId, useState } from 'preact/compat';
import type { ProductSection } from '../../seo/productPages';

export function ProductAccordion({ title, body }: ProductSection) {
  const id = useId();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section className="border-theme border-b last:border-b-0">
      <h2>
        <button
          type="button"
          id={`${id}-heading`}
          aria-expanded={isOpen}
          aria-controls={`${id}-content`}
          onClick={() => setIsOpen((open) => !open)}
          className="group text-theme hover:bg-theme-surface focus-visible:ring-secondary flex min-h-16 w-full cursor-pointer items-center justify-between gap-4 px-5 py-5 text-left text-base transition-colors focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset sm:px-7"
        >
          <span className="font-pixel normal-case">{title}</span>
          <PlusIcon
            aria-hidden="true"
            className={classNames(
              'h-4 w-4 shrink-0 text-secondary transition-transform duration-300 ease-out motion-reduce:transition-none',
              isOpen && 'rotate-135',
            )}
          />
        </button>
      </h2>
      <section
        id={`${id}-content`}
        aria-labelledby={`${id}-heading`}
        aria-hidden={!isOpen}
        inert={!isOpen}
        className={classNames(
          'grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none',
          isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <p
            className={classNames(
              'max-w-3xl px-5 pb-6 text-sm leading-relaxed text-theme-muted transition-opacity duration-300 motion-reduce:transition-none sm:px-7',
              isOpen ? 'opacity-100' : 'opacity-0',
            )}
          >
            {body}
          </p>
        </div>
      </section>
    </section>
  );
}
