import type { MetaDescriptor } from 'react-router';
import socialCardUrl from '../assets/social-card.png?url';

export const siteUrl = 'https://zoff.me';
export const appStoreUrl =
  'https://apps.apple.com/app/zoff-shared-music-queue/id6799954460';
export const playStoreUrl =
  'https://play.google.com/store/apps/details?id=me.zoff.mobile';

export function pageMetadata(
  path: string,
  title: string,
  description: string,
): MetaDescriptor[] {
  const url = new URL(path, siteUrl).href;
  const image = new URL(socialCardUrl, siteUrl).href;
  const isHome = path === '/';
  const breadcrumb = {
    '@type': 'BreadcrumbList',
    '@id': `${url}#breadcrumb`,
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Zoff',
        item: `${siteUrl}/`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: title.replace(/\s+\|\s+Zoff$/, ''),
        item: url,
      },
    ],
  };

  return [
    { title },
    { name: 'description', content: description },
    { tagName: 'link', rel: 'canonical', href: url },
    { property: 'og:type', content: 'website' },
    { property: 'og:site_name', content: 'Zoff | Shared Music Queue' },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:url', content: url },
    { property: 'og:image', content: image },
    { property: 'og:image:width', content: '1200' },
    { property: 'og:image:height', content: '630' },
    {
      property: 'og:image:alt',
      content:
        'Zoff. Good music. Better together. One room. Everyone’s soundtrack.',
    },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description },
    { name: 'twitter:image', content: image },
    {
      name: 'twitter:image:alt',
      content:
        'Zoff. Good music. Better together. One room. Everyone’s soundtrack.',
    },
    {
      'script:ld+json': {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'WebSite',
            '@id': `${siteUrl}/#website`,
            url: `${siteUrl}/`,
            name: 'Zoff',
            alternateName: ['Zoff | Shared Music Queue', 'ゾフ'],
            inLanguage: 'en',
            about: { '@id': `${siteUrl}/#app` },
          },
          {
            '@type': 'WebPage',
            '@id': `${url}#webpage`,
            url,
            name: title,
            description,
            inLanguage: 'en',
            isPartOf: { '@id': `${siteUrl}/#website` },
            about: { '@id': `${siteUrl}/#app` },
            ...(isHome && { mainEntity: { '@id': `${siteUrl}/#app` } }),
            ...(!isHome && { breadcrumb: { '@id': breadcrumb['@id'] } }),
          },
          ...(!isHome ? [breadcrumb] : []),
        ],
      },
    },
  ];
}
