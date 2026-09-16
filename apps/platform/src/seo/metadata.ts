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

  return [
    { title },
    { name: 'description', content: description },
    { tagName: 'link', rel: 'canonical', href: url },
    { property: 'og:type', content: 'website' },
    { property: 'og:site_name', content: 'Zoff — Shared Music Queue' },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:url', content: url },
    { property: 'og:image', content: image },
    { property: 'og:image:width', content: '1200' },
    { property: 'og:image:height', content: '630' },
    {
      property: 'og:image:alt',
      content: 'Zoff — Listen together. One shared music queue.',
    },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description },
    { name: 'twitter:image', content: image },
    {
      name: 'twitter:image:alt',
      content: 'Zoff — Listen together. One shared music queue.',
    },
  ];
}
