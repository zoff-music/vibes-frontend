import assert from 'node:assert/strict';
import test from 'node:test';
import { getThemeClass, getThemeFromCookies } from './theme.ts';

function preferencesCookie(value: unknown): string {
  return `preferences=${Buffer.from(JSON.stringify(value)).toString('base64url')}`;
}

test('reads the shared theme preference and maps document classes', () => {
  for (const theme of ['dark', 'light', 'auto'] as const) {
    const cookie = preferencesCookie({ theme });
    const expectedClass = { dark: 'dark', light: 'theme-light', auto: '' };

    assert.equal(getThemeFromCookies(cookie), theme);
    assert.equal(getThemeClass(cookie), expectedClass[theme]);
  }
});

test('supports quoted, percent-encoded and standard base64 preferences', () => {
  const encoded = Buffer.from(
    JSON.stringify({ theme: 'dark', name: 'ø' }),
  ).toString('base64');
  const cookie = `unrelated=%broken; preferences=${encodeURIComponent(`"${encoded}"`)}`;

  assert.equal(getThemeFromCookies(cookie), 'dark');
});

test('missing or malformed preferences fall back to automatic theme', () => {
  const cookies = [
    null,
    '',
    'other=dark',
    'preferences=%broken',
    'preferences=invalid',
    preferencesCookie(null),
    preferencesCookie('dark'),
    preferencesCookie({ theme: 'unknown' }),
    preferencesCookie({ theme: 1 }),
    preferencesCookie({}),
  ];

  for (const cookie of cookies) {
    assert.equal(getThemeFromCookies(cookie), 'auto');
    assert.equal(getThemeClass(cookie), '');
  }
});
