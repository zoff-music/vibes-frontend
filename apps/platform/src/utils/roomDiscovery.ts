import type { PublicRoomV3 } from '@vibes/models';
import { safeWrap } from '@vibes/shared/wrap';
import { ROOM_DISCOVERY_TAB_COOKIE } from '../constants/roomDiscovery.ts';
import type { RecentRoom } from './recentRooms';

export type RoomDiscoveryTab = 'public' | 'recent';

export interface RoomDiscoveryData {
  tab: RoomDiscoveryTab;
  history: RecentRoom[];
  publicRooms: PublicRoomV3[] | null;
  recentRooms: PublicRoomV3[] | null;
}

export function selectRoomDiscoveryTab(
  cookie: string,
  hasHistory: boolean,
  hasPublicRooms: boolean,
): RoomDiscoveryTab {
  const preference = cookie
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${ROOM_DISCOVERY_TAB_COOKIE}=`))
    ?.slice(ROOM_DISCOVERY_TAB_COOKIE.length + 1);
  if (!hasHistory) return 'public';
  if (preference === 'public' || preference === 'recent') return preference;
  return hasPublicRooms ? 'public' : 'recent';
}

export function saveRoomDiscoveryTab(tab: RoomDiscoveryTab) {
  safeWrap(() => {
    // biome-ignore lint/suspicious/noDocumentCookie: synchronous preference keeps immediate reloads and SSR in sync across browsers.
    document.cookie = `${ROOM_DISCOVERY_TAB_COOKIE}=${tab}; Path=/; Max-Age=31536000; SameSite=Lax${location.protocol === 'https:' ? '; Secure' : ''}`;
  });
}
