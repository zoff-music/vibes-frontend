import type { PlayerState, Provider } from './types';

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

type YouTubeConfiguration = ConstructorParameters<
  NonNullable<Window['YT']>['Player']
>[1];

class YouTubeSdk {
  private state: PlayerState;
  private listeners = new Map<string, () => void>();
  private iframe: HTMLIFrameElement;
  private readyTimer: ReturnType<typeof setTimeout>;
  private destroyed = false;

  constructor(
    target: HTMLElement,
    private configuration: YouTubeConfiguration,
  ) {
    this.state = clock('youtube', configuration.videoId);
    this.iframe = document.createElement('iframe');
    this.iframe.title = 'YouTube SDK test double';
    this.iframe.src = 'about:blank';
    target.replaceWith(this.iframe);
    this.readyTimer = setTimeout(
      () => configuration.events.onReady({ target: this }),
      30,
    );
    finishYouTube = () => {
      pause(this.state);
      this.state.ended = true;
      configuration.events.onStateChange({ data: 0 });
    };
  }

  private emit() {
    const data = this.state.playing ? 1 : 2;
    setTimeout(() => {
      if (!this.destroyed) this.configuration.events.onStateChange({ data });
    }, 20);
  }

  getVideoData() {
    return { video_id: this.state.id };
  }
  getCurrentTime() {
    return position(this.state) / 1000;
  }
  getPlayerState() {
    return this.state.playing ? 1 : 2;
  }
  getVolume() {
    return this.state.volume;
  }
  setVolume(value: number) {
    this.state.volume = value;
  }
  isMuted() {
    return this.state.muted;
  }
  mute() {
    this.state.muted = true;
  }
  unMute() {
    this.state.muted = false;
  }
  setSize() {}
  addEventListener(name: string, callback: () => void) {
    this.listeners.set(name, callback);
  }
  removeEventListener(name: string) {
    this.listeners.delete(name);
  }
  playVideo() {
    if (faults.blocked) {
      setTimeout(() => this.listeners.get('onAutoplayBlocked')?.(), 30);
    }
    const wasPlaying = this.state.playing;
    play(this.state);
    if (this.state.playing !== wasPlaying) this.emit();
  }
  pauseVideo() {
    const wasPlaying = this.state.playing;
    pause(this.state);
    if (wasPlaying) this.emit();
  }
  seekTo(seconds: number) {
    this.state.seeks++;
    this.state.position = seconds * 1000;
    this.state.reference = performance.now();
  }
  loadVideoById(id: string, seconds = 0) {
    pause(this.state);
    this.state.id = id;
    this.state.position = seconds * 1000;
    play(this.state);
    this.emit();
  }
  destroy() {
    this.destroyed = true;
    clearTimeout(this.readyTimer);
    pause(this.state);
    this.iframe.remove();
    this.listeners.clear();
  }
}

export function installYouTube() {
  window.YT = { Player: YouTubeSdk };
}
