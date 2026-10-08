import { ArrowRightIcon } from '@vibes/ui/web';
import { Link } from 'react-router';
import { SitePage } from '../../../components/layout/SitePage';
import { ProductAccordion } from '../../../components/seo/ProductAccordion';
import { ProductLinks } from '../../../components/seo/ProductLinks';
import { ProductScreenshots } from '../../../components/seo/ProductScreenshots';
import { appStoreUrl, playStoreUrl } from '../../../seo/metadata';
import { watchNavigation } from '../../../seo/productNavigation';
import type { ProductPage } from '../../../seo/productPages';
import { GeneratedPlaylistSection } from '../../_index/components/GeneratedPlaylistSection';
import { RemotePreview } from '../../_index/components/RemotePreview';
import { RoomControlPanel } from '../../_index/components/RoomControlPanel';
import { VotingPreview } from '../../_index/components/VotingPreview';
import { ChatGuide } from './ChatGuide';
import { EmbedGuide } from './EmbedGuide';
import { ListeningPreview } from './ListeningPreview';
import { RoomModePreview } from './RoomModePreview';
import { WatchPage } from './WatchPage';

interface ProductPageContentProps {
  page: ProductPage;
}

export function ProductPageContent({ page }: ProductPageContentProps) {
  if (watchNavigation.some((candidate) => candidate.slug === page.slug)) {
    return <WatchPage page={page} />;
  }

  return (
    <SitePage>
      <article>
        <header className="grid items-center gap-10 pt-12 pb-14 sm:pt-20 sm:pb-20 lg:grid-cols-5 lg:gap-14">
          <div className="min-w-0 lg:col-span-2">
            <p className="mb-5 font-pixel text-pink-800 text-xs tracking-label dark:text-primary">
              {page.label.toUpperCase()}
            </p>
            <h1 className="font-pixel text-4xl normal-case leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              {page.heading}
              <span className="mt-1 block text-pink-800 dark:text-primary">
                {page.accent}
              </span>
            </h1>
            <p className="mt-6 max-w-lg text-theme-muted leading-relaxed sm:text-lg">
              {page.introduction}
            </p>
            {page.slug !== 'apps' && (
              <Link
                to="/rooms/create"
                prefetch="intent"
                className="mt-7 inline-flex min-h-13 items-center justify-between gap-8 rounded-2xl bg-primary px-5 py-3 text-sm text-text-inverse transition-colors hover:bg-primary-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
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
                  className="mt-4 inline-flex min-h-11 items-center gap-3 rounded-lg text-cyan-800 text-sm underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary dark:text-secondary"
                >
                  {page.actionLabel}
                  <ArrowRightIcon aria-hidden="true" className="size-4" />
                </Link>
              </>
            )}
            <p className="mt-3 text-theme-muted text-xs">
              Always free. No account needed.
            </p>
          </div>
          <div className="min-w-0 lg:col-span-3">
            {page.slug === 'listening' && <ListeningPreview />}
            {page.slug === 'queue' && <VotingPreview />}
            {page.slug === 'rooms' && <RoomControlPanel />}
            {page.slug === 'apps' && <ProductScreenshots />}
          </div>
        </header>
        <div className="grid gap-8 border-theme border-y py-10 sm:grid-cols-2 sm:gap-12 sm:py-12">
          {page.sections.slice(0, 2).map((section, index) => (
            <section key={section.title}>
              <span
                aria-hidden="true"
                className="font-pixel text-cyan-800 text-xs dark:text-secondary"
              >
                0{index + 1}
              </span>
              <h2 className="mt-3 font-pixel text-2xl normal-case leading-tight sm:text-3xl">
                {section.title}
              </h2>
              <p className="mt-4 max-w-lg text-theme-muted leading-relaxed">
                {section.body}
              </p>
            </section>
          ))}
        </div>
        {page.slug === 'listening' && <ChatGuide />}
        {page.slug === 'queue' && <GeneratedPlaylistSection />}
        {page.slug === 'rooms' && (
          <>
            <section
              aria-labelledby="room-playback-heading"
              className="grid items-center gap-10 py-16 sm:py-24 lg:grid-cols-5 lg:gap-14"
            >
              <div className="lg:col-span-2">
                <p className="font-pixel text-cyan-800 text-xs tracking-label dark:text-secondary">
                  WHO’S AT THE CONTROLS?
                </p>
                <h2
                  id="room-playback-heading"
                  className="mt-4 font-pixel text-4xl normal-case leading-tight tracking-tight sm:text-5xl"
                >
                  Let it play.
                  <br />
                  Or take the lead.
                </h2>
                <p className="mt-5 text-theme-muted leading-relaxed">
                  Server Mode keeps the queue moving as people come and go. Host
                  Mode follows one person’s player.
                </p>
              </div>
              <div className="min-w-0 lg:col-span-3">
                <RoomModePreview />
              </div>
            </section>
            <EmbedGuide />
          </>
        )}
        {page.slug === 'apps' && <RemotePreview showAppsLink={false} />}
        <section
          aria-labelledby="guide-questions-heading"
          className="grid gap-7 border-theme border-t py-14 sm:py-20 lg:grid-cols-5 lg:gap-14"
        >
          <div className="lg:col-span-2">
            <p className="font-pixel text-cyan-800 text-xs tracking-label dark:text-secondary">
              THE LITTLE DETAILS
            </p>
            <h2
              id="guide-questions-heading"
              className="mt-4 font-pixel text-3xl normal-case tracking-tight"
            >
              Good to know.
            </h2>
          </div>
          <div className="product-accordion min-w-0 overflow-hidden rounded-2xl border border-theme bg-theme-surface lg:col-span-3">
            {page.sections.slice(2).map((section) => (
              <ProductAccordion key={section.title} {...section} />
            ))}
          </div>
        </section>
      </article>
      <section
        id="explore-zoff"
        aria-labelledby="keep-exploring-heading"
        className="scroll-mt-8 border-theme border-t py-14 sm:py-20"
      >
        <h2
          id="keep-exploring-heading"
          className="mb-7 font-pixel text-3xl normal-case tracking-tight"
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
