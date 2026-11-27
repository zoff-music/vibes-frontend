import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { test } from 'vitest';
import { prerender } from '../server/prerender';

test.each(prerender.paths)(
  '%s ships matching SSR and hydration themes',
  async (route) => {
    for (const theme of ['auto', 'dark', 'light']) {
      const html = await readFile(
        path.join(prerender.directory, route, `${theme}.html`),
        'utf8',
      );
      const classes = html
        .match(/<html\b[^>]* class="([^"]*)"/)?.[1]
        .split(' ');
      assert.ok(classes);
      assert.equal(classes.includes('dark'), theme === 'dark');
      assert.equal(classes.includes('theme-light'), theme === 'light');
      const json = html.match(
        /<script id="_vibes-data" type="application\/json">([^<]+)<\/script>/,
      )?.[1];
      assert.ok(json);
      assert.equal(JSON.parse(json).root.theme, theme);
    }
  },
);
