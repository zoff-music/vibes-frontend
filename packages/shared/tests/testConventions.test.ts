import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { expect, test } from 'vitest';

test('all repository tests use package-owned TypeScript Vitest suites', () => {
  const files = execFileSync(
    'git',
    ['ls-files', '--cached', '--others', '--exclude-standard'],
    { encoding: 'utf8' },
  )
    .split('\n')
    .filter((file) => file && existsSync(file));
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
