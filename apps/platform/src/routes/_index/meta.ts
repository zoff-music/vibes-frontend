import type { MetaFunction } from 'react-router';
import {
  appStoreUrl,
  pageMetadata,
  playStoreUrl,
  siteUrl,
} from '../../seo/metadata';

export const meta: MetaFunction = ({ location }) => {
  const watch = location.pathname === '/features/watch';
  const metadata = watch
    ? pageMetadata(
        '/features/watch',
        'Watch Together | Shared Video Rooms | Zoff',
        'Watch together in a free shared video room. Build a YouTube queue, vote on videos and chat with friends. No account needed.',
      )
    : pageMetadata(
        '/',
        'Zoff | Shared Music Queue | Listen to Music Together',
        'Create a free shared music queue with friends. Add YouTube and SoundCloud songs, vote on what plays next and listen together. No account needed.',
      );

  return [
    ...metadata,
    {
      'script:ld+json': {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        '@id': `${siteUrl}/#app`,
        name: 'Zoff',
        alternateName: [
          'Zoff | Shared Music Queue',
          'Zoff | Watch Together',
          'ゾフ',
        ],
        applicationCategory: 'MultimediaApplication',
        operatingSystem: 'Web, Android, iOS, Android TV',
        description:
          'Listen to music together with YouTube and SoundCloud, or watch YouTube videos together. Create free shared rooms, generate playlists with AI, vote and chat.',
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
};
