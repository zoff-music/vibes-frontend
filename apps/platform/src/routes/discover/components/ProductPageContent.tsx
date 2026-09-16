import { Link } from 'react-router';
import { SiteFooter } from '../../../components/legal/SiteFooter';
import { ProductLinks } from '../../../components/seo/ProductLinks';
import { appStoreUrl, playStoreUrl } from '../../../seo/metadata';
import type { ProductPage } from '../../../seo/productPages';

interface ProductPageContentProps {
  page: ProductPage;
}

export function ProductPageContent({ page }: ProductPageContentProps) {
  return (
    <div className="product-content relative z-10 flex min-h-dvh flex-col items-center text-theme">
      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-8 sm:py-12">
        <Link
          to="/"
          className="inline-flex min-h-11 items-center rounded font-pixel text-sm text-theme-muted hover:text-theme focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
        >
          Zoff / Shared music rooms
        </Link>
        <article className="panel-surface mt-5 rounded-3xl border border-theme p-6 sm:p-10">
          <h1 className="font-pixel text-2xl leading-tight sm:text-3xl">
            {page.heading}
          </h1>
          <p className="mt-5 text-theme-muted leading-relaxed">
            {page.introduction}
          </p>
          <Link
            to="/rooms/create"
            className="mt-6 inline-flex min-h-12 items-center justify-center rounded-2xl border border-theme bg-theme-surface px-6 py-3 font-pixel text-sm text-theme hover:bg-theme focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
          >
            Create a music room
          </Link>
          <div className="mt-8 space-y-8 border-theme border-t pt-8">
            {page.sections.map((section) => (
              <section key={section.title}>
                <h2 className="font-pixel text-lg">{section.title}</h2>
                <p className="mt-3 text-theme-muted leading-relaxed">
                  {section.body}
                </p>
              </section>
            ))}
          </div>
          {page.slug === 'apps' && (
            <nav
              aria-label="Download Zoff"
              className="mt-8 flex flex-wrap gap-4"
            >
              <a
                href={appStoreUrl}
                className="inline-flex min-h-12 items-center rounded-2xl border border-theme px-5 py-3 text-theme underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
              >
                Download on the App Store
              </a>
              <a
                href={playStoreUrl}
                className="inline-flex min-h-12 items-center rounded-2xl border border-theme px-5 py-3 text-theme underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
              >
                Get it on Google Play
              </a>
            </nav>
          )}
        </article>
        <div className="px-1 pt-8">
          <ProductLinks />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
