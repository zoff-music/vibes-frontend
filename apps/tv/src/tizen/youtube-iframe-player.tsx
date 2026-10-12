import { TV_PLAYER_PATH } from '@vibes/shared/tv-player';

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
  const startSeconds = Math.min(
    86_400,
    Math.max(0, Math.floor(positionMs / millisecondsPerSecond)),
  );
  const parameters = new URLSearchParams({
    video: sourceId,
    start: String(startSeconds),
  });
  const playerUrl =
    import.meta.env.VITE_TV_PLAYER_URL ?? `https://zoff.me${TV_PLAYER_PATH}`;
  const source = `${playerUrl}?${parameters.toString()}`;

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
