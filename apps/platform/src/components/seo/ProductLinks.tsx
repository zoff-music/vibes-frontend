import { classNames } from '@vibes/shared';
import { ArrowRightIcon, CheckIcon } from '@vibes/ui/web';
import { Link } from 'react-router';
import { productNavigation } from '../../seo/productNavigation';

interface ProductLinksProps {
  currentSlug?: string;
}

export function ProductLinks({ currentSlug }: ProductLinksProps) {
  return (
    <nav aria-label="Zoff guides" className="grid gap-3 sm:grid-cols-2">
      {productNavigation.map((page) => (
        <Link
          key={page.slug}
          to={`/discovery/${page.slug}`}
          {...(currentSlug === page.slug && { 'aria-current': 'page' })}
          className={classNames(
            'group flex min-h-20 cursor-pointer items-center justify-between gap-4 rounded-2xl border bg-theme-surface p-4 text-theme transition-colors hover:border-secondary/60 hover:bg-theme focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary',
            currentSlug === page.slug
              ? 'border-secondary/60 ring-1 ring-secondary/20'
              : 'border-theme',
          )}
        >
          <span>
            <span className="block font-pixel text-sm">{page.label}</span>
            <span className="mt-1 block text-theme-muted text-xs">
              {page.caption}
            </span>
          </span>
          {currentSlug === page.slug && (
            <CheckIcon
              aria-hidden="true"
              className="h-4 w-4 shrink-0 text-secondary"
            />
          )}
          {currentSlug !== page.slug && (
            <ArrowRightIcon
              aria-hidden="true"
              className="h-4 w-4 shrink-0 text-theme-muted transition-transform group-hover:translate-x-1"
            />
          )}
        </Link>
      ))}
    </nav>
  );
}
