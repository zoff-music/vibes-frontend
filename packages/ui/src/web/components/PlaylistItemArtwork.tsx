import {
  classNames,
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
  const [loadedSource, setLoadedSource] = useState<string | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const useWebp = Boolean(webp && failedWebp !== webp);
  const src = resolvePlaylistItemThumbnail(thumbnailUrl, failedWebp !== webp);
  const selectedSource = useWebp && webp ? webp : src;

  const handleError = () => {
    if (webp && imageRef.current?.currentSrc === webp) setFailedWebp(webp);
  };

  const handleLoad = () => {
    const image = imageRef.current;
    if (!image?.complete || image.naturalWidth === 0) return;
    // YouTube serves a decodable 120×90 placeholder for missing WebP variants.
    // Its 404 response can fire load rather than error in the browser.
    if (
      webp &&
      image.currentSrc === webp &&
      image.naturalWidth === 120 &&
      image.naturalHeight === 90
    ) {
      setFailedWebp(webp);
      return;
    }
    if (image.currentSrc === webp || image.currentSrc === image.src) {
      setLoadedSource(selectedSource);
    }
  };

  useEffect(() => {
    const image = imageRef.current;

    // SSR images may fail or load YouTube's placeholder before hydration.
    if (
      webp &&
      image?.complete &&
      (image.naturalWidth === 0 ||
        (image.naturalWidth === 120 && image.naturalHeight === 90)) &&
      image.currentSrc === webp
    ) {
      setFailedWebp(webp);
      return;
    }
    if (
      image?.complete &&
      image.naturalWidth > 0 &&
      (image.currentSrc === webp || image.currentSrc === image.src)
    ) {
      setLoadedSource(selectedSource);
    }
  }, [webp, selectedSource]);

  return (
    <picture className="shrink-0">
      {useWebp && <source type="image/webp" srcSet={webp} />}
      <img
        ref={imageRef}
        src={src}
        alt=""
        className={classNames(
          className,
          loadedSource !== selectedSource && 'opacity-0',
        )}
        width={width}
        height={height}
        decoding="async"
        fetchPriority={fetchPriority}
        loading={loading}
        onError={handleError}
        onLoad={handleLoad}
      />
    </picture>
  );
}
