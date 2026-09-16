import { Link } from 'react-router';
import { productPages } from '../../seo/productPages';

export function ProductLinks() {
  return (
    <nav
      aria-label="Explore Zoff"
      className="flex flex-wrap gap-x-5 gap-y-3 text-sm"
    >
      {productPages.map((page) => (
        <Link
          key={page.slug}
          to={`/discover/${page.slug}`}
          className="rounded text-theme-muted underline decoration-current/30 underline-offset-4 hover:text-theme focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
        >
          {page.label}
        </Link>
      ))}
    </nav>
  );
}
