interface YouTubeIframePlayerProps {
  positionMs: number;
  sourceId: string;
  title: string;
}

export function YouTubeIframePlayer({
  positionMs,
  sourceId,
  title,
}: YouTubeIframePlayerProps) {
  const startSeconds = Math.max(
    0,
    Math.floor(positionMs / millisecondsPerSecond),
  );
  const parameters = new URLSearchParams({
    autoplay: '1',
    controls: '1',
    playsinline: '1',
    rel: '0',
    start: String(startSeconds),
  });
  const source = `https://www.youtube.com/embed/${encodeURIComponent(sourceId)}?${parameters.toString()}`;

  return (
    <iframe
      allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
      allowFullScreen
      className="h-full w-full border-0 bg-black"
      referrerPolicy="strict-origin-when-cross-origin"
      src={source}
      title={title}
    />
  );
}

const millisecondsPerSecond = 1_000;
