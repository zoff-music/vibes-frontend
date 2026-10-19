import {
  playlistItemWebpThumbnail,
  resolvePlaylistItemThumbnail,
} from '@vibes/shared';
import { useEffect, useRef, useState } from 'preact/compat';

interface PlaylistItemArtworkProps {
  thumbnailUrl?: string;
  className: string;
  width: number;
  height: number;
  fetchPriority?: 'high' | 'low' | 'auto';
  loading?: 'eager' | 'lazy';
}

export function PlaylistItemArtwork({
  thumbnailUrl,
  className,
  width,
  height,
  fetchPriority = 'auto',
  loading = 'eager',
}: PlaylistItemArtworkProps) {
  const webp = playlistItemWebpThumbnail(thumbnailUrl);
  const [failedWebp, setFailedWebp] = useState<string | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const useWebp = Boolean(webp && failedWebp !== webp);
  const src = resolvePlaylistItemThumbnail(thumbnailUrl, failedWebp !== webp);

  const handleError = () => {
    if (webp && imageRef.current?.currentSrc === webp) setFailedWebp(webp);
  };

  useEffect(() => {
    const image = imageRef.current;

    // The SSR image can fail before hydration installs its error handler.
    if (
      webp &&
      image?.complete &&
      image.naturalWidth === 0 &&
      image.currentSrc === webp
    ) {
      setFailedWebp(webp);
    }
  }, [webp]);

  return (
    <picture className="shrink-0">
      {useWebp && <source type="image/webp" srcSet={webp} />}
      <img
        ref={imageRef}
        src={src}
        alt=""
        className={className}
        width={width}
        height={height}
        decoding="async"
        fetchPriority={fetchPriority}
        loading={loading}
        onError={handleError}
      />
    </picture>
  );
}
