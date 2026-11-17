import { globSync, readFileSync } from 'node:fs';
import { expect, test } from 'vitest';

test('all repository tests use package-owned TypeScript Vitest suites', () => {
  const files = globSync(['apps/**/*', 'packages/**/*', 'scripts/**/*'], {
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.vitest/**',
      '**/android/**',
      '**/ios/**',
      '**/.expo/**',
      '**/test-results/**',
    ],
  });
  const violations: string[] = [];
  for (const file of files) {
    if (!/\.(test|spec)\.[cm]?[jt]sx?$|\.browser\.mjs$/.test(file)) continue;
    const source = readFileSync(file, 'utf8');
    if (!/^(apps|packages)\//.test(file) || !/\.tsx?$/.test(file))
      violations.push(file);
    if (/from\s+['"]node:test['"]/.test(source)) violations.push(file);
    if (!/from\s+['"]vitest['"]/.test(source)) violations.push(file);
  }
  expect(violations).toEqual([]);
});
