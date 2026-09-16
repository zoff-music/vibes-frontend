import { ArrowRightIcon } from '@vibes/ui/web';
import { Link } from 'react-router';
import { ProductLinks } from '../../../components/seo/ProductLinks';
import { ProductScreenshots } from '../../../components/seo/ProductScreenshots';
import { SiteHeader } from '../../../components/seo/SiteHeader';
import { appStoreUrl, playStoreUrl } from '../../../seo/metadata';
import type { ProductPage } from '../../../seo/productPages';

interface ProductPageContentProps {
  page: ProductPage;
}

export function ProductPageContent({ page }: ProductPageContentProps) {
  const showApps = page.slug === 'apps' || page.slug === 'listen-together';
  return (
    <div className="product-content relative z-10 text-theme">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl px-5 pb-8 sm:px-6">
        <article>
          <header className="grid items-center gap-8 pt-6 pb-10 sm:pt-10 sm:pb-14 lg:grid-cols-2 lg:gap-12">
            <div>
              <p className="font-pixel text-2xs text-primary tracking-label">
                ZOFF / {page.label.toUpperCase()}
              </p>
              <h1 className="mt-5 font-pixel text-4xl normal-case leading-tight tracking-tight sm:text-5xl">
                {page.heading}
              </h1>
              <p className="mt-5 max-w-lg text-lg text-theme-muted leading-relaxed">
                {page.introduction}
              </p>
              <Link
                to="/rooms/create"
                className="mt-7 flex min-h-14 w-full cursor-pointer items-center justify-between gap-4 rounded-2xl bg-primary px-5 py-4 font-pixel text-sm text-text-inverse transition-colors hover:bg-primary-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
              >
                Create a music room{' '}
                <ArrowRightIcon className="h-4 w-4 shrink-0" />
              </Link>
              <p className="mt-3 text-theme-muted text-xs">
                Free to start. No Zoff account needed.
              </p>
              {page.slug === 'apps' && (
                <nav
                  aria-label="Download Zoff"
                  className="mt-6 grid gap-2 sm:grid-cols-2"
                >
                  <a href={appStoreUrl} className={storeLinkClassName}>
                    App Store <ArrowRightIcon className="h-4 w-4 shrink-0" />
                  </a>
                  <a href={playStoreUrl} className={storeLinkClassName}>
                    Google Play <ArrowRightIcon className="h-4 w-4 shrink-0" />
                  </a>
                </nav>
              )}
            </div>
            <div className="min-w-0">
              <ProductScreenshots kind={showApps ? 'apps' : 'room'} />
            </div>
          </header>
          <div className="grid gap-6 border-theme border-t py-8 sm:grid-cols-2 sm:gap-10 sm:py-10">
            {page.sections.slice(0, 2).map((section, index) => (
              <section key={section.title} className="flex gap-4">
                <span
                  aria-hidden="true"
                  className="pt-1 font-pixel text-secondary text-sm"
                >
                  0{index + 1}
                </span>
                <div>
                  <h2 className="font-pixel text-xl normal-case tracking-normal">
                    {section.title}
                  </h2>
                  <p className="mt-3 text-theme-muted leading-relaxed">
                    {section.body}
                  </p>
                </div>
              </section>
            ))}
          </div>
          <section
            aria-label="More about this setup"
            className="panel-surface overflow-hidden rounded-3xl border border-theme"
          >
            {page.sections.slice(2).map((section) => (
              <details
                key={section.title}
                className="group border-theme border-b last:border-b-0"
              >
                <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 px-5 py-5 font-pixel text-base text-theme transition-colors hover:bg-theme-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary sm:px-7">
                  {section.title}
                  <span
                    aria-hidden="true"
                    className="shrink-0 text-secondary transition-transform group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="max-w-3xl px-5 pb-6 text-sm text-theme-muted leading-relaxed sm:px-7">
                  {section.body}
                </p>
              </details>
            ))}
          </section>
        </article>
        <section aria-labelledby="keep-exploring-heading" className="pt-12">
          <h2
            id="keep-exploring-heading"
            className="mb-5 font-pixel text-2xl normal-case tracking-tight"
          >
            Find your kind of together.
          </h2>
          <ProductLinks />
        </section>
      </main>
    </div>
  );
}

const storeLinkClassName =
  'flex min-h-12 w-full cursor-pointer items-center justify-between gap-3 rounded-xl border border-theme bg-theme-surface px-4 py-3 text-sm text-theme transition-colors hover:border-secondary/60 hover:bg-theme focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary';
