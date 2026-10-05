import { ArrowRightIcon } from '@vibes/ui/web';
import { Link } from 'react-router';
import { SiteHero } from '../../../components/layout/SiteHero';
import { SitePage } from '../../../components/layout/SitePage';
import { GeneratedPlaylistDemo } from '../../../components/seo/GeneratedPlaylistDemo';
import { ProductAccordion } from '../../../components/seo/ProductAccordion';
import { ProductLinks } from '../../../components/seo/ProductLinks';
import { WatchScene } from '../../../components/seo/WatchScene';
import type { ProductPage } from '../../../seo/productPages';
import { ChatPreview } from './ChatPreview';

interface WatchPageProps {
  page: ProductPage;
}

export function WatchPage({ page }: WatchPageProps) {
  return (
    <SitePage>
      <article>
        <div className="py-8 sm:py-12">
          <SiteHero
            id="watch-guide-heading"
            eyebrow={`${page.label.toUpperCase()} / DESIGN PREVIEW`}
            title={page.heading}
            description={page.introduction}
            aside={
              <>
                {page.slug === 'watch-together' && <WatchScene compact />}
                {page.slug === 'watch-party' && <ChatPreview watch />}
                {page.slug === 'watch-queue' && <GeneratedPlaylistDemo watch />}
              </>
            }
          >
            <Link
              to="/?type=watch"
              className="mt-6 inline-flex min-h-12 items-center gap-4 rounded-xl bg-primary px-5 text-text-inverse hover:bg-primary-muted focus-visible:ring-2 focus-visible:ring-secondary"
            >
              {page.actionLabel}
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
            <p className="mt-3 text-theme-muted text-xs">
              A look at what comes next. No live Watch rooms are created.
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
        {page.slug === 'watch-together' && (
          <div className="mx-auto max-w-xl py-8">
            <ChatPreview watch />
          </div>
        )}
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
