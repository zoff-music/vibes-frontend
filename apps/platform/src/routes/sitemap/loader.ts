import { siteUrl } from '../../seo/metadata';
import { productPages } from '../../seo/productPages';

export function loader() {
  // Only stable public product pages belong here, never room/session data.
  const paths = [
    '/',
    '/rooms/create',
    '/privacy-policy',
    '/terms-of-service',
    '/security',
    ...productPages.map((page) => `/discover/${page.slug}`),
  ];
  const urls = paths
    .map((path) => `<url><loc>${siteUrl}${path}</loc></url>`)
    .join('\n');
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
    {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      },
    },
  );
}
