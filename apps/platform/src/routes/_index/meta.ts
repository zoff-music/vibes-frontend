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
    'Zoff | Shared Music Queue | Listen to Music Together',
    'Create a free shared music queue with friends. Add YouTube and SoundCloud songs, vote on what plays next and listen together. No account needed.',
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
        'Create a free shared music queue with YouTube and SoundCloud, generate playlists with AI, vote on songs and listen together.',
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
