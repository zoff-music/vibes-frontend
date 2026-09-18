import type { MetaFunction } from 'react-router';
import {
  appStoreUrl,
  pageMetadata,
  playStoreUrl,
  siteUrl,
} from '../../seo/metadata';

export const meta: MetaFunction = () => [
  ...pageMetadata(
    '/',
    'Zoff | Listen to Music Together | Shared Rooms',
    'Listen to music together with Zoff. Create a free shared room, build a collaborative queue, vote on songs and sync playback. No account required.',
  ),
  {
    'script:ld+json': {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      '@id': `${siteUrl}/#app`,
      name: 'Zoff | Shared Music Queue',
      alternateName: ['Zoff', 'ゾフ'],
      applicationCategory: 'MultimediaApplication',
      operatingSystem: 'Web, Android, iOS, Android TV',
      description:
        'Create shared rooms, listen together, build collaborative queues and vote on what plays next.',
      url: siteUrl,
      mainEntityOfPage: { '@id': `${siteUrl}/#webpage` },
      isAccessibleForFree: true,
      image: `${siteUrl}/logo.png`,
      sameAs: [appStoreUrl, playStoreUrl, 'https://github.com/zoff-music'],
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
    },
  },
];
