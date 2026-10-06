import type { MetaFunction } from 'react-router';
import type { loader } from './loader';
import { createRoomShareDescription, createRoomShareTitle } from './share';

export const roomMeta: MetaFunction<typeof loader> = ({ loaderData }) => {
  if (!loaderData) {
    return [
      { title: 'Shared Room | Zoff' },
      { name: 'robots', content: 'noindex, follow' },
    ];
  }

  const currentPlaylistItem = loaderData.playback?.currentPlaylistItem ?? null;
  const listenerCount = loaderData.room.userCount ?? 0;
  const title = createRoomShareTitle(loaderData.room.name, currentPlaylistItem);
  const description = createRoomShareDescription(
    loaderData.room.name,
    currentPlaylistItem,
    listenerCount,
    loaderData.room.roomType,
  );
  const imageUrl =
    currentPlaylistItem?.thumbnailUrl ||
    new URL('/logo.png', loaderData.pageUrl).toString();
  const imageAlt = currentPlaylistItem
    ? `${currentPlaylistItem.title} artwork`
    : 'Zoff shared rooms';

  return [
    { title },
    { name: 'robots', content: 'noindex, follow' },
    {
      tagName: 'link',
      rel: 'canonical',
      href: `https://zoff.me/${encodeURIComponent(loaderData.room.id)}`,
    },
    { name: 'description', content: description },
    { property: 'og:type', content: 'website' },
    { property: 'og:site_name', content: 'Zoff' },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:url', content: loaderData.pageUrl },
    { property: 'og:image', content: imageUrl },
    { property: 'og:image:alt', content: imageAlt },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description },
    { name: 'twitter:image', content: imageUrl },
    { name: 'twitter:image:alt', content: imageAlt },
  ];
};
