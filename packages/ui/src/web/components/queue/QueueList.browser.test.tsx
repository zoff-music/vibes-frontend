import type { PlaylistItem } from '@vibes/models';
import type {} from '@vitest/browser-playwright';
import '@vibes/tailwind/styles.css';
import { domMax, LazyMotion } from 'framer-motion';
import { hydrate, render } from 'preact';
import renderToString from 'preact-render-to-string';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cdp, page } from 'vitest/browser';
import { QueueList } from './QueueList';

declare global {
  interface Window {
    find(text: string): boolean;
  }
}

const items: PlaylistItem[] = Array.from({ length: 3500 }, (_, index) => ({
  id: String(index),
  title: index === 496 ? 'LO QUIERO YA!' : `Track ${index}`,
  publisher: `Artist ${index}`,
  duration: 180,
  sourceType: 'youtube',
  sourceId: 'test',
  thumbnailUrl: 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=',
  addedAt: '2026-01-01T00:00:00Z',
  voteCount: 0,
}));

let root: HTMLDivElement;

beforeEach(async () => {
  await cdp().send('Emulation.setCPUThrottlingRate', { rate: 4 });
  root = document.createElement('div');
  root.className = 'lg:h-150 lg:overflow-y-auto';
  document.body.append(root);
});

afterEach(async () => {
  render(null, root);
  root.remove();
  window.getSelection()?.removeAllRanges();
  await cdp().send('Emulation.setCPUThrottlingRate', { rate: 1 });
});

describe.each([1280, 390])('queue at %ipx with 3,500 songs', (width) => {
  it('preserves hydration and find selections while windowing controls and handling votes', async () => {
    await page.viewport(width, 800);
    let queue = items.slice(0, 12);
    const onVote = vi.fn((id: string) => {
      const voted = queue.find((item) => item.id === id);
      if (!voted) return;
      queue = [
        { ...voted, voteCount: (voted.voteCount ?? 0) + 1 },
        ...queue.filter((item) => item.id !== id),
      ];
      render(view(), root);
    });
    const view = () => (
      <LazyMotion features={domMax}>
        <QueueList playlistItems={queue} onVote={onVote} />
      </LazyMotion>
    );

    const serverDocument = new DOMParser().parseFromString(
      renderToString(view()),
      'text/html',
    );
    root.replaceChildren(...serverDocument.body.childNodes);
    const serverTitle = root.querySelector('h3');
    hydrate(view(), root);
    expect(root.querySelector('h3')).toBe(serverTitle);
    expect(root.querySelectorAll('h3')).toHaveLength(12);

    queue = items;
    render(view(), root);
    await expect.poll(() => root.querySelectorAll('h3').length).toBe(3500);
    await expect
      .poll(() => root.querySelectorAll('button').length)
      .toBeGreaterThan(0);
    expect(root.querySelectorAll('button').length).toBeLessThan(72);
    expect(root.querySelectorAll('img').length).toBeLessThan(72);

    for (const [query, id] of [
      ['LO QUIERO YA!', '496'],
      ['Artist 3499', '3499'],
      ['Track 0', '0'],
    ]) {
      window.getSelection()?.removeAllRanges();
      window.scrollTo(0, 0);
      root.scrollTop = 0;
      // Headless Chromium exposes native matching, but its script-level find
      // does not reveal the selection as the browser toolbar does.
      expect(window.find(query)).toBe(true);
      const selectedNode = window.getSelection()?.anchorNode;
      selectedNode?.parentElement?.scrollIntoView({ block: 'center' });
      const rowSelector = `[data-queue-row="${id}"]`;
      await expect
        .poll(() => root.querySelector(`${rowSelector} button`))
        .not.toBeNull();
      expect(window.getSelection()?.anchorNode).toBe(selectedNode);
      expect(window.getSelection()?.toString().toLowerCase()).toBe(
        query.toLowerCase(),
      );
      const row = root.querySelector<HTMLElement>(rowSelector);
      expect(row).not.toBeNull();
      const bounds = row?.getBoundingClientRect();
      expect(bounds?.top).toBeLessThan(800);
      expect(bounds?.bottom).toBeGreaterThan(0);
      const vote = page.getByRole('button', {
        name: new RegExp(
          `^Vote for ${queue.find((item) => item.id === id)?.title} by`,
        ),
      });
      await vote.click();
      expect(onVote).toHaveBeenLastCalledWith(id);
      await expect
        .poll(() =>
          root
            .querySelector('[data-queue-row]')
            ?.getAttribute('data-queue-row'),
        )
        .toBe(id);
      expect(root.querySelectorAll('button').length).toBeLessThan(96);
      expect(root.querySelectorAll('img').length).toBeLessThan(96);
    }
  });
});
