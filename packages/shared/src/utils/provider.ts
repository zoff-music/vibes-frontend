import type { SourceType } from '../types';

export interface ProviderTrackLink {
  provider: SourceType;
  providerUrl?: string;
  sourceId?: string;
}

export interface ProviderPlaylistLink {
  provider: SourceType;
  providerUrl?: string;
  sourceId?: string;
}

export const getProviderTrackUrl = (
  provider: SourceType,
  sourceId: string,
  providerUrl?: string,
) => {
  if (provider === 'youtube') {
    return `https://www.youtube.com/watch?v=${sourceId}`;
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

export const parseProviderTrackLink = (
  value: string,
): ProviderTrackLink | null => {
  const trimmedValue = value.trim();
  if (!URL.canParse(trimmedValue)) {
    return null;
  }

  const url = new URL(trimmedValue);
  const hostname = url.hostname.toLowerCase();
  const pathSegments = url.pathname.split('/').filter(Boolean);

  const youtubeId = getYouTubeID(url, hostname, pathSegments);
  if (youtubeId) {
    return {
      provider: 'youtube',
      sourceId: youtubeId,
    };
  }

  const isSoundCloudHost =
    hostname === 'soundcloud.com' || hostname.endsWith('.soundcloud.com');
  const isSoundCloudTrack =
    isSoundCloudHost &&
    ((hostname === 'on.soundcloud.com' && pathSegments.length >= 1) ||
      pathSegments.length >= 2);
  if (isSoundCloudTrack) {
    url.search = '';
    url.hash = '';
    return {
      provider: 'soundcloud',
      providerUrl: url.toString(),
    };
  }

  return null;
};

export const parseProviderPlaylistLink = (
  value: string,
): ProviderPlaylistLink | null => {
  const trimmedValue = value.trim();
  if (!URL.canParse(trimmedValue)) {
    return null;
  }

  const url = new URL(trimmedValue);
  const hostname = url.hostname.toLowerCase();
  const pathSegments = url.pathname.split('/').filter(Boolean);
  const isYouTubeHost =
    hostname === 'youtube.com' ||
    hostname.endsWith('.youtube.com') ||
    hostname === 'youtu.be' ||
    hostname.endsWith('.youtu.be');
  const youtubePlaylistId = url.searchParams.get('list') ?? '';
  if (isYouTubeHost && /^[A-Za-z0-9_-]+$/.test(youtubePlaylistId)) {
    return {
      provider: 'youtube',
      sourceId: youtubePlaylistId,
    };
  }

  const isSoundCloudHost =
    hostname === 'soundcloud.com' || hostname.endsWith('.soundcloud.com');
  const isSoundCloudPlaylist =
    isSoundCloudHost &&
    ((hostname === 'on.soundcloud.com' && pathSegments.length >= 1) ||
      (pathSegments.length >= 3 && pathSegments[1] === 'sets'));
  if (isSoundCloudPlaylist) {
    url.search = '';
    url.hash = '';
    return {
      provider: 'soundcloud',
      providerUrl: url.toString(),
    };
  }

  return null;
};

const getYouTubeID = (url: URL, hostname: string, pathSegments: string[]) => {
  let videoId = '';
  if (hostname === 'youtu.be' || hostname.endsWith('.youtu.be')) {
    videoId = pathSegments[0] ?? '';
  }
  if (
    hostname === 'youtube.com' ||
    hostname.endsWith('.youtube.com') ||
    hostname === 'youtube-nocookie.com' ||
    hostname.endsWith('.youtube-nocookie.com')
  ) {
    if (pathSegments[0] === 'watch') {
      videoId = url.searchParams.get('v') ?? '';
    }
    if (['embed', 'live', 'shorts'].includes(pathSegments[0] ?? '')) {
      videoId = pathSegments[1] ?? '';
    }
  }

  return /^[A-Za-z0-9_-]{11}$/.test(videoId) ? videoId : null;
};
