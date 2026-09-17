import { classNames } from '@vibes/shared';
import { ArrowRightIcon } from '@vibes/ui/web';
import { Link } from 'react-router';
import { productNavigation } from '../../seo/productNavigation';

interface ProductLinksProps {
  slugs?: readonly string[];
}

export function ProductLinks({ slugs }: ProductLinksProps) {
  const pages = productNavigation.filter(
    (page) => !slugs || slugs.includes(page.slug),
  );
  return (
    <nav
      aria-label="Explore Zoff"
      className={classNames(
        'grid gap-2 sm:grid-cols-2',
        pages.length > 2 && 'lg:grid-cols-3',
      )}
    >
      {pages.map((page) => (
        <Link
          key={page.slug}
          to={`/discover/${page.slug}`}
          className="group flex min-h-20 cursor-pointer items-center justify-between gap-4 rounded-2xl border border-theme bg-theme-surface p-4 text-theme transition-colors hover:border-secondary/60 hover:bg-theme focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
        >
          <span>
            <span className="block font-pixel text-sm">{page.label}</span>
            <span className="mt-1 block text-theme-muted text-xs">
              {page.caption}
            </span>
          </span>
          <ArrowRightIcon
            aria-hidden="true"
            className="h-4 w-4 shrink-0 text-theme-muted transition-transform group-hover:translate-x-1"
          />
        </Link>
      ))}
    </nav>
  );
}
