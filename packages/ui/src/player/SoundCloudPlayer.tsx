import { safeWrap, usePlaybackStore } from '@vibes/shared';
import { memo, useEffect, useRef, useState } from 'react';

// Declare SC global on window
declare global {
  interface Window {
    SC?: SoundCloudApi;
  }
}

interface SoundCloudWidget {
  bind: (event: string, callback: (event?: unknown) => void) => void;
  getPosition: (callback: (currentTimeMs: number) => void) => void;
  pause: () => void;
  play: () => void;
  seekTo: (milliseconds: number) => void;
}

interface SoundCloudApi {
  Widget: {
    (iframe: HTMLIFrameElement): SoundCloudWidget;
    Events: {
      ERROR: string;
      FINISH: string;
      READY: string;
      SEEK: string;
    };
  };
}

interface Props {
  isVisible?: boolean;
  onEnded?: () => void;
  fill?: boolean;
}

const SoundCloudPlayerComponent: React.FC<Props> = ({
  isVisible = true,
  onEnded,
  fill = false,
}) => {
  const currentSong = usePlaybackStore((state) => state.currentSong);
  const isPlaying = usePlaybackStore((state) => state.isPlaying);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const widgetRef = useRef<SoundCloudWidget | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Load SoundCloud Widget API script
  useEffect(() => {
    if (!window.SC) {
      const script = document.createElement('script');
      script.src = 'https://w.soundcloud.com/player/api.js';
      script.async = true;
      script.onload = () => {
        // Initialize widget if iframe is already mounted
        if (iframeRef.current) {
          initializeWidget();
        }
      };
      document.body.appendChild(script);
    } else if (iframeRef.current && !widgetRef.current) {
      initializeWidget();
    }
  }, []);

  const initializeWidget = () => {
    const iframe = iframeRef.current;
    const soundCloud = window.SC;
    if (!iframe || !soundCloud) return;

    const [widgetErr, widget] = safeWrap(() => soundCloud.Widget(iframe));
    if (widgetErr || !widget) {
      console.error('[SoundCloud Widget] Initialization error:', widgetErr);
      return;
    }

    widgetRef.current = widget;

    widget.bind(soundCloud.Widget.Events.READY, () => {
      setIsReady(true);
      // Sync initial state
      if (isPlaying) {
        widget.play();
      }
    });

    widget.bind(soundCloud.Widget.Events.FINISH, () => {
      onEnded?.();
    });

    widget.bind(soundCloud.Widget.Events.SEEK, () => {
      const actualPositionMs = usePlaybackStore.getState().actualPositionMs;
      console.log(
        '[SoundCloud Widget] User sought, enforcing position:',
        actualPositionMs,
      );
      widget.seekTo(actualPositionMs);
    });

    widget.bind(soundCloud.Widget.Events.ERROR, (e?: unknown) => {
      console.error('[SoundCloud Widget] Error:', e);
    });
  };

  // Re-initialize when song changes (iframe src changes)
  useEffect(() => {
    // Reset state
    widgetRef.current = null;
    setIsReady(false);
  }, [currentSong?.sourceId]);

  // Sync Playback State
  useEffect(() => {
    if (!widgetRef.current || !isReady) return;

    if (isPlaying) {
      widgetRef.current.play();
    } else {
      widgetRef.current.pause();
    }
  }, [isPlaying, isReady]);

  // Drift Correction Interval
  useEffect(() => {
    const widget = widgetRef.current;
    if (!isReady || !widget || !isPlaying) return;

    const interval = setInterval(() => {
      if (
        typeof document !== 'undefined' &&
        document.visibilityState === 'hidden'
      ) {
        return;
      }

      widget.getPosition((currentTimeMs: number) => {
        const actualPositionMs = usePlaybackStore.getState().actualPositionMs;
        // Allow 2 seconds of drift
        if (Math.abs(currentTimeMs - actualPositionMs) > 2000) {
          console.log(
            '[SoundCloud Widget] Drift detected, seeking to:',
            actualPositionMs,
          );
          widget.seekTo(actualPositionMs);
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isReady, isPlaying]);

  // Sync Volume - optional, but good to have
  useEffect(() => {
    if (!widgetRef.current || !isReady) return;
    // widgetRef.current.setVolume(volume * 100);
  }, []);

  if (!currentSong || !isVisible) {
    return null;
  }

  if (currentSong.sourceType !== 'soundcloud') {
    return null;
  }

  const soundcloudUrl = currentSong.sourceId.startsWith('http')
    ? currentSong.sourceId
    : `https://api.soundcloud.com/tracks/${currentSong.sourceId}`;

  // Construct iframe src with parameters
  // visual=true makes it the big album art player
  const src = `https://w.soundcloud.com/player/?url=${encodeURIComponent(soundcloudUrl)}&auto_play=false&visual=true&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false`;

  const containerClass = fill
    ? 'relative h-full w-full overflow-hidden'
    : 'relative w-full overflow-hidden rounded-xl';

  const containerStyle = fill
    ? { height: '100%', width: '100%' }
    : { aspectRatio: '16/9', minHeight: '200px' };

  return (
    <div
      className={`${containerClass} bg-black ${!isVisible ? 'hidden' : ''}`}
      style={containerStyle}
    >
      {/* CRT Effects Layer - Behind content, only while loading */}
      {!isReady && (
        <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
          <div className="vhs-scanlines h-full w-full opacity-40 mix-blend-overlay" />
          <div className="crt-overlay !absolute !z-21 pointer-events-none inset-0 opacity-10" />
        </div>
      )}

      {/* Loading State */}
      {!isReady && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/80">
          <div className="text-center">
            <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-orange-500/50 border-t-orange-500" />
            <p className="glow-text font-mono text-orange-400 text-sm">
              LOADING SYSTEM...
            </p>
          </div>
        </div>
      )}

      <iframe
        ref={iframeRef}
        id="sc-widget"
        src={src}
        onLoad={initializeWidget}
        width="100%"
        height="100%"
        scrolling="no"
        frameBorder="0"
        allow="autoplay; encrypted-media"
        className={`h-full w-full ${isReady ? 'opacity-100' : 'opacity-0'} transition-opacity duration-700`}
        title={currentSong.title}
      />
    </div>
  );
};

export const SoundCloudPlayer = memo(
  SoundCloudPlayerComponent,
  (prevProps, nextProps) => {
    return (
      prevProps.isVisible === nextProps.isVisible &&
      prevProps.onEnded === nextProps.onEnded
    );
  },
);
