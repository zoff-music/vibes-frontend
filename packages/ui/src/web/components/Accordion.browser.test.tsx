import '@vibes/tailwind/styles.css';
import { hydrate, render } from 'preact';
import renderToString from 'preact-render-to-string';
import { afterEach, expect, it } from 'vitest';
import { Accordion } from './Accordion';

const root = document.createElement('div');

afterEach(() => {
  render(null, root);
  root.remove();
});

it('opens before hydration and animates the panel in both directions', async () => {
  const view = <Accordion title="Question">Answer</Accordion>;
  root.innerHTML = renderToString(view);
  document.body.append(root);
  const details = root.querySelector('details');
  const summary = root.querySelector('summary');
  if (!details || !summary) throw new Error('Missing disclosure');

  const closedHeight = details.offsetHeight;
  summary.click();
  await expect
    .poll(() => getComputedStyle(details, '::details-content').opacity)
    .toBe('1');
  const openHeight = details.offsetHeight;
  expect(openHeight).toBeGreaterThan(closedHeight);
  hydrate(view, root);
  expect(details.open).toBe(true);

  for (const targetHeight of [closedHeight, openHeight]) {
    summary.click();
    await expect
      .poll(
        () => {
          const height = details.offsetHeight;
          return height > closedHeight && height < openHeight;
        },
        { interval: 10 },
      )
      .toBe(true);
    await expect.poll(() => details.offsetHeight).toBe(targetHeight);
  }
});

it('clips the open header to the rounded card corners', () => {
  render(
    <Accordion title="Question" open>
      Answer
    </Accordion>,
    root,
  );
  root.className = 'm-8';
  document.body.append(root);
  const details = root.querySelector('details');
  const summary = root.querySelector('summary');
  if (!details || !summary) throw new Error('Missing disclosure');
  const { top, left, width } = details.getBoundingClientRect();
  expect(
    summary.contains(document.elementFromPoint(left + width / 2, top + 4)),
  ).toBe(true);
  expect(summary.contains(document.elementFromPoint(left + 2, top + 2))).toBe(
    false,
  );
});
