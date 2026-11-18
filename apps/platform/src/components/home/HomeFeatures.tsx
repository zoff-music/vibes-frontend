import { Link } from '@kasperrt/smolter/preact';
import { ArrowRightIcon } from '@vibes/ui/web';
import type { HomeFeature } from '../../seo/pages/home';
import { GuideLink } from '../discovery/FeatureSection';

interface HomeFeaturesProps {
  watch?: boolean;
  features: HomeFeature[];
}

// What a room can do, each card leading to its full guide.
export function HomeFeatures({ watch = false, features }: HomeFeaturesProps) {
  return (
    <section
      id="features"
      aria-labelledby="features-heading"
      className="border-theme scroll-mt-8 border-t py-16 sm:py-20"
    >
      <h2
        id="features-heading"
        className="font-pixel text-3xl tracking-tight normal-case sm:text-4xl"
      >
        {watch ? 'Everything a watch room can do' : 'Everything a room can do'}
      </h2>
      <p className="text-theme-muted mt-4 max-w-2xl leading-relaxed sm:text-lg">
        {watch
          ? 'Zoff is a free way to watch YouTube with friends in sync, from anywhere.'
          : 'Zoff is a free shared music room for friends, parties and online hangouts.'}
      </p>
      <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <li key={feature.title}>
            <Link
              to={feature.to}
              prefetch="intent"
              className="group border-theme bg-theme-surface text-theme hover:border-secondary/60 hover:bg-theme focus-visible:ring-secondary flex h-full flex-col rounded-2xl border p-5 transition-colors focus-visible:ring-2 focus-visible:outline-none"
            >
              <h3 className="font-pixel flex items-center justify-between gap-3 text-base tracking-normal normal-case">
                {feature.title}
                <ArrowRightIcon
                  aria-hidden="true"
                  className="text-theme-muted size-4 shrink-0 transition-transform group-hover:translate-x-1 motion-reduce:transition-none"
                />
              </h3>
              <p className="text-theme-muted mt-2 text-sm leading-relaxed">
                {feature.body}
              </p>
            </Link>
          </li>
        ))}
      </ul>
      <GuideLink to="/faq">Read the FAQ</GuideLink>
    </section>
  );
}
