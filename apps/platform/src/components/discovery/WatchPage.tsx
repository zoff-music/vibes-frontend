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
              className="bg-primary text-text-inverse hover:bg-primary-muted focus-visible:ring-secondary mt-6 inline-flex min-h-12 items-center gap-4 rounded-xl px-5 focus-visible:ring-2"
            >
              {page.actionLabel}
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
            <p className="text-theme-muted mt-3 text-xs">
              Always free. No account needed.
            </p>
          </SiteHero>
        </div>
        <div className="grid gap-12 py-16 sm:grid-cols-2 sm:py-24">
          {page.sections.slice(0, 2).map((section, index) => (
            <section key={section.title}>
              <p className="font-pixel text-secondary mb-4 text-xs">
                0{index + 1}
              </p>
              <h2 className="font-pixel text-3xl tracking-tight normal-case">
                {section.title}
              </h2>
              <p className="text-theme-muted mt-5 text-lg leading-relaxed">
                {section.body}
              </p>
            </section>
          ))}
        </div>
        {children}
        <div className="border-theme bg-theme-surface overflow-hidden rounded-3xl border">
          {page.sections.slice(2).map((section) => (
            <ProductAccordion key={section.title} {...section} />
          ))}
        </div>
      </article>
      <section className="py-20" aria-labelledby="watch-more-heading">
        <h2
          id="watch-more-heading"
          className="font-pixel mb-8 text-3xl normal-case"
        >
          More ways to Watch
        </h2>
        <ProductLinks watch currentSlug={page.slug} />
      </section>
    </SitePage>
  );
}
