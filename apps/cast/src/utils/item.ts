import type { Song } from '@vibes/models';
import type { PlaylistItem } from '@vibes/shared';

// Cast senders retain the existing wire contract during rolling upgrades.
export function toPlaylistItem(song: Song): PlaylistItem {
  const { artist, ...item } = song;
  return normalizePlaylistItem({ ...item, publisher: artist });
}

export const normalizePlaylistItem = (
  playlistItem: PlaylistItem,
): PlaylistItem => {
  return {
    id: String(playlistItem.id), // Ensure ID is always a string
    sourceType: playlistItem.sourceType,
    sourceId: playlistItem.sourceId,
    providerUrl: playlistItem.providerUrl,
    title: playlistItem.title,
    publisher: playlistItem.publisher,
    thumbnailUrl: playlistItem.thumbnailUrl || '',
    duration: playlistItem.duration,
    voteCount: playlistItem.voteCount,
    playbackRestriction: playlistItem.playbackRestriction,
    addedBy: playlistItem.addedBy,
    addedAt: playlistItem.addedAt || new Date().toISOString(),
  };
};
