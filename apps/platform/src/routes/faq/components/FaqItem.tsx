import { Link } from '@kasperrt/smolter/preact';
import { ArrowRightIcon, PlusIcon } from '@vibes/ui/web';
import type { FaqQuestion } from '../../../seo/pages/faq';

interface FaqItemProps {
  item: FaqQuestion;
  forceOpen: boolean;
}

// Native details: every answer is in the HTML for search engines and works
// without JavaScript.
export function FaqItem({ item, forceOpen }: FaqItemProps) {
  return (
    <details
      id={item.id}
      {...(forceOpen && { open: true })}
      className="group border-theme bg-theme-surface open:border-secondary/40 scroll-mt-8 rounded-2xl border transition-colors"
    >
      <summary className="hover:bg-theme focus-visible:ring-secondary flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 rounded-2xl px-5 py-4 transition-colors focus-visible:ring-2 focus-visible:outline-none sm:px-6 [&::-webkit-details-marker]:hidden">
        <h3 className="text-theme font-body text-base tracking-normal normal-case">
          {item.question}
        </h3>
        <span
          aria-hidden="true"
          className="border-theme text-secondary flex size-8 shrink-0 items-center justify-center rounded-full border transition-transform duration-300 group-open:rotate-45 motion-reduce:transition-none"
        >
          <PlusIcon className="size-4" />
        </span>
      </summary>
      <div className="px-5 pb-5 sm:px-6">
        <p className="text-theme-muted max-w-2xl leading-relaxed">
          {item.answer}
        </p>
        {item.guide && (
          <Link
            to={item.guide.to}
            prefetch="intent"
            className="group/link dark:text-secondary focus-visible:ring-secondary mt-3 inline-flex min-h-11 items-center gap-2 rounded-lg text-sm text-cyan-800 focus-visible:ring-2 focus-visible:outline-none"
          >
            {item.guide.label}
            <ArrowRightIcon
              aria-hidden="true"
              className="size-4 transition-transform group-hover/link:translate-x-0.5 motion-reduce:transition-none"
            />
          </Link>
        )}
      </div>
    </details>
  );
}
