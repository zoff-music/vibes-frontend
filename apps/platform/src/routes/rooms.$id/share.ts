import type { PlaylistItem, RoomType } from '@vibes/models';
import { getRoomLabels } from '@vibes/ui/shared';

export function createRoomPageUrl(requestUrl: string, roomId: string): string {
  const request = new URL(requestUrl);
  const pageUrl = new URL(`/${encodeURIComponent(roomId)}`, request.origin);
  const shareToken = request.searchParams.get('share');

  if (shareToken) {
    pageUrl.searchParams.set('share', shareToken);
  }

  return pageUrl.toString();
}

export function createRoomShareUrl(
  requestUrl: string,
  roomId: string,
  playlistItem: PlaylistItem | null,
  listenerCount: number,
): string {
  const shareUrl = new URL(createRoomPageUrl(requestUrl, roomId));
  const playlistItemKey = playlistItem
    ? `${playlistItem.sourceType}:${playlistItem.sourceId}`
    : `room:${roomId}`;
  const shareToken = createShareToken(`${playlistItemKey}:${listenerCount}`);

  shareUrl.searchParams.set('share', shareToken);
  return shareUrl.toString();
}

export function createRoomShareTitle(
  roomName: string,
  playlistItem: PlaylistItem | null,
): string {
  if (playlistItem) {
    return `${playlistItem.title} | ${roomName} on Zoff`;
  }

  return `${roomName} | Zoff`;
}

export function createRoomShareDescription(
  roomName: string,
  playlistItem: PlaylistItem | null,
  listenerCount: number,
  roomType: RoomType = 'MUSIC',
): string {
  const listenerDescription = createListenerDescription(
    listenerCount,
    roomType,
  );

  if (playlistItem) {
    const details = [
      playlistItem.publisher,
      `Now playing in ${roomName}`,
      listenerDescription,
    ].filter(Boolean);
    return details.join(' · ');
  }

  const details = [
    `Join the shared ${roomType === 'WATCH' ? 'video' : 'music'} room ${roomName} on Zoff`,
    listenerDescription,
  ].filter(Boolean);
  return details.join(' · ');
}

function createListenerDescription(
  listenerCount: number,
  roomType: RoomType,
): string {
  if (listenerCount < 1) {
    return '';
  }

  const labels = getRoomLabels(roomType);

  return `${listenerCount} ${listenerCount === 1 ? labels.participant : labels.participants}`;
}

function createShareToken(value: string): string {
  let hash = shareHashOffsetBasis;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, shareHashPrime);
  }

  return (hash >>> 0).toString(36);
}

const shareHashOffsetBasis = 2_166_136_261;
const shareHashPrime = 16_777_619;
