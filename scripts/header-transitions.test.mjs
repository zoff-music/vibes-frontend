import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const styles = readFileSync('packages/tailwind/styles.css', 'utf8');
const header = readFileSync(
  'packages/ui/src/web/components/SiteHeader.tsx',
  'utf8',
);

test('shared headers retain outgoing snapshots while their geometry animates', () => {
  for (const name of ['site-header', 'site-brand', 'site-navigation']) {
    assert.ok(header.includes(`[view-transition-name:${name}]`));
    assert.match(
      styles,
      new RegExp(
        `::view-transition-old\\(${name}\\)[^{]*\\{[^}]*opacity: 1;[^}]*page-fade-out 220ms`,
      ),
    );
    assert.match(
      styles,
      new RegExp(
        `::view-transition-new\\(${name}\\)[^{]*\\{[^}]*page-fade-in 220ms`,
      ),
    );
    assert.doesNotMatch(
      styles,
      new RegExp(
        `::view-transition-group\\(${name}\\)[^{]*\\{[^}]*animation: none`,
      ),
    );
  }
});

test('cross-document transitions opt in and respect reduced motion', () => {
  assert.match(styles, /@view-transition\s*\{\s*navigation: auto;/);
  assert.match(
    styles,
    /@media \(prefers-reduced-motion: reduce\)\s*\{\s*@view-transition\s*\{\s*navigation: none;/,
  );
});

test('brand snapshots use intrinsic width instead of the changing grid track', () => {
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
