import { useEffect, useRef } from 'preact/hooks';
import type { PlayerState, Provider } from './types';

interface YouTubePlayer {
  getVideoData: () => { video_id: string };
  getCurrentTime: () => number;
  getPlayerState: () => number;
  getVolume: () => number;
  setVolume: (value: number) => void;
  isMuted: () => boolean;
  mute: () => void;
  unMute: () => void;
  setSize: () => void;
  addEventListener: (name: string, callback: () => void) => void;
  removeEventListener: (name: string) => void;
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (seconds: number) => void;
  loadVideoById: (id: string, seconds?: number) => void;
}

interface YouTubeProps {
  videoId: string;
  onReady: (event: { target: YouTubePlayer }) => void;
  onStateChange: (event: { data: number }) => void;
  onEnd: () => void;
}

// Only the external SDK is simulated. The production players, store, gesture
// handling, navigation replacement and playback coordinator remain real.
export const faults = { blocked: true, loadingPauseCalls: 0, seeks: 0 };
const states = new Map<Provider, PlayerState>();

function clock(provider: Provider, id: string) {
  const state = {
    id,
    position: 0,
    playing: false,
    muted: false,
    volume: 100,
    loading: false,
    ended: false,
    reference: performance.now(),
    seeks: 0,
  };
  states.set(provider, state);
  return state;
}

function position(state: PlayerState) {
  return (
    state.position + (state.playing ? performance.now() - state.reference : 0)
  );
}

function pause(state: PlayerState) {
  if (state.loading) faults.loadingPauseCalls++;
  state.position = position(state);
  state.playing = false;
}

function play(state: PlayerState) {
  if (faults.blocked || state.loading || state.playing) return;
  state.reference = performance.now();
  state.playing = true;
  state.ended = false;
}

export function sample(provider: Provider) {
  const state = states.get(provider)!;
  return {
    id: state.id,
    position: position(state),
    paused: !state.playing,
    muted: state.muted,
    volume: state.volume,
    seeks: state.seeks,
  };
}

let finishSoundCloud = () => {};
let finishYouTube = () => {};
export function finish(provider: Provider) {
  if (provider === 'soundcloud') finishSoundCloud();
  else finishYouTube();
}

export function installSoundCloud() {
  const state = clock('soundcloud', '101');
  let iframe: HTMLIFrameElement;
  const events = new Map<string, (event?: unknown) => void>();
  const emit = (name: string, data?: unknown) => events.get(name)?.(data);
  const widget: ReturnType<NonNullable<Window['SC']>['Widget']> = {
    bind(name, callback) {
      events.set(name, callback);
      if (name === 'READY') setTimeout(callback, 30);
    },
    getPosition: (callback) => setTimeout(() => callback(position(state)), 10),
    // A misleading SDK state must never count as confirmed playback.
    isPaused: (callback) => setTimeout(() => callback(false), 10),
    setVolume: (value: number) => {
      state.volume = value;
    },
    play() {
      play(state);
      emit('PLAY');
    },
    pause() {
      pause(state);
    },
    seekTo(value) {
      faults.seeks++;
      state.seeks++;
      setTimeout(() => {
        state.position = value;
        state.reference = performance.now();
        emit('SEEK');
      }, 600);
    },
    load(url, options) {
      iframe.src = `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}`;
      pause(state);
      state.id = url.split('/').at(-1)!;
      state.position = 0;
      state.loading = true;
      // Actual regression: READY/PLAY/PAUSE arrive before load's callback.
      setTimeout(() => {
        emit('READY');
        emit('PLAY');
        emit('PAUSE');
      }, 30);
      setTimeout(() => {
        state.loading = false;
        options.callback();
      }, 700);
    },
  };
  const Widget = (frame: HTMLIFrameElement) => {
    iframe = frame;
    state.id = new URL(frame.src).searchParams.get('url')!.split('/').at(-1)!;
    return widget;
  };
  Widget.Events = {
    ERROR: 'ERROR',
    FINISH: 'FINISH',
    PAUSE: 'PAUSE',
    PLAY: 'PLAY',
    PLAY_PROGRESS: 'PLAY_PROGRESS',
    READY: 'READY',
    SEEK: 'SEEK',
  };
  window.SC = { Widget };
  setInterval(() => {
    if (state.playing)
      emit('PLAY_PROGRESS', { currentPosition: position(state) });
  }, 100);
  finishSoundCloud = () => {
    pause(state);
    state.ended = true;
    emit('FINISH');
  };
}

export default function YouTubeSdk({
  videoId,
  onReady,
  onStateChange,
  onEnd,
}: YouTubeProps) {
  const callbacks = useRef({ onReady, onStateChange, onEnd });
  callbacks.current = { onReady, onStateChange, onEnd };
  const initialVideo = useRef(videoId);

  useEffect(() => {
    const state = clock('youtube', initialVideo.current);
    const listeners = new Map<string, () => void>();
    const emit = () => {
      const data = state.playing ? 1 : 2;
      setTimeout(() => callbacks.current.onStateChange({ data }), 20);
    };
    const player: YouTubePlayer = {
      getVideoData: () => ({ video_id: state.id }),
      getCurrentTime: () => position(state) / 1000,
      getPlayerState: () => (state.playing ? 1 : 2),
      getVolume: () => state.volume,
      setVolume: (value) => {
        state.volume = value;
      },
      isMuted: () => state.muted,
      mute: () => {
        state.muted = true;
      },
      unMute: () => {
        state.muted = false;
      },
      setSize: () => {},
      addEventListener: (name: string, callback: () => void) =>
        listeners.set(name, callback),
      removeEventListener: (name: string) => listeners.delete(name),
      playVideo() {
        if (faults.blocked) {
          setTimeout(() => listeners.get('onAutoplayBlocked')?.(), 30);
        }
        const wasPlaying = state.playing;
        play(state);
        if (state.playing !== wasPlaying) emit();
      },
      pauseVideo() {
        const wasPlaying = state.playing;
        pause(state);
        if (wasPlaying) emit();
      },
      seekTo(seconds: number) {
        state.seeks++;
        state.position = seconds * 1000;
        state.reference = performance.now();
      },
      loadVideoById(id: string, seconds = 0) {
        pause(state);
        state.id = id;
        state.position = seconds * 1000;
        play(state);
        emit();
      },
    };
    finishYouTube = () => {
      pause(state);
      state.ended = true;
      callbacks.current.onStateChange({ data: 0 });
      callbacks.current.onEnd();
    };
    callbacks.current.onReady({ target: player });
    return () => {
      pause(state);
    };
  }, []);

  return <iframe title="YouTube SDK test double" src="about:blank" />;
}
