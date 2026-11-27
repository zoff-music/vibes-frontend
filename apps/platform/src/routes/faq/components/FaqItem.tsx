import { Link } from '@kasperrt/smolter/preact';
import { Accordion, ArrowRightIcon } from '@vibes/ui/web';
import type { FaqQuestion } from '../../../seo/pages/faq';

interface FaqItemProps {
  item: FaqQuestion;
  forceOpen: boolean;
}

export function FaqItem({ item, forceOpen }: FaqItemProps) {
  return (
    <Accordion
      id={item.id}
      open={forceOpen}
      title={
        <h3 className="text-theme font-body text-base tracking-normal normal-case">
          {item.question}
        </h3>
      }
    >
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
    </Accordion>
  );
}
