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
    // The SDK replaces this child, leaving Preact's container ownership intact.
    const target = document.createElement('div');
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
