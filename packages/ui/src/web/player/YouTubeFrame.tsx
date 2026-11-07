import { safeWrap, safeWrapAsync } from '@vibes/shared';
import { useEffect, useLayoutEffect, useRef } from 'preact/compat';
import {
  loadYouTubeApi,
  type YouTubeOptions,
  type YouTubePlayer,
  type YouTubeReadyEvent,
  type YouTubeStateEvent,
} from './youtube';

interface YouTubeFrameProps {
  videoId: string;
  opts: YouTubeOptions;
  className: string;
  onReady: (event: YouTubeReadyEvent) => void;
  onStateChange: (event: YouTubeStateEvent) => void;
  onEnd: () => void;
  onError: (event: unknown) => void;
}

export function YouTubeFrame({
  className,
  videoId,
  opts,
  onReady,
  onStateChange,
  onEnd,
  onError,
}: YouTubeFrameProps) {
  const container = useRef<HTMLDivElement>(null);
  const callbacks = useRef({
    videoId,
    opts,
    onReady,
    onStateChange,
    onEnd,
    onError,
  });

  useLayoutEffect(() => {
    callbacks.current = {
      videoId,
      opts,
      onReady,
      onStateChange,
      onEnd,
      onError,
    };
  }, [videoId, opts, onReady, onStateChange, onEnd, onError]);

  useEffect(() => {
    const parent = container.current;
    if (!parent) return;

    let disposed = false;
    let player: YouTubePlayer | null = null;
    // Start the embed now rather than after the API script: the SDK attaches to an existing iframe,
    // so the player download overlaps iframe_api and its widget script instead of following them.
    const target = createEmbedFrame(
      callbacks.current.videoId,
      callbacks.current.opts,
    );
    parent.append(target);

    const initialize = async () => {
      const [loadError, api] = await safeWrapAsync(loadYouTubeApi());
      if (disposed) return;
      if (loadError) {
        callbacks.current.onError(loadError);
        return;
      }
      if (!api) return;

      const [createError, instance] = safeWrap(
        () =>
          new api.Player(target, {
            ...callbacks.current.opts,
            videoId: callbacks.current.videoId,
            events: {
              onReady: (event) => {
                if (!disposed) callbacks.current.onReady(event);
              },
              onStateChange: (event) => {
                if (disposed) return;
                callbacks.current.onStateChange(event);
                if (event.data === 0) callbacks.current.onEnd();
              },
              onError: (event) => {
                if (!disposed) callbacks.current.onError(event);
              },
            },
          }),
      );
      if (createError) {
        callbacks.current.onError(createError);
        return;
      }
      player = instance;
    };

    void initialize();

    return () => {
      disposed = true;
      if (player) safeWrap(() => player?.destroy());
      parent.replaceChildren();
    };
  }, []);

  return <div ref={container} className={className} />;
}

const EMBED_ALLOW =
  'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';

function createEmbedFrame(videoId: string, opts: YouTubeOptions) {
  const url = new URL(`/embed/${encodeURIComponent(videoId)}`, opts.host);

  for (const [key, value] of Object.entries(opts.playerVars)) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }

  const frame = document.createElement('iframe');
  frame.src = url.href;
  frame.title = 'YouTube video player';
  frame.allow = EMBED_ALLOW;
  frame.allowFullscreen = true;
  // YouTube rejects embeds that arrive without a referrer.
  frame.referrerPolicy = 'strict-origin-when-cross-origin';
  frame.setAttribute('frameborder', '0');
  frame.setAttribute('width', String(opts.width));
  frame.setAttribute('height', String(opts.height));

  return frame;
}
