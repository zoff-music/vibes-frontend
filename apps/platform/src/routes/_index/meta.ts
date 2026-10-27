import type { MetaFunction } from '@kasperrt/smolter/preact';
import { publicAssetUrl } from '@vibes/ui/web';
import {
  appStoreUrl,
  pageMetadata,
  playStoreUrl,
  siteUrl,
} from '../../seo/metadata';

export const meta: MetaFunction = ({ params }) => {
  const watch = params.experience === 'watch';
  const metadata = watch
    ? pageMetadata(
        '/features/watch',
        'Watch YouTube Together with Friends | Free Watch Party | Zoff',
        'Watch YouTube together in sync with friends. Start a free watch party, share your room link, add videos and chat. No account or browser extension needed.',
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
        image: new URL(publicAssetUrl('logo.png'), siteUrl).href,
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
