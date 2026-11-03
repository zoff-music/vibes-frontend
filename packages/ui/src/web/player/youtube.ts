import { safeWrap } from '@vibes/shared';

export interface YouTubePlayer {
  addEventListener: (event: string, listener: () => void) => void;
  removeEventListener: (event: string, listener: () => void) => void;
  seekTo: (seconds: number, allowSeekAhead?: boolean) => void;
  getCurrentTime: () => number;
  getVideoData: () => { video_id: string };
  getVolume: () => number;
  playVideo: () => void;
  pauseVideo: () => void;
  getPlayerState: () => number;
  loadVideoById: (videoId: string, startSeconds?: number) => void;
  mute: () => void;
  unMute: () => void;
  isMuted: () => boolean;
  setSize: (width: number, height: number) => void;
  setVolume: (volume: number) => void;
  destroy: () => void;
}

export interface YouTubeReadyEvent {
  target: YouTubePlayer;
}

export interface YouTubeStateEvent {
  data: number;
}

export interface YouTubeOptions {
  host: string;
  height: number | string;
  width: number | string;
  playerVars: {
    autoplay: number;
    controls: number;
    disablekb: number;
    enablejsapi: number;
    fs: number;
    modestbranding: number;
    rel: number;
    playsinline: number;
    origin?: string;
  };
}

export interface YouTubeConfiguration extends YouTubeOptions {
  videoId: string;
  events: {
    onReady: (event: YouTubeReadyEvent) => void;
    onStateChange: (event: YouTubeStateEvent) => void;
    onError: (event: unknown) => void;
  };
}

interface YouTubeApi {
  get?: (id: string) => YouTubePlayer | undefined;
  Player: new (
    element: HTMLElement,
    configuration: YouTubeConfiguration,
  ) => YouTubePlayer;
}

declare global {
  interface Window {
    YT?: YouTubeApi;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let loading: Promise<YouTubeApi> | null = null;
const sdkUrl = 'https://www.youtube.com/iframe_api';

export function loadYouTubeApi(): Promise<YouTubeApi> {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (loading) return loading;

  loading = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${sdkUrl}"]`,
    );
    const script = existing ?? document.createElement('script');
    const previousReady = window.onYouTubeIframeAPIReady;
    const cleanup = () => {
      window.clearTimeout(timeout);
      script.removeEventListener('error', failed);
      if (window.onYouTubeIframeAPIReady === ready) {
        window.onYouTubeIframeAPIReady = previousReady;
      }
    };
    const failed = () => {
      cleanup();
      loading = null;
      if (!existing) script.remove();
      reject(new Error('Unable to load the YouTube player API'));
    };
    const ready = () => {
      if (previousReady) safeWrap(previousReady);
      if (!window.YT?.Player) return;
      cleanup();
      resolve(window.YT);
    };
    const timeout = window.setTimeout(failed, 15_000);
    window.onYouTubeIframeAPIReady = ready;
    script.addEventListener('error', failed);

    if (!existing) {
      script.src = sdkUrl;
      script.async = true;
      document.head.append(script);
    }
  });

  return loading;
}
