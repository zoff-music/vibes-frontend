import { ArrowRightIcon, LinkButton } from '@vibes/ui/web';
import type { ReactNode } from 'preact/compat';
import { appStoreUrl, playStoreUrl } from '../../seo/metadata';
import type { ProductPage } from '../../seo/productPages';
import { SitePage } from '../layout/SitePage';
import { ProductAccordion } from '../seo/ProductAccordion';
import { ExploreZoff } from './ExploreZoff';
import { GuideLink } from './FeatureSection';

interface ProductPageContentProps {
  page: ProductPage;
  preview: ReactNode;
  children?: ReactNode;
  watch?: boolean;
}

// The shared layout for every Music and Watch guide: what it is, how it
// works, a closer look, common questions, and the rest of Zoff.
export function ProductPageContent({
  page,
  preview,
  children,
  watch = false,
}: ProductPageContentProps) {
  const apps = page.slug === 'apps';

  return (
    <SitePage>
      <article aria-labelledby="page-heading">
        <header className="grid items-center gap-10 pt-12 pb-14 sm:pt-20 sm:pb-20 lg:grid-cols-5 lg:gap-14">
          <div className="min-w-0 lg:col-span-2">
            <h1
              id="page-heading"
              className="font-pixel text-4xl leading-tight tracking-tight normal-case sm:text-5xl"
            >
              {page.heading}
            </h1>
            <p className="text-theme-muted mt-6 max-w-lg leading-relaxed sm:text-lg">
              {page.introduction}
            </p>
            {!apps && (
              <LinkButton
                to={watch ? '/features/watch' : '/rooms/create'}
                prefetch="intent"
                variant="primary"
                className="mt-7 min-h-12 gap-6"
              >
                {page.actionLabel}
                <ArrowRightIcon
                  aria-hidden="true"
                  className="size-4 shrink-0"
                />
              </LinkButton>
            )}
            {apps && (
              <>
                <nav
                  aria-label="Download Zoff"
                  className="mt-7 grid max-w-sm grid-cols-2 gap-3"
                >
                  <a href={appStoreUrl} className={storeLinkClassName}>
                    App Store
                    <ArrowRightIcon
                      aria-hidden="true"
                      className="size-4 shrink-0"
                    />
                  </a>
                  <a href={playStoreUrl} className={storeLinkClassName}>
                    Google Play
                    <ArrowRightIcon
                      aria-hidden="true"
                      className="size-4 shrink-0"
                    />
                  </a>
                </nav>
                <LinkButton
                  to="/rooms/create"
                  prefetch="intent"
                  variant="primary"
                  className="mt-3 min-h-12 gap-6"
                >
                  {page.actionLabel}
                  <ArrowRightIcon
                    aria-hidden="true"
                    className="size-4 shrink-0"
                  />
                </LinkButton>
              </>
            )}
            <p className="text-theme-muted mt-3 text-xs">
              Always free. No account needed.
            </p>
          </div>
          <div className="min-w-0 lg:col-span-3">{preview}</div>
        </header>

        <section
          aria-label="How it works"
          className="border-theme grid gap-8 border-t py-12 sm:grid-cols-2 sm:gap-12 sm:py-16"
        >
          {page.sections.slice(0, 2).map((section) => (
            <div key={section.title}>
              <h2 className="font-pixel text-2xl leading-tight normal-case">
                {section.title}
              </h2>
              <p className="text-theme-muted mt-3 max-w-lg leading-relaxed">
                {section.body}
              </p>
            </div>
          ))}
        </section>

        {children}

        <section
          aria-labelledby="guide-questions-heading"
          className="border-theme grid gap-8 border-t py-16 sm:py-20 lg:grid-cols-5 lg:gap-14"
        >
          <div className="lg:col-span-2">
            <h2
              id="guide-questions-heading"
              className="font-pixel text-3xl tracking-tight normal-case sm:text-4xl"
            >
              Common questions
            </h2>
            <GuideLink to="/faq">All questions</GuideLink>
          </div>
          <div className="border-theme bg-theme-surface min-w-0 overflow-hidden rounded-2xl border lg:col-span-3">
            {page.sections.slice(2).map((section) => (
              <ProductAccordion key={section.title} {...section} />
            ))}
          </div>
        </section>
      </article>
      <ExploreZoff watch={watch} currentSlug={page.slug} />
    </SitePage>
  );
}

const storeLinkClassName =
  'flex min-h-12 items-center justify-between gap-3 rounded-full border border-theme bg-theme-surface px-5 py-3 text-sm text-theme transition-colors hover:border-secondary hover:bg-theme focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary';
