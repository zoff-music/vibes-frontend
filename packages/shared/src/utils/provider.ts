import type { SourceType } from '../types';

export const getProviderTrackUrl = (
  provider: SourceType,
  sourceId: string,
  providerUrl?: string,
) => {
  if (provider === 'youtube') {
    return `https://www.youtube.com/watch?v=${sourceId}`;
  }

  if (provider === 'spotify') {
    return `https://open.spotify.com/track/${sourceId}`;
  }

  if (!providerUrl) {
    return null;
  }

  if (!URL.canParse(providerUrl)) {
    return null;
  }

  const url = new URL(providerUrl);
  const isSoundCloudHost =
    url.hostname === 'soundcloud.com' ||
    url.hostname.endsWith('.soundcloud.com');
  const pathSegments = url.pathname.split('/').filter(Boolean);
  if (
    url.protocol !== 'https:' ||
    !isSoundCloudHost ||
    url.username !== '' ||
    url.password !== '' ||
    pathSegments.length < 2
  ) {
    return null;
  }

  return url.toString();
};
