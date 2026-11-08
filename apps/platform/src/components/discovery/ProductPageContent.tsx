import { Link } from '@kasperrt/smolter/preact';
import { ArrowRightIcon } from '@vibes/ui/web';
import type { ReactNode } from 'preact/compat';
import { appStoreUrl, playStoreUrl } from '../../seo/metadata';
import type { ProductPage } from '../../seo/productPages';
import { SitePage } from '../layout/SitePage';
import { ProductAccordion } from '../seo/ProductAccordion';
import { ProductLinks } from '../seo/ProductLinks';

interface ProductPageContentProps {
  page: ProductPage;
  preview: ReactNode;
  children: ReactNode;
}

export function ProductPageContent({
  page,
  preview,
  children,
}: ProductPageContentProps) {
  return (
    <SitePage>
      <article>
        <header className="grid items-center gap-10 pt-12 pb-14 sm:pt-20 sm:pb-20 lg:grid-cols-5 lg:gap-14">
          <div className="min-w-0 lg:col-span-2">
            <p className="font-pixel tracking-label dark:text-primary mb-5 text-xs text-pink-800">
              {page.label.toUpperCase()}
            </p>
            <h1 className="font-pixel text-4xl leading-tight tracking-tight normal-case sm:text-5xl lg:text-6xl">
              {page.heading}
              <span className="dark:text-primary mt-1 block text-pink-800">
                {page.accent}
              </span>
            </h1>
            <p className="text-theme-muted mt-6 max-w-lg leading-relaxed sm:text-lg">
              {page.introduction}
            </p>
            {page.slug !== 'apps' && (
              <Link
                to="/rooms/create"
                prefetch="intent"
                className="bg-primary text-text-inverse hover:bg-primary-muted focus-visible:ring-secondary mt-7 inline-flex min-h-13 items-center justify-between gap-8 rounded-2xl px-5 py-3 text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
              >
                {page.actionLabel}
                <ArrowRightIcon
                  aria-hidden="true"
                  className="size-4 shrink-0"
                />
              </Link>
            )}
            {page.slug === 'apps' && (
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
                <Link
                  to="/"
                  prefetch="intent"
                  className="focus-visible:ring-secondary dark:text-secondary mt-4 inline-flex min-h-11 items-center gap-3 rounded-lg text-sm text-cyan-800 underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:outline-none"
                >
                  {page.actionLabel}
                  <ArrowRightIcon aria-hidden="true" className="size-4" />
                </Link>
              </>
            )}
            <p className="text-theme-muted mt-3 text-xs">
              Always free. No account needed.
            </p>
          </div>
          <div className="min-w-0 lg:col-span-3">{preview}</div>
        </header>
        <div className="border-theme grid gap-8 border-y py-10 sm:grid-cols-2 sm:gap-12 sm:py-12">
          {page.sections.slice(0, 2).map((section, index) => (
            <section key={section.title}>
              <span
                aria-hidden="true"
                className="font-pixel dark:text-secondary text-xs text-cyan-800"
              >
                0{index + 1}
              </span>
              <h2 className="font-pixel mt-3 text-2xl leading-tight normal-case sm:text-3xl">
                {section.title}
              </h2>
              <p className="text-theme-muted mt-4 max-w-lg leading-relaxed">
                {section.body}
              </p>
            </section>
          ))}
        </div>
        {children}
        <section
          aria-labelledby="guide-questions-heading"
          className="border-theme grid gap-7 border-t py-14 sm:py-20 lg:grid-cols-5 lg:gap-14"
        >
          <div className="lg:col-span-2">
            <p className="font-pixel tracking-label dark:text-secondary text-xs text-cyan-800">
              THE LITTLE DETAILS
            </p>
            <h2
              id="guide-questions-heading"
              className="font-pixel mt-4 text-3xl tracking-tight normal-case"
            >
              Good to know.
            </h2>
          </div>
          <div className="product-accordion border-theme bg-theme-surface min-w-0 overflow-hidden rounded-2xl border lg:col-span-3">
            {page.sections.slice(2).map((section) => (
              <ProductAccordion key={section.title} {...section} />
            ))}
          </div>
        </section>
      </article>
      <section
        id="explore-zoff"
        aria-labelledby="keep-exploring-heading"
        className="border-theme scroll-mt-8 border-t py-14 sm:py-20"
      >
        <h2
          id="keep-exploring-heading"
          className="font-pixel mb-7 text-3xl tracking-tight normal-case"
        >
          Make yourself at home.
        </h2>
        <ProductLinks currentSlug={page.slug} />
      </section>
    </SitePage>
  );
}

const storeLinkClassName =
  'flex min-h-13 items-center justify-between gap-3 rounded-2xl border border-theme bg-theme-surface px-4 py-3 text-sm text-theme transition-colors hover:border-secondary hover:bg-theme focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary';
