import type { Song } from '@vibes/models';

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
  song: Song | null,
  listenerCount: number,
): string {
  const shareUrl = new URL(createRoomPageUrl(requestUrl, roomId));
  const songKey = song
    ? `${song.sourceType}:${song.sourceId}`
    : `room:${roomId}`;
  const shareToken = createShareToken(`${songKey}:${listenerCount}`);

  shareUrl.searchParams.set('share', shareToken);
  return shareUrl.toString();
}

export function createRoomShareTitle(
  roomName: string,
  song: Song | null,
): string {
  if (song) {
    return `${song.title} | ${roomName} on Zoff`;
  }

  return `${roomName} | Zoff`;
}

export function createRoomShareDescription(
  roomName: string,
  song: Song | null,
  listenerCount: number,
): string {
  const listenerDescription = createListenerDescription(listenerCount);

  if (song) {
    const details = [
      song.artist,
      `Now playing in ${roomName}`,
      listenerDescription,
    ].filter(Boolean);
    return details.join(' · ');
  }

  const details = [
    `Join the shared music room ${roomName} on Zoff`,
    listenerDescription,
  ].filter(Boolean);
  return details.join(' · ');
}

function createListenerDescription(listenerCount: number): string {
  if (listenerCount < 1) {
    return '';
  }

  if (listenerCount === 1) {
    return '1 listener';
  }

  return `${listenerCount} listeners`;
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
