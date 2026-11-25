import '@vibes/tailwind/styles.css';
import { usePlaybackStore } from '@vibes/shared';
import { hydrate, render } from 'preact';
import { act } from 'preact/test-utils';
import renderToString from 'preact-render-to-string';
import { afterEach, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';
import { VideoPlayer } from './VideoPlayer';
import type { YouTubeConfiguration, YouTubePlayer } from './youtube';

const instances: PlayerDouble[] = [];
class PlayerDouble implements YouTubePlayer {
  position = 0;
  volume = 100;
  muted = false;
  state = 2;
  videoId: string;
  constructor(
    readonly frame: HTMLElement,
    readonly configuration: YouTubeConfiguration,
  ) {
    this.videoId = configuration.videoId;
    frame.setAttribute('src', 'about:blank');
    instances.push(this);
  }
  destroy = vi.fn(() => this.frame.remove());
  addEventListener() {}
  removeEventListener() {}
  setSize() {}
  getCurrentTime() {
    return this.position;
  }
  getVideoData() {
    return { video_id: this.videoId };
  }
  getVolume() {
    return this.volume;
  }
  getPlayerState() {
    return this.state;
  }
  isMuted() {
    return this.muted;
  }
  mute() {
    this.muted = true;
  }
  unMute() {
    this.muted = false;
  }
  setVolume(volume: number) {
    this.volume = volume;
  }
  seekTo(seconds: number) {
    this.position = seconds;
  }
  playVideo() {
    this.state = 1;
    queueMicrotask(() => this.configuration.events.onStateChange({ data: 1 }));
  }
  pauseVideo() {
    this.state = 2;
    queueMicrotask(() => this.configuration.events.onStateChange({ data: 2 }));
  }
  loadVideoById(id: string, seconds = 0) {
    this.videoId = id;
    this.position = seconds;
    this.playVideo();
  }
}

let root: HTMLDivElement;
afterEach(() => {
  render(null, root);
  root.remove();
  delete window.YT;
  instances.length = 0;
  vi.restoreAllMocks();
});

it.each([
  { playing: false, volume: 37 },
  { playing: true, volume: 37 },
  { playing: true, volume: 0 },
])(
  'recreates the SDK locally (playing=$playing, volume=$volume)',
  async ({ playing, volume }) => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    window.YT = { Player: PlayerDouble };
    usePlaybackStore.getState().setPlaybackState(
      {
        currentPlaylistItem: {
          id: 'item',
          sourceId: 'current-video',
          sourceType: 'youtube',
          title: 'Video',
          publisher: 'Publisher',
          duration: 600,
          thumbnailUrl: '',
          addedAt: '2026-01-01T00:00:00Z',
        },
        isPlaying: playing,
        positionMs: 42000,
        updatedAt: new Date().toISOString(),
        serverTimeMs: Date.now(),
      },
      'host',
    );
    const before = usePlaybackStore.getState();
    const report = vi.fn();
    const play = vi.fn();
    const pause = vi.fn();
    const seek = vi.fn();
    const ended = vi.fn();
    root = document.createElement('div');
    root.className = 'relative h-100';
    document.body.append(root);
    const player = (
      <VideoPlayer
        fill
        allowUnmutedAutoplay
        volume={volume}
        onProviderError={report}
        onLocalPlay={play}
        onLocalPause={pause}
        onLocalSeek={seek}
        onEnded={ended}
      />
    );
    root.innerHTML = renderToString(player);
    expect(instances).toHaveLength(0);
    await act(() => hydrate(player, root));
    await expect.poll(() => instances.length).toBe(1);
    const original = instances[0]!;
    await act(() =>
      original.configuration.events.onReady({ target: original }),
    );
    await expect.poll(() => original.volume).toBe(volume);
    await act(() => original.configuration.events.onError({ data: 153 }));
    const reload = page.getByRole('button', { name: 'Reload player' });
    await expect.element(reload).toBeVisible();
    const info = page.getByRole('button', {
      name: 'About YouTube playback errors',
    });
    expect(reload.element().getBoundingClientRect().top).toBeGreaterThanOrEqual(
      info.element().getBoundingClientRect().bottom,
    );
    await reload.click();
    await expect.poll(() => instances.length).toBe(2);
    expect(original.destroy).toHaveBeenCalledOnce();
    expect(original.frame.isConnected).toBe(false);
    await expect.element(page.getByRole('alert')).not.toBeInTheDocument();
    expect(report).toHaveBeenLastCalledWith('item', null);
    const replacement = instances[1]!;
    expect(replacement.frame).not.toBe(original.frame);
    expect(replacement.frame.isConnected).toBe(true);
    expect(replacement.videoId).toBe('current-video');
    await act(() =>
      replacement.configuration.events.onReady({ target: replacement }),
    );
    await expect.poll(() => replacement.volume).toBe(volume);
    expect(replacement.position).toBeGreaterThanOrEqual(42);
    expect(replacement.position).toBeLessThan(47);
    expect(replacement.state).toBe(playing ? 1 : 2);
    expect(replacement.muted).toBe(volume === 0);
    expect(usePlaybackStore.getState().currentPlaylistItem).toEqual(
      before.currentPlaylistItem,
    );
    expect(usePlaybackStore.getState().isPlaying).toBe(playing);
    expect(usePlaybackStore.getState().authoritativePlayback).toEqual(
      before.authoritativePlayback,
    );
    expect(play).not.toHaveBeenCalled();
    expect(pause).not.toHaveBeenCalled();
    expect(seek).not.toHaveBeenCalled();
    expect(ended).not.toHaveBeenCalled();
    // Late callbacks from the destroyed instance must not resurrect its error.
    await act(() => original.configuration.events.onError({ data: 101 }));
    await expect.element(page.getByRole('alert')).not.toBeInTheDocument();
    await act(() => replacement.configuration.events.onError({ data: 150 }));
    await expect.element(reload).toBeVisible();
    expect(report).toHaveBeenLastCalledWith('item', '150');
    await reload.click();
    await expect.poll(() => instances.length).toBe(3);
    expect(replacement.destroy).toHaveBeenCalledOnce();
  },
);
