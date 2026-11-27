import { classNames } from '@vibes/shared';
import type { ReactNode } from 'preact/compat';
import { PlusIcon } from '../icons';

interface AccordionProps {
  title: ReactNode;
  children: ReactNode;
  id?: string;
  open?: boolean;
  variant?: 'card' | 'row';
}

export function Accordion({
  title,
  children,
  id,
  open,
  variant = 'card',
}: AccordionProps) {
  return (
    <details
      {...(id && { id })}
      {...(open && { open: true })}
      className={classNames(
        'group/accordion border-theme scroll-mt-8 details-content:grid details-content:grid-rows-[0fr] details-content:opacity-0 open:details-content:grid-rows-[1fr] open:details-content:opacity-100',
        'motion-safe:details-content:transition-[grid-template-rows,opacity,content-visibility] motion-safe:details-content:transition-discrete motion-safe:details-content:duration-300 motion-safe:details-content:ease-out',
        variant === 'card'
          ? 'bg-theme-surface open:border-secondary/40 overflow-clip rounded-2xl border'
          : 'border-b last:border-b-0',
      )}
    >
      <summary className="text-theme hover:bg-theme focus-visible:ring-secondary flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset motion-safe:transition-colors sm:px-6 [&::-webkit-details-marker]:hidden">
        {title}
        <span
          aria-hidden="true"
          className="border-theme text-secondary flex size-8 shrink-0 items-center justify-center rounded-full border group-open/accordion:rotate-45 motion-safe:transition-transform motion-safe:duration-300 motion-safe:ease-out"
        >
          <PlusIcon className="size-4" />
        </span>
      </summary>
      <div className="min-h-0 overflow-hidden">
        <div className="px-5 pb-5 sm:px-6">{children}</div>
      </div>
    </details>
  );
}
