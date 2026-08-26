interface SystemPathEvent {
  initial: boolean;
  path: string;
}

export function redirectSystemPath({ path }: SystemPathEvent) {
  try {
    const url = new URL(path, nativeBaseUrl);
    const isZoffWebUrl =
      (url.protocol === 'https:' || url.protocol === 'http:') &&
      (url.hostname === zoffHostname || url.hostname === zoffWwwHostname);

    if (isZoffWebUrl) {
      const remoteRoute = getRemoteRoute(url);
      if (remoteRoute) return remoteRoute;
      const roomId = getRoomId(url.pathname);
      if (roomId) return getRoomRoute(roomId);
      return url.toString();
    }

    if (url.protocol !== zoffProtocol) return path;

    const roomId = getCustomSchemeRoomId(url);
    if (roomId) return getRoomRoute(roomId);
    return '/';
  } catch {
    return '/';
  }
}

function getRemoteRoute(url: URL) {
  const pathSegments = url.pathname.split('/').filter(Boolean);
  if (pathSegments[0] !== remotePathSegment) return '';
  if (pathSegments.length > remotePathSegmentCount) return '';

  const remoteId =
    url.searchParams.get(remoteIdSearchParam) ?? pathSegments[1] ?? '';
  const pairingToken = url.searchParams.get(pairingTokenSearchParam) ?? '';
  const searchParams = new URLSearchParams();
  if (remoteId) searchParams.set(remoteIdSearchParam, remoteId);
  if (pairingToken) searchParams.set(pairingTokenSearchParam, pairingToken);
  const query = searchParams.toString();
  return query ? `/remote?${query}` : '/remote';
}

function getCustomSchemeRoomId(url: URL) {
  if (url.hostname && url.hostname !== nativeHostname) {
    return normalizeRoomId(url.hostname);
  }
  return getRoomId(url.pathname);
}

function getRoomId(pathname: string) {
  const pathSegments = pathname.split('/').filter(Boolean);
  if (pathSegments.length !== roomPathSegmentCount) return '';
  return normalizeRoomId(pathSegments[0] || '');
}

function normalizeRoomId(roomId: string) {
  const normalizedRoomId = decodeURIComponent(roomId).trim().toLowerCase();
  if (!normalizedRoomId || reservedPaths.has(normalizedRoomId)) return '';
  return normalizedRoomId;
}

function getRoomRoute(roomId: string) {
  return `/?roomId=${encodeURIComponent(roomId)}`;
}

const nativeBaseUrl = 'zoff://app';
const nativeHostname = 'app';
const pairingTokenSearchParam = 'pair';
const remoteIdSearchParam = 'remoteId';
const remotePathSegment = 'remotes';
const remotePathSegmentCount = 2;
const roomPathSegmentCount = 1;
const zoffHostname = 'zoff.me';
const zoffProtocol = 'zoff:';
const zoffWwwHostname = 'www.zoff.me';
const reservedPaths = new Set([
  'add',
  'admin',
  'callback',
  'casting',
  'embed',
  'privacy-policy',
  'remote',
  'remotes',
  'security',
  'settings',
  'terms-of-service',
]);
