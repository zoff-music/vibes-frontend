import type { MetaFunction } from 'react-router';
import type { loader } from './loader';
import { createRoomShareDescription, createRoomShareTitle } from './share';

export const roomMeta: MetaFunction<typeof loader> = ({ loaderData }) => {
  if (!loaderData) {
    return [{ title: 'Zoff - Shared Music Room' }];
  }

  const currentSong = loaderData.playback?.currentSong ?? null;
  const listenerCount = loaderData.room.userCount ?? 0;
  const title = createRoomShareTitle(loaderData.room.name, currentSong);
  const description = createRoomShareDescription(
    loaderData.room.name,
    currentSong,
    listenerCount,
  );
  const imageUrl =
    currentSong?.thumbnailUrl ||
    new URL('/logo.png', loaderData.pageUrl).toString();
  const imageAlt = currentSong
    ? `${currentSong.title} artwork`
    : 'Zoff shared music rooms';

  return [
    { title },
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
