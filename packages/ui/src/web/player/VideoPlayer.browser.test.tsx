import '@vibes/tailwind/styles.css';
import { usePlaybackStore } from '@vibes/shared';
import { domMax, LazyMotion } from 'framer-motion';
import { type ComponentChildren, render } from 'preact';
import { act } from 'preact/test-utils';
import { afterEach, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';
import { PlayerControls } from './PlayerControls';
import { VideoPlayer } from './VideoPlayer';

vi.mock('@kasperrt/smolter/preact', () => ({
  Link: ({
    children,
    to,
    ...props
  }: {
    children: ComponentChildren;
    to: string;
  }) => (
    <a {...props} href={to}>
      {children}
    </a>
  ),
}));

const provider = vi.hoisted(() => ({ fail: (_event: unknown) => {} }));
vi.mock('./YouTubeFrame', () => ({
  YouTubeFrame: ({
    onError,
    className,
  }: {
    onError: (event: unknown) => void;
    className: string;
  }) => {
    provider.fail = onError;
    return <div className={className}>Provider sign-in error</div>;
  },
}));

let root: HTMLDivElement;
afterEach(() => {
  render(null, root);
  root.remove();
});

it.each([
  { width: 1280, code: 101 },
  { width: 390, code: 150 },
  { width: 1280, code: 153 },
  { width: 390, code: 153 },
])(
  'keeps error $code and controls usable at $width px',
  async ({ width, code }) => {
    await page.viewport(width, 800);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    usePlaybackStore.getState().setPlaybackState(
      {
        currentPlaylistItem: {
          id: 'one',
          sourceId: 'video',
          sourceType: 'youtube',
          title: 'Video',
          publisher: 'Publisher',
          duration: 60,
          thumbnailUrl: '',
          addedAt: '2026-01-01T00:00:00Z',
        },
        isPlaying: false,
        positionMs: 0,
        updatedAt: new Date().toISOString(),
        serverTimeMs: Date.now(),
      },
      'host',
    );
    const report = vi.fn();
    const play = vi.fn();
    const skip = vi.fn();
    const mute = vi.fn();
    root = document.createElement('div');
    root.className = 'h-150 overflow-hidden';
    document.body.append(root);
    await act(() =>
      render(
        <LazyMotion features={domMax}>
          <div className="flex h-full min-h-0 flex-col gap-6">
            <div
              data-viewport
              className="relative min-h-0 flex-1 overflow-hidden"
            >
              <VideoPlayer fill isVisible onProviderError={report} />
            </div>
            <PlayerControls
              isPlaying={false}
              canPlay
              canSkip
              showReset={false}
              onPlay={play}
              onPause={vi.fn()}
              onSkip={skip}
              onReset={vi.fn()}
              addPlaylistItemHref="/add"
              castHref="/cast"
              showCast={false}
              isCasting={false}
              volume={50}
              onVolumeChange={vi.fn()}
              onToggleMuted={mute}
            />
          </div>
        </LazyMotion>,
        root,
      ),
    );
    await expect
      .poll(() => root.querySelector('[data-provider]'))
      .not.toBeNull();
    // Let initial source effects settle before delivering the provider error.
    await expect
      .element(page.getByText('Click to play', { exact: false }))
      .toBeVisible();
    await act(() => provider.fail({ data: code }));
    const alert = page.getByRole('alert');
    await expect
      .poll(() => alert.element().textContent)
      .toContain(
        code === 153
          ? 'Browser blocked by YouTube'
          : 'This video is unavailable in the embedded player.',
      );
    const viewport = root
      .querySelector('[data-viewport]')!
      .getBoundingClientRect();
    const overlay = alert.element().getBoundingClientRect();
    expect(overlay.top).toBe(viewport.top);
    expect(overlay.bottom).toBe(viewport.bottom);
    const controls = page
      .getByRole('group', { name: 'Playback controls' })
      .element()
      .getBoundingClientRect();
    expect(controls.top).toBeGreaterThanOrEqual(overlay.bottom);
    expect(controls.bottom).toBeLessThanOrEqual(
      root.getBoundingClientRect().bottom,
    );
    await page.getByRole('button', { name: 'Play', exact: true }).click();
    await page.getByRole('button', { name: 'Skip', exact: true }).click();
    await page.getByRole('button', { name: 'Mute player' }).click();
    expect(play).toHaveBeenCalledOnce();
    expect(skip).toHaveBeenCalledOnce();
    expect(mute).toHaveBeenCalledOnce();
    expect(warn).toHaveBeenCalledOnce();
    expect(report).toHaveBeenCalledWith('one', String(code));
    const info = page.getByRole('button', {
      name: 'About YouTube playback errors',
    });
    await info.click();
    const dialog = page.getByRole('dialog', {
      name: 'YouTube playback blocked',
    });
    await expect.element(dialog).toBeVisible();
    expect(dialog.element().textContent).toContain('proprietary car browsers');
    expect(dialog.element().textContent).toContain('confirm you’re not a bot');
    if (code === 153) {
      expect(dialog.element().textContent).toContain('HTTP Referer');
    } else {
      expect(dialog.element().textContent).toContain(
        'does not tell us whether',
      );
    }
    await expect
      .element(page.getByRole('link', { name: 'Open on YouTube' }))
      .toHaveAttribute('href', 'https://www.youtube.com/watch?v=video');
    await page.getByRole('button', { name: 'Got it' }).click();
    await expect.element(dialog).not.toBeInTheDocument();
    await expect.element(info).toHaveFocus();
    await info.click();
    await expect.element(dialog).toBeVisible();
    await expect
      .element(
        page.getByRole('heading', {
          name: 'YouTube playback blocked',
          exact: true,
        }),
      )
      .toHaveFocus();
    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    );
    await expect.element(dialog).not.toBeInTheDocument();
    await expect.element(info).toHaveFocus();
  },
);
