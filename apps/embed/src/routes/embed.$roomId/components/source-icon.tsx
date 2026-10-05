import type { PlaylistItem } from '@vibes/models';
import { SoundCloudIcon, YouTubeIcon } from '@vibes/ui/web';

interface Props {
  currentPlaylistItem: PlaylistItem | null;
}

export function EmbedSourceIcon({ currentPlaylistItem }: Props) {
  if (currentPlaylistItem?.sourceType === 'soundcloud') {
    return <SoundCloudIcon className="h-5 w-5 shrink-0" />;
  }
  if (currentPlaylistItem?.sourceType === 'youtube') {
    return <YouTubeIcon className="h-5 w-5 shrink-0" />;
  }
  return null;
}
