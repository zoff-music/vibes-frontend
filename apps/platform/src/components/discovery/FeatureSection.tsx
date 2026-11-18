import { classNames } from '@vibes/shared';
import { ArrowRightIcon, LinkButton } from '@vibes/ui/web';
import type { ReactNode } from 'preact/compat';

interface FeatureLink {
  to: string;
  label: string;
}

interface FeatureSectionProps {
  id: string;
  title: ReactNode;
  children: ReactNode;
  description: ReactNode;
  note?: ReactNode;
  link?: FeatureLink;
  reverse?: boolean;
}

// One layout for every "copy beside a demo" block across the site.
export function FeatureSection({
  id,
  title,
  children,
  description,
  note,
  link,
  reverse = false,
}: FeatureSectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className="border-theme grid scroll-mt-8 items-center gap-10 border-t py-16 sm:py-20 lg:grid-cols-5 lg:gap-14"
    >
      <div
        className={classNames('min-w-0 lg:col-span-2', reverse && 'lg:order-2')}
      >
        <h2
          id={`${id}-heading`}
          className="font-pixel text-3xl leading-tight tracking-tight normal-case sm:text-4xl"
        >
          {title}
        </h2>
        <p className="text-theme-muted mt-5 max-w-xl leading-relaxed sm:text-lg">
          {description}
        </p>
        {note && <p className="text-theme-muted mt-4 text-sm">{note}</p>}
        {link && <GuideLink to={link.to}>{link.label}</GuideLink>}
      </div>
      <div
        className={classNames('min-w-0 lg:col-span-3', reverse && 'lg:order-1')}
      >
        {children}
      </div>
    </section>
  );
}

interface GuideLinkProps {
  to: string;
  children: ReactNode;
}

export function GuideLink({ to, children }: GuideLinkProps) {
  return (
    <LinkButton
      to={to}
      prefetch="intent"
      variant="tertiary"
      className="group mt-6 min-h-12 gap-3"
    >
      {children}
      <ArrowRightIcon
        aria-hidden="true"
        className="size-4 shrink-0 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
      />
    </LinkButton>
  );
}
