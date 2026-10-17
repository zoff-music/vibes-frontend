import { Link } from '@kasperrt/smolter/preact';
import { ArrowRightIcon } from '@vibes/ui/web';
import type { ReactNode } from 'preact/compat';
import type { ProductPage } from '../../seo/productPages';
import { SiteHero } from '../layout/SiteHero';
import { SitePage } from '../layout/SitePage';
import { ProductAccordion } from '../seo/ProductAccordion';
import { ProductLinks } from '../seo/ProductLinks';

interface WatchPageProps {
  page: ProductPage;
  preview: ReactNode;
  children?: ReactNode;
}

export function WatchPage({ page, preview, children }: WatchPageProps) {
  return (
    <SitePage>
      <article>
        <div className="py-8 sm:py-12">
          <SiteHero
            id="watch-guide-heading"
            eyebrow={page.label.toUpperCase()}
            title={page.heading}
            description={page.introduction}
            aside={preview}
          >
            <Link
              prefetch="intent"
              to="/features/watch"
              className="mt-6 inline-flex min-h-12 items-center gap-4 rounded-xl bg-primary px-5 text-text-inverse hover:bg-primary-muted focus-visible:ring-2 focus-visible:ring-secondary"
            >
              {page.actionLabel}
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
            <p className="mt-3 text-theme-muted text-xs">
              Always free. No account needed.
            </p>
          </SiteHero>
        </div>
        <div className="grid gap-12 py-16 sm:grid-cols-2 sm:py-24">
          {page.sections.slice(0, 2).map((section, index) => (
            <section key={section.title}>
              <p className="mb-4 font-pixel text-secondary text-xs">
                0{index + 1}
              </p>
              <h2 className="font-pixel text-3xl normal-case tracking-tight">
                {section.title}
              </h2>
              <p className="mt-5 text-lg text-theme-muted leading-relaxed">
                {section.body}
              </p>
            </section>
          ))}
        </div>
        {children}
        <div className="overflow-hidden rounded-3xl border border-theme bg-theme-surface">
          {page.sections.slice(2).map((section) => (
            <ProductAccordion key={section.title} {...section} />
          ))}
        </div>
      </article>
      <section className="py-20" aria-labelledby="watch-more-heading">
        <h2
          id="watch-more-heading"
          className="mb-8 font-pixel text-3xl normal-case"
        >
          More ways to Watch
        </h2>
        <ProductLinks watch currentSlug={page.slug} />
      </section>
    </SitePage>
  );
}
