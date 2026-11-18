import { ProductLinks } from '../seo/ProductLinks';

interface ExploreZoffProps {
  watch?: boolean;
  currentSlug?: string;
}

export function ExploreZoff({ watch = false, currentSlug }: ExploreZoffProps) {
  return (
    <section
      id="explore-zoff"
      aria-labelledby="explore-zoff-heading"
      className="border-theme scroll-mt-8 border-t py-16 sm:py-20"
    >
      <h2
        id="explore-zoff-heading"
        className="font-pixel text-3xl tracking-tight normal-case sm:text-4xl"
      >
        {watch ? 'More ways to watch' : 'More ways to listen'}
      </h2>
      <p className="text-theme-muted mt-4 mb-8 max-w-2xl leading-relaxed">
        {watch
          ? 'Guides to free YouTube watch rooms: syncing, watch parties and shared video queues.'
          : 'Guides to free music rooms: listening in sync, the shared queue, room settings and apps.'}
      </p>
      <ProductLinks watch={watch} {...(currentSlug && { currentSlug })} />
    </section>
  );
}
