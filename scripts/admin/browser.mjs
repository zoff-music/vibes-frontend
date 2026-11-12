import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { build } from 'esbuild';
import { chromium } from 'playwright';

const directory = await mkdtemp(path.join(tmpdir(), 'admin-charts-'));
await build({
  stdin: {
    contents: `
      import { render } from 'preact';
      import { RoomUsageChart } from './packages/ui/src/web/graphs/RoomUsageChart';
      const rooms = Array.from({length: 300}, (_, i) => ({
        roomId: 'room-' + i, roomName: 'Room ' + i,
        roomType: i % 2 ? 'WATCH' : 'MUSIC', value: 2,
      }));
      render(<RoomUsageChart label="Messages" tickFormat="%H:%M"
        buckets={[{timestamp: new Date('2026-11-12T00:00:00Z'), total: 610, rooms}]} />, document.getElementById('root'));
    `,
    resolveDir: process.cwd(),
    loader: 'tsx',
  },
  bundle: true,
  jsx: 'automatic',
  jsxImportSource: 'preact',
  outfile: path.join(directory, 'chart.js'),
});
await writeFile(
  path.join(directory, 'index.html'),
  '<!doctype html><div id="root"></div><script src="chart.js"></script>',
);
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.goto(`file://${directory}/index.html`);
await page.getByText('Find a room · 300 rooms').click();
assert.equal(await page.locator('button[aria-pressed]').count(), 20);
await page.getByRole('button', { name: 'Next', exact: true }).click();
assert.equal(await page.getByText('Page 2 of 15').count(), 1);
await page.getByRole('searchbox').fill('Room 299');
assert.equal(await page.locator('button[aria-pressed]').count(), 1);
await page.locator('button[aria-pressed]').click();
assert.equal(
  await page.getByRole('button', { name: 'Back to top rooms' }).count(),
  1,
);
assert.equal(await page.getByLabel('Room legend').locator('li').count(), 1);
await page.getByRole('button', { name: 'Back to top rooms' }).click();
assert.equal(await page.getByLabel('Room legend').locator('li').count(), 7);
await page.getByRole('radio', { name: 'Music', exact: true }).click();
assert.equal(await page.getByLabel('Room legend').locator('li').count(), 6);
assert.equal(
  await page.getByText('No matching rooms.', { exact: true }).count(),
  1,
);
await page.getByRole('searchbox').fill('');
assert.equal(await page.getByText('Page 1 of 8').count(), 1);
await page.getByRole('searchbox').fill('room-298');
await page.locator('button[aria-pressed]').click();
assert.equal(await page.getByLabel('Room legend').locator('li').count(), 1);
await browser.close();
await rm(directory, { recursive: true });
console.log(
  'Chart search, pagination, room drill-down, reset and type filters passed.',
);
