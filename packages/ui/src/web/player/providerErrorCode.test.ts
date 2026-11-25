import { expect, it } from 'vitest';
import { providerErrorCode } from './providerErrorCode';

it.each([
  [{ data: 101 }, '101'],
  [{ data: 150 }, '150'],
  [{ code: 'access_denied' }, 'access_denied'],
  [403, '403'],
  [undefined, 'soundcloud_error'],
  [{ message: 'unavailable' }, 'soundcloud_error'],
  ['x'.repeat(129), 'soundcloud_error'],
])('normalizes provider errors %j', (event, expected) => {
  expect(providerErrorCode(event, 'soundcloud_error')).toBe(expected);
});
