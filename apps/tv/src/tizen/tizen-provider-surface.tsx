import type { PlaybackState } from '@vibes/models';
import { useGenerationMessage } from '@/hooks/use-generation-message';
import { YouTubeIframePlayer } from '@/tizen/youtube-iframe-player';

interface TizenProviderSurfaceProps {
  isGenerating: boolean;
  playback: PlaybackState;
}

export function TizenProviderSurface({
  isGenerating,
  playback,
}: TizenProviderSurfaceProps) {
  const generationMessage = useGenerationMessage(isGenerating);
  const song = playback.currentSong;

  if (isGenerating && !song) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-6 bg-tv-surface">
        <div className="size-14 animate-spin rounded-full border-4 border-tv-border border-t-accent" />
        <div className="animate-pulse text-3xl">{generationMessage}</div>
        <div className="text-tv-muted text-xl">
          Songs will appear here automatically.
        </div>
      </div>
    );
  }

  if (!song) {
    return (
      <div className="flex h-full items-center justify-center bg-black text-4xl text-tv-muted">
        No song is playing
      </div>
    );
  }

  if (song.sourceType === 'youtube') {
    return (
      <YouTubeIframePlayer
        key={`${song.sourceId}:${playback.updatedAt}`}
        positionMs={playback.positionMs}
        sourceId={song.sourceId}
        title={song.title}
      />
    );
  }

  if (song.sourceType === 'soundcloud' && song.providerUrl) {
    const src = `https://w.soundcloud.com/player/?url=${encodeURIComponent(song.providerUrl)}&auto_play=${String(playback.isPlaying)}&hide_related=true&show_comments=false&show_user=true&show_reposts=false&visual=true`;
    return (
      <iframe
        allow="autoplay"
        className="h-full w-full border-0"
        src={src}
        title={song.title}
      />
    );
  }

  if (song.sourceType === 'spotify') {
    const src = `https://open.spotify.com/embed/track/${encodeURIComponent(song.sourceId)}?utm_source=zoff`;
    return (
      <iframe
        allow="autoplay; encrypted-media"
        className="h-full w-full border-0"
        src={src}
        title={song.title}
      />
    );
  }

  return (
    <div className="relative flex h-full items-center justify-center overflow-hidden bg-black">
      <img
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-40"
        src={song.thumbnailUrl}
      />
      <img
        alt=""
        className="relative size-80 rounded-3xl object-cover"
        src={song.thumbnailUrl}
      />
    </div>
  );
}
