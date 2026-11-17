import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'vitest';

const styles = readFileSync('packages/tailwind/base.css', 'utf8');
const header = readFileSync(
  'packages/ui/src/web/components/SiteHeader.tsx',
  'utf8',
);

test('shared headers stay painted while page content transitions', () => {
  for (const name of ['site-header', 'site-brand', 'site-navigation']) {
    assert.ok(header.includes(`[view-transition-name:${name}]`));
    assert.match(
      styles,
      new RegExp(
        `::view-transition-group\\(${name}\\)[^{]*\\{[^}]*animation: none`,
      ),
    );
  }
  assert.match(
    styles,
    /::view-transition-old\(page-content\)[^{]*\{[^}]*page-fade-out/,
  );
  assert.match(
    styles,
    /::view-transition-new\(page-content\)[^{]*\{[^}]*page-fade-in/,
  );
});

test('cross-document transitions opt in and respect reduced motion', () => {
  assert.match(styles, /@view-transition\s*\{\s*navigation: auto;/);
  assert.match(
    styles,
    /@media \(prefers-reduced-motion: reduce\)\s*\{\s*@view-transition\s*\{\s*navigation: none;/,
  );
});

test('brand snapshots keep intrinsic width and navigation stays aligned', () => {
  assert.match(header, /group flex w-fit.*justify-self-start/);
  for (const name of ['site-brand', 'site-navigation']) {
    for (const phase of ['old', 'new']) {
      assert.match(
        styles,
        new RegExp(
          `::view-transition-${phase}\\(${name}\\)[^{]*\\{[^}]*object-fit: none;`,
        ),
      );
    }
  }
  assert.match(
    styles,
    /::view-transition-new\(site-navigation\)[^{]*\{[^}]*right: 0;[^}]*left: auto;[^}]*object-position: right center;/,
  );
});
