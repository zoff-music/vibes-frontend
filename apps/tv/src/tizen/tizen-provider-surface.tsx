import type { PlaybackStateV2 } from '@vibes/models';
import { useGenerationMessage } from '@/hooks/use-generation-message';
import { YouTubeIframePlayer } from '@/tizen/youtube-iframe-player';

interface TizenProviderSurfaceProps {
  isGenerating: boolean;
  playback: PlaybackStateV2;
}

export function TizenProviderSurface({
  isGenerating,
  playback,
}: TizenProviderSurfaceProps) {
  const generationMessage = useGenerationMessage(isGenerating);
  const playlistItem = playback.currentPlaylistItem;

  if (isGenerating && !playlistItem) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-6 bg-tv-surface">
        <div className="size-14 animate-spin rounded-full border-4 border-tv-border border-t-accent" />
        <div className="animate-pulse text-3xl">{generationMessage}</div>
        <div className="text-tv-muted text-xl">
          Playlist items will appear here automatically.
        </div>
      </div>
    );
  }

  if (!playlistItem) {
    return (
      <div className="flex h-full items-center justify-center bg-black text-4xl text-tv-muted">
        Nothing playing yet
      </div>
    );
  }

  if (playlistItem.sourceType === 'youtube') {
    return (
      <YouTubeIframePlayer
        key={`${playlistItem.sourceId}:${playback.updatedAt}`}
        positionMs={playback.positionMs}
        sourceId={playlistItem.sourceId}
        title={playlistItem.title}
      />
    );
  }

  if (playlistItem.sourceType === 'soundcloud' && playlistItem.providerUrl) {
    const src = `https://w.soundcloud.com/player/?url=${encodeURIComponent(playlistItem.providerUrl)}&auto_play=${String(playback.isPlaying)}&hide_related=true&show_comments=false&show_user=true&show_reposts=false&visual=true`;
    return (
      <iframe
        allow="autoplay"
        className="h-full w-full border-0"
        src={src}
        title={playlistItem.title}
      />
    );
  }

  return (
    <div className="relative flex h-full items-center justify-center overflow-hidden bg-black">
      <img
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-40"
        src={playlistItem.thumbnailUrl}
      />
      <img
        alt=""
        className="relative size-80 rounded-3xl object-cover"
        src={playlistItem.thumbnailUrl}
      />
    </div>
  );
}
