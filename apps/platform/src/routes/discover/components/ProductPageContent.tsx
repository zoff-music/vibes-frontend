import { ArrowRightIcon } from '@vibes/ui/web';
import { Link } from 'react-router';
import { SiteHero } from '../../../components/layout/SiteHero';
import { SitePage } from '../../../components/layout/SitePage';
import { GeneratedPlaylistDemo } from '../../../components/seo/GeneratedPlaylistDemo';
import { ProductAccordion } from '../../../components/seo/ProductAccordion';
import { ProductLinks } from '../../../components/seo/ProductLinks';
import { ProductScreenshots } from '../../../components/seo/ProductScreenshots';
import { appStoreUrl, playStoreUrl } from '../../../seo/metadata';
import type { ProductPage } from '../../../seo/productPages';
import { EmbedGuide } from './EmbedGuide';
import { ListeningPreview } from './ListeningPreview';
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
                {page.slug === 'queue' && <GeneratedPlaylistDemo />}
                {page.slug === 'rooms' && <RoomModePreview />}
                {page.slug === 'apps' && <ProductScreenshots />}
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
                AI PLAYLISTS
              </p>
              <h2
                id="playlist-generation-heading"
                className="mt-3 font-pixel text-2xl normal-case tracking-tight"
              >
                Give AI a starting point.
              </h2>
              <p className="mt-3 max-w-2xl text-theme-muted leading-relaxed">
                Try “quiet jazz for a rainy evening” or “2000s indie for a road
                trip”. A mood, a genre or a few artists give the generator more
                to work with than “good music”. Check the songs it finds, then
                keep, remove or add to them with your friends.
              </p>
            </div>
            <div>
              <Link
                to="/?mode=ai"
                className="flex min-h-14 w-full items-center justify-between gap-4 rounded-2xl bg-primary px-5 py-4 font-pixel text-sm text-text-inverse transition-colors hover:bg-primary-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
              >
                Generate a playlist
                <ArrowRightIcon
                  aria-hidden="true"
                  className="h-4 w-4 shrink-0"
                />
              </Link>
            </div>
          </section>
        )}
        <div className="grid gap-12 py-16 sm:grid-cols-2 sm:gap-16 sm:py-24">
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
                {section.points && (
                  <ul className="mt-5 max-w-lg list-disc space-y-3 pl-4 text-sm text-theme-muted leading-relaxed marker:text-secondary">
                    {section.points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                )}
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
