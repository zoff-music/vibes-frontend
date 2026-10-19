// Playlist item artwork
export const DEFAULT_PLAYLIST_ITEM_THUMBNAIL =
  'data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%27http%3A//www.w3.org/2000/svg%27%20width%3D%27200%27%20height%3D%27200%27%20viewBox%3D%270%200%20200%20200%27%3E%3Crect%20width%3D%27200%27%20height%3D%27200%27%20rx%3D%2724%27%20fill%3D%27%2316161c%27/%3E%3Ccircle%20cx%3D%27100%27%20cy%3D%27100%27%20r%3D%2772%27%20fill%3D%27%231f1f27%27/%3E%3Ccircle%20cx%3D%27100%27%20cy%3D%27100%27%20r%3D%2752%27%20fill%3D%27%232a2a34%27/%3E%3Ccircle%20cx%3D%27100%27%20cy%3D%27100%27%20r%3D%2718%27%20fill%3D%27%23141418%27/%3E%3Ccircle%20cx%3D%27100%27%20cy%3D%27100%27%20r%3D%276%27%20fill%3D%27%23c7c7d1%27/%3E%3Cpath%20d%3D%27M100%2028a72%2072%200%200%201%2072%2072%27%20stroke%3D%27%233a3a46%27%20stroke-width%3D%276%27%20fill%3D%27none%27%20stroke-linecap%3D%27round%27/%3E%3C/svg%3E';

export function resolvePlaylistItemThumbnail(
  value?: string,
  compact = false,
): string {
  const thumbnail = value?.trim() || DEFAULT_PLAYLIST_ITEM_THUMBNAIL;

  if (!compact) return thumbnail;

  return thumbnail.replace(
    /^(https:\/\/i\.ytimg\.com\/vi\/[\w-]+\/)hqdefault\.jpg(?=\?|$)/,
    '$1mqdefault.jpg',
  );
}

export const PUBLIC_ROOM_PAGE_SIZE = 12;

export function playlistItemWebpThumbnail(value?: string): string | undefined {
  const thumbnail = resolvePlaylistItemThumbnail(value, true);

  if (
    !/^https:\/\/i\.ytimg\.com\/vi\/[\w-]+\/mqdefault\.jpg(?:\?|$)/.test(
      thumbnail,
    )
  ) {
    return;
  }

  return thumbnail
    .replace('/vi/', '/vi_webp/')
    .replace('mqdefault.jpg', 'mqdefault.webp');
}
