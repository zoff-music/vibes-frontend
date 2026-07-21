import type { Song } from '@vibes/models';
import { SoundCloudIcon, SpotifyIcon, YouTubeIcon } from '@vibes/ui';

interface Props {
  currentSong: Song | null;
}

export function EmbedSourceIcon({ currentSong }: Props) {
  if (currentSong?.sourceType === 'spotify') {
    return <SpotifyIcon className="h-5 w-5 shrink-0" />;
  }
  if (currentSong?.sourceType === 'soundcloud') {
    return <SoundCloudIcon className="h-5 w-5 shrink-0" />;
  }
  if (currentSong?.sourceType === 'youtube') {
    return <YouTubeIcon className="h-5 w-5 shrink-0" />;
  }
  return null;
}
