import assert from 'node:assert/strict';
import { afterEach, test, vi } from 'vitest';
import {
  isLocalAppHandoff,
  leaveDocument,
  localAppURL,
} from '../src/navigation.ts';

test('local app links preserve route parameters and the Cast entry slash', () => {
  assert.equal(
    localAppURL(new URL('http://localhost:3001/casting/receiver')).href,
    'http://localhost:3003/casting/receiver/',
  );
  assert.equal(
    localAppURL(new URL('http://localhost:3001/remotes/join?remoteId=test'))
      .href,
    'http://localhost:3007/remotes/join?remoteId=test',
  );
  assert.equal(
    localAppURL(new URL('https://zoff.me/remotes/join')).href,
    'https://zoff.me/remotes/join',
  );
});

test('cross-app navigation retains the outgoing page without a delay or dimming', async (context) => {
  const names = ['window', 'document', 'location', 'matchMedia'] as const;
  const originals = names.map((name) =>
    Object.getOwnPropertyDescriptor(globalThis, name),
  );
  const document = {
    cookie: '',
    documentElement: { dataset: {} as Record<string, string> },
  };
  const setCookie = vi.fn(async (_cookie: CookieInit) => {});
  vi.stubGlobal('cookieStore', { set: setCookie });
  let destination = '';
  let timers = 0;
  let reduced = false;

  Object.defineProperties(globalThis, {
    document: { configurable: true, value: document },
    location: {
      configurable: true,
      value: {
        href: 'http://localhost:3007/remotes/join',
        assign: (href: string) => {
          destination = href;
        },
      },
    },
    matchMedia: { configurable: true, value: () => ({ matches: reduced }) },
    window: {
      configurable: true,
      value: {
        setTimeout() {
          timers++;
        },
      },
    },
  });
  context.onTestFinished(() => {
    names.forEach((name, index) => {
      const descriptor = originals[index];

      if (descriptor) Object.defineProperty(globalThis, name, descriptor);
      else Reflect.deleteProperty(globalThis, name);
    });
  });

  await leaveDocument(new URL('http://localhost:3001/'));
  assert.equal(destination, 'http://localhost:3001/');
  assert.equal(timers, 0);
  assert.equal(setCookie.mock.calls.length, 1);
  assert.equal(setCookie.mock.calls[0][0].name, 'zoff-page-entry');
  assert.equal(document.documentElement.dataset.pageExit, undefined);

  setCookie.mockRejectedValueOnce(new Error('Cookies unavailable'));
  await leaveDocument(new URL('http://localhost:3005/admin'));
  assert.equal(destination, 'http://localhost:3005/admin');
  vi.stubGlobal('cookieStore', undefined);
  await leaveDocument(new URL('http://localhost:3001/'));
  assert.equal(destination, 'http://localhost:3001/');

  reduced = true;
  await leaveDocument(new URL('http://localhost:3005/admin'));
  assert.equal(destination, 'http://localhost:3005/admin');
  assert.equal(document.documentElement.dataset.pageExit, undefined);
  assert.equal(
    isLocalAppHandoff(
      new URL('http://localhost:3001/'),
      new URL('https://other.example/'),
    ),
    false,
  );
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});
