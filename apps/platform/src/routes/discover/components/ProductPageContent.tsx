import { ArrowRightIcon } from '@vibes/ui/web';
import { Link } from 'react-router';
import { SiteHero } from '../../../components/layout/SiteHero';
import { SitePage } from '../../../components/layout/SitePage';
import { ProductAccordion } from '../../../components/seo/ProductAccordion';
import { ProductLinks } from '../../../components/seo/ProductLinks';
import { ProductScreenshots } from '../../../components/seo/ProductScreenshots';
import { appStoreUrl, playStoreUrl } from '../../../seo/metadata';
import type { ProductPage } from '../../../seo/productPages';
import { EmbedGuide } from './EmbedGuide';
import { ListeningPreview } from './ListeningPreview';
import { PlaylistIdeaPreview } from './PlaylistIdeaPreview';
import { RoomModePreview } from './RoomModePreview';

interface ProductPageContentProps {
  page: ProductPage;
}

export function ProductPageContent({ page }: ProductPageContentProps) {
  return (
    <SitePage>
      <article>
        <div className="flex min-h-[calc(100svh-8rem)] flex-col justify-center py-8 sm:py-12">
          <SiteHero
            id="guide-heading"
            eyebrow={page.label.toUpperCase()}
            title={page.heading}
            description={page.introduction}
            aside={
              <>
                {page.slug === 'listening' && <ListeningPreview />}
                {page.slug === 'queue' && <PlaylistIdeaPreview />}
                {page.slug === 'rooms' && <RoomModePreview />}
                {page.slug === 'apps' && <ProductScreenshots kind="apps" />}
              </>
            }
          >
            {page.slug !== 'apps' && (
              <Link
                to="/rooms/create"
                className="mt-7 flex min-h-14 w-full cursor-pointer items-center justify-between gap-4 rounded-2xl bg-primary px-5 py-4 font-pixel text-sm text-text-inverse transition-colors hover:bg-primary-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
              >
                {page.actionLabel}
                <ArrowRightIcon className="h-4 w-4 shrink-0" />
              </Link>
            )}
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
            {page.slug === 'apps' && (
              <Link
                to="/"
                className="mt-3 flex min-h-12 items-center justify-between gap-3 rounded-xl border border-theme bg-theme-surface px-4 py-3 text-sm text-theme-muted transition-colors hover:bg-theme hover:text-theme focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
              >
                {page.actionLabel}
                <ArrowRightIcon className="h-4 w-4 shrink-0" />
              </Link>
            )}
            <p className="mt-3 text-theme-muted text-xs">
              Free to use. No account needed.
            </p>
          </SiteHero>
        </div>
        {page.slug === 'queue' && (
          <section
            aria-labelledby="playlist-generation-heading"
            className="panel-surface my-12 grid items-center gap-8 rounded-frame border border-theme p-6 sm:my-20 sm:p-10 lg:grid-cols-3 lg:gap-12 lg:p-12"
          >
            <div className="lg:col-span-2">
              <p className="font-pixel text-2xs text-primary tracking-label">
                PLAYLIST IDEAS
              </p>
              <h2
                id="playlist-generation-heading"
                className="mt-3 font-pixel text-2xl normal-case tracking-tight"
              >
                Need a few songs to start?
              </h2>
              <p className="mt-3 max-w-2xl text-theme-muted leading-relaxed">
                Try “jazz after midnight” or name a genre you like. Zoff’s AI
                playlist generator finds tracks and starts a room. Keep what you
                like, remove what you don’t, and add your own picks.
              </p>
            </div>
            <div>
              <Link
                to="/?mode=ai"
                className="flex min-h-14 w-full items-center justify-between gap-4 rounded-2xl bg-primary px-5 py-4 font-pixel text-sm text-text-inverse transition-colors hover:bg-primary-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
              >
                Try playlist generation
                <ArrowRightIcon
                  aria-hidden="true"
                  className="h-4 w-4 shrink-0"
                />
              </Link>
              <p className="mt-3 text-theme-subtle text-xs leading-relaxed">
                You can edit the queue after it’s generated.
              </p>
            </div>
          </section>
        )}
        <div className="grid min-h-[60svh] content-center gap-12 py-20 sm:grid-cols-2 sm:gap-16 sm:py-28">
          {page.sections.slice(0, 2).map((section, index) => (
            <section key={section.title} className="flex gap-4">
              <span
                aria-hidden="true"
                className="pt-1 font-pixel text-secondary text-sm"
              >
                0{index + 1}
              </span>
              <div>
                <h2 className="font-pixel text-2xl normal-case tracking-normal sm:text-3xl">
                  {section.title}
                </h2>
                <p className="mt-5 max-w-lg text-theme-muted leading-relaxed sm:text-lg">
                  {section.body}
                </p>
              </div>
            </section>
          ))}
        </div>
        {page.slug === 'rooms' && <EmbedGuide />}
        <section
          aria-label="More about this setup"
          className="product-accordion isolate my-8 overflow-hidden rounded-frame border border-theme bg-theme-surface shadow-sm sm:my-12"
        >
          {page.sections.slice(2).map((section) => (
            <ProductAccordion key={section.title} {...section} />
          ))}
        </section>
      </article>
      <section
        id="explore-zoff"
        aria-labelledby="keep-exploring-heading"
        className="relative isolate flex min-h-[60svh] scroll-mt-8 flex-col justify-center py-20 sm:py-28"
      >
        <h2
          id="keep-exploring-heading"
          className="mb-8 font-pixel text-3xl normal-case tracking-tight sm:text-4xl"
        >
          Explore Zoff
        </h2>
        <ProductLinks currentSlug={page.slug} />
      </section>
    </SitePage>
  );
}

const storeLinkClassName =
  'flex min-h-12 w-full cursor-pointer items-center justify-between gap-3 rounded-xl border border-theme bg-theme-surface px-4 py-3 text-sm text-theme transition-colors hover:border-secondary/60 hover:bg-theme focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary';
