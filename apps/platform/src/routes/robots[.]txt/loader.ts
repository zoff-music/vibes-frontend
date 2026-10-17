import { siteUrl } from '../../seo/metadata';

export function loader() {
  return new Response(
    [
      'User-agent: *',
      'Allow: /',
      'Disallow: /api/',
      'Disallow: /admin',
      'Disallow: /callback',
      'Disallow: /resources/',
      'Disallow: /remote-control',
      'Disallow: /remote/',
      'Disallow: /cast/',
      'Disallow: /embed/',
      `Sitemap: ${siteUrl}/sitemap.xml`,
      '',
    ].join('\n'),
    {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      },
    },
  );
}
