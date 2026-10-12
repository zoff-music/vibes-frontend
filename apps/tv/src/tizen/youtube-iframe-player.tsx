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
    video: sourceId,
    start: String(startSeconds),
  });
  let source = `http://127.0.0.1:34771/youtube?${parameters.toString()}`;
  // The development server already supplies an HTTP referrer to YouTube.
  if (window.location.protocol !== 'file:') {
    parameters.delete('video');
    parameters.set('autoplay', '1');
    parameters.set('controls', '1');
    parameters.set('playsinline', '1');
    parameters.set('rel', '0');
    source = `https://www.youtube.com/embed/${encodeURIComponent(sourceId)}?${parameters.toString()}`;
  }

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
