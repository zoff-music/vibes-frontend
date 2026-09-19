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
    'Listen together for free with YouTube and SoundCloud. Share a room, vote on songs or generate a playlist with AI. No registration needed.',
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
        'Create free shared rooms with YouTube and SoundCloud, generate playlists with AI, vote on songs and listen together.',
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
