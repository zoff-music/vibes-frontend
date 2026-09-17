import { ArrowRightIcon } from '@vibes/ui/web';
import { Link } from 'react-router';
import { SiteHero } from '../../../components/layout/SiteHero';
import { SitePage } from '../../../components/layout/SitePage';
import { ProductAccordion } from '../../../components/seo/ProductAccordion';
import { ProductLinks } from '../../../components/seo/ProductLinks';
import { ProductScreenshots } from '../../../components/seo/ProductScreenshots';
import { appStoreUrl, playStoreUrl } from '../../../seo/metadata';
import type { ProductPage } from '../../../seo/productPages';
import { ListeningPreview } from './ListeningPreview';
import { PartyPreview } from './PartyPreview';
import { PlaylistIdeaPreview } from './PlaylistIdeaPreview';
import { RoomModePreview } from './RoomModePreview';

interface ProductPageContentProps {
  page: ProductPage;
}

export function ProductPageContent({ page }: ProductPageContentProps) {
  return (
    <SitePage>
      <article>
        <SiteHero
          id="guide-heading"
          eyebrow={page.label.toUpperCase()}
          title={page.heading}
          description={page.introduction}
          aside={
            <>
              {page.slug === 'listen-together' && <ListeningPreview />}
              {page.slug === 'shared-music-queue' && <PlaylistIdeaPreview />}
              {page.slug === 'party-music' && <PartyPreview />}
              {page.slug === 'music-room' && <RoomModePreview />}
              {page.slug === 'tv' && <ProductScreenshots />}
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
              className="mt-3 flex min-h-12 items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm text-theme-muted transition-colors hover:bg-theme-surface hover:text-theme focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
            >
              {page.actionLabel}
              <ArrowRightIcon className="h-4 w-4 shrink-0" />
            </Link>
          )}
          <p className="mt-3 text-theme-muted text-xs">
            Always free. No Zoff account, ever.
          </p>
        </SiteHero>
        {page.slug === 'shared-music-queue' && (
          <section
            aria-labelledby="playlist-generation-heading"
            className="panel-surface mt-10 grid items-center gap-6 rounded-frame border border-theme p-6 sm:mt-16 sm:p-8 lg:grid-cols-3 lg:p-10"
          >
            <div className="lg:col-span-2">
              <p className="font-pixel text-2xs text-primary tracking-label">
                LESS BLANK QUEUE. MORE MUSIC.
              </p>
              <h2
                id="playlist-generation-heading"
                className="mt-3 font-pixel text-2xl normal-case tracking-tight"
              >
                Have a mood, not a track list?
              </h2>
              <p className="mt-3 max-w-2xl text-theme-muted leading-relaxed">
                Describe a genre, an occasion or the energy you want. Zoff’s AI
                playlist generator uses your idea to find music from the enabled
                providers and start a room. It is a starting point, not a locked
                playlist: add your favorites and let your friends shape what
                comes next.
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
                Suggestions can miss the mark. You stay in control of the queue.
              </p>
            </div>
          </section>
        )}
        <div className="grid gap-6 py-10 sm:grid-cols-2 sm:gap-8 sm:py-16">
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
          className="product-accordion isolate overflow-hidden rounded-frame border border-theme bg-theme-surface shadow-sm"
        >
          {page.sections.slice(2).map((section) => (
            <ProductAccordion key={section.title} {...section} />
          ))}
        </section>
      </article>
      <section
        id="explore-zoff"
        aria-labelledby="keep-exploring-heading"
        className="relative isolate scroll-mt-6 pt-12"
      >
        <h2
          id="keep-exploring-heading"
          className="mb-5 font-pixel text-2xl normal-case tracking-tight"
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
