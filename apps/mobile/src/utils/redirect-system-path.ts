import { safeWrap } from '@vibes/shared';
import {
  nativeBaseUrl,
  nativeHostname,
  pairingTokenSearchParam,
  remoteIdSearchParam,
  remotePathSegment,
  remotePathSegmentCount,
  reservedPaths,
  roomPathSegmentCount,
  zoffHostname,
  zoffProtocol,
  zoffWwwHostname,
} from '../constants/native-intent';

interface SystemPathEvent {
  initial: boolean;
  path: string;
}

export function redirectSystemPath({ path }: SystemPathEvent) {
  const [error, route] = safeWrap(() => {
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

    if (url.hostname === 'remote' || url.hostname === remotePathSegment) {
      url.pathname = `/${url.hostname}${url.pathname}`;
    }

    const remoteRoute = getRemoteRoute(url);

    if (remoteRoute) return remoteRoute;

    const roomId = getCustomSchemeRoomId(url);

    if (roomId) return getRoomRoute(roomId);

    return '/';
  });

  return error ? '/' : route;
}

function getRemoteRoute(url: URL) {
  const pathSegments = url.pathname.split('/').filter(Boolean);

  if (pathSegments[0] !== remotePathSegment && pathSegments[0] !== 'remote')
    return '';

  if (pathSegments.length > remotePathSegmentCount) return '';

  const remoteId =
    url.searchParams.get(remoteIdSearchParam) ??
    (pathSegments[1] === 'join' ? '' : pathSegments[1]) ??
    '';
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
