import type { PlaylistItem } from '@vibes/models';
import { PlaylistItemArtwork } from './PlaylistItemArtwork';

interface PlayerLoadingProps {
  playlistItem: PlaylistItem;
  status?: string;
}

export function PlayerLoading({
  playlistItem,
  status = 'Loading player...',
}: PlayerLoadingProps) {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black">
      {/* SIGNAL CRT */}
      <div className="pointer-events-none absolute inset-0 z-1 overflow-hidden">
        <div className="vhs-scanlines h-full w-full animate-none! opacity-20 mix-blend-overlay" />
        <div className="crt-overlay pointer-events-none !absolute inset-0 !z-2 opacity-10" />
      </div>
      {/* Server-rendered now playing: visible at first paint while the provider player loads. */}
      <div
        role="status"
        className="relative z-10 flex max-w-full flex-col items-center gap-2 px-6 text-center"
      >
        {/* Same preloaded artwork as the now-playing card, revealed before hydration. */}
        <PlaylistItemArtwork
          thumbnailUrl={playlistItem.thumbnailUrl}
          width={320}
          height={180}
          fetchPriority="high"
          className="mb-2 aspect-video w-36 rounded-xl border border-white/10 object-cover shadow-lg transition-opacity duration-300 sm:w-56"
        />
        <p className="font-display line-clamp-2 text-2xl text-white sm:text-3xl">
          {playlistItem.title}
        </p>
        {playlistItem.publisher && (
          <p className="line-clamp-1 text-sm text-white/70">
            {playlistItem.publisher}
          </p>
        )}
        <p className="text-2xs mt-2 inline-flex items-center gap-2 tracking-widest text-white/60 uppercase">
          <span
            aria-hidden="true"
            className="border-t-primary h-3 w-3 rounded-full border-2 border-white/30 motion-safe:animate-spin"
          />
          {status}
        </p>
      </div>
    </div>
  );
}
