import assert from 'node:assert/strict';
import fs from 'node:fs';
import { resolve } from 'node:path';
import vm from 'node:vm';
import { afterEach, test, vi } from 'vitest';

const filename = resolve(
  'packages/ui/src/native/player/NativeSoundCloudPlayer.tsx',
);

afterEach(() => vi.useRealTimers());

interface BridgeMessage {
  type: string;
  blocked?: boolean;
  isPlaying?: boolean;
  commanded?: boolean;
}

interface BridgeCommands {
  zoffInitialize: (position: number, playing: boolean) => void;
  zoffReset: (position: number, playing: boolean) => void;
  zoffRetry: (position: number) => void;
  zoffLoad: (id: string, url: string) => void;
  zoffSetPlaying: (playing: boolean) => void;
}
const source = fs.readFileSync(filename, 'utf8');
const constants = Object.fromEntries(
  [...source.matchAll(/^const (\w+) = ([\d_]+);$/gm)].map(([, name, value]) => [
    name,
    Number(value!.replaceAll('_', '')),
  ]),
);
const script = source
  .split('const playerFrame =')[1]!
  .split('</script>')[0]!
  .replace(/\$\{(\w+)\}/g, (_, name) => {
    assert.ok(name in constants, `Unknown constant ${name}`);
    return String(constants[name]);
  });
function fixture() {
  vi.useFakeTimers();
  vi.setSystemTime(100000);
  let playing = false;
  let position = 0;
  let reference = Date.now();
  let allowPlay = false,
    dropCallbacks = false,
    ignoreSeeks = false;
  const messages: BridgeMessage[] = [];
  const seeks: { at: number; target: number }[] = [];
  const events: Record<string, () => void> = {};
  let pauses = 0,
    plays = 0;
  const current = () => position + (playing ? Date.now() - reference : 0);
  const widget = {
    bind: (name: string, callback: () => void) => {
      events[name] = callback;
    },
    play: () => {
      plays++;
      if (allowPlay && !playing) {
        reference = Date.now();
        playing = true;
      }
      events.PLAY?.();
    },
    pause: () => {
      pauses++;
      position = current();
      playing = false;
      events.PAUSE?.();
    },
    seekTo: (target: number) => {
      seeks.push({ at: Date.now(), target });
      if (ignoreSeeks) return;
      setTimeout(() => {
        position = target;
        reference = Date.now();
        events.SEEK?.();
      }, 700);
    },
    getPosition: (callback: (position: number) => void) => {
      if (!dropCallbacks) callback(current());
    },
    setVolume: () => {},
    load: (_: string, options: { callback: () => void }) => {
      position = 0;
      reference = Date.now();
      playing = false;
      events.READY!();
      events.PLAY!();
      events.PAUSE!();
      setTimeout(options.callback, 1000);
    },
  };
  const Widget = () => widget;
  Widget.Events = Object.fromEntries(
    ['READY', 'PLAY', 'PAUSE', 'PLAY_PROGRESS', 'SEEK', 'FINISH', 'ERROR'].map(
      (x) => [x, x],
    ),
  );
  const context = {
    SC: { Widget },
    document: { getElementById: () => ({ style: {} }) },
    Date,
    Number,
    Math,
    JSON,
    setTimeout,
    clearTimeout,
    setInterval,
    window: {
      ReactNativeWebView: {
        postMessage: (value: string) => messages.push(JSON.parse(value)),
      },
    },
  };
  vm.runInNewContext(`const playerFrame =${script}`, context);
  const advance = (milliseconds: number) => {
    vi.advanceTimersByTime(milliseconds);
  };
  const lastBlocked = () =>
    messages.filter((m) => m.type === 'blocked').at(-1)?.blocked ?? false;
  return {
    messages,
    seeks,
    events,
    advance,
    window: context.window as typeof context.window & BridgeCommands,
    lastBlocked,
    nativePause: widget.pause,
    allow: () => {
      allowPlay = true;
    },
    drop: (value: boolean) => {
      dropCallbacks = value;
    },
    ignore: (value: boolean) => {
      ignoreSeeks = value;
    },
    paused: () => !playing,
    pauses: () => pauses,
    plays: () => plays,
  };
}
const tests: [string, (f: ReturnType<typeof fixture>) => void][] = [
  [
    'natural end does not become an app pause',
    (f) => {
      f.allow();
      f.events.READY!();
      f.window.zoffInitialize(0, true);
      f.advance(7000);
      f.nativePause();
      f.events.FINISH!();
      f.advance(1000);
      assert.equal(
        f.messages.some(
          (m) => m.type === 'playing' && !m.isPlaying && !m.commanded,
        ),
        false,
      );
      assert.ok(f.messages.some((m) => m.type === 'ended'));
    },
  ],
  [
    'manual widget pause still reaches the app',
    (f) => {
      f.allow();
      f.events.READY!();
      f.window.zoffInitialize(0, true);
      f.advance(7000);
      f.nativePause();
      f.advance(1000);
      assert.ok(
        f.messages.some(
          (m) => m.type === 'playing' && !m.isPlaying && !m.commanded,
        ),
      );
    },
  ],
  [
    'blocked startup requires progress, tap recovers before seeking',
    (f) => {
      f.events.READY!();
      f.window.zoffInitialize(60000, true);
      f.advance(constants.progressStartTimeoutMs! + 1000);
      assert.equal(f.lastBlocked(), true);
      assert.equal(f.seeks.length, 0);
      assert.equal(
        f.messages.some((m) => m.type === 'playing' && m.isPlaying),
        false,
      );
      f.allow();
      f.window.zoffRetry(67000);
      assert.equal(f.lastBlocked(), false);
      f.advance(4000);
      assert.ok(f.seeks[0]!.target >= 67000);
      assert.equal(f.lastBlocked(), false);
      assert.equal(f.paused(), false);
    },
  ],
  [
    'rapid resets coalesce and never pause a healthy widget',
    (f) => {
      f.allow();
      f.events.READY!();
      f.window.zoffInitialize(0, true);
      f.advance(4000);
      const before = f.seeks.length;
      const pauses = f.pauses();
      for (let i = 0; i < 20; i++) {
        f.window.zoffReset(30000 + i * 100, true);
        f.advance(100);
      }
      f.advance(5000);
      assert.ok(f.seeks.length - before <= 4);
      assert.equal(f.pauses(), pauses);
      assert.equal(f.lastBlocked(), false);
    },
  ],
  [
    'track load ignores early READY and does not repeat prompt',
    (f) => {
      f.allow();
      f.events.READY!();
      f.window.zoffInitialize(0, true);
      f.advance(4000);
      const ready = f.messages.filter((m) => m.type === 'ready').length;
      f.window.zoffLoad('next', '');
      assert.equal(f.messages.filter((m) => m.type === 'ready').length, ready);
      f.advance(1000);
      assert.equal(
        f.messages.filter((m) => m.type === 'ready').length,
        ready + 1,
      );
      f.window.zoffInitialize(20000, true);
      f.advance(5000);
      assert.equal(f.lastBlocked(), false);
      assert.equal(f.paused(), false);
    },
  ],
  [
    'provider deactivation and return do not show prompt',
    (f) => {
      f.allow();
      f.events.READY!();
      f.window.zoffInitialize(0, true);
      f.advance(4000);
      f.window.zoffSetPlaying(false);
      f.advance(8000);
      assert.equal(f.lastBlocked(), false);
      f.window.zoffReset(40000, true);
      f.advance(5000);
      assert.equal(f.lastBlocked(), false);
      assert.equal(f.paused(), false);
    },
  ],
  [
    'ignored seeks stop after bounded retries',
    (f) => {
      f.ignore(true);
      f.allow();
      f.events.READY!();
      f.window.zoffInitialize(60000, true);
      f.advance(25000);
      assert.ok(f.seeks.length <= 4);
      assert.equal(f.pauses(), 0);
      assert.ok(f.messages.some((m) => m.type === 'position'));
    },
  ],
  [
    'lost position callbacks recover without a stuck pending request',
    (f) => {
      f.allow();
      f.events.READY!();
      f.window.zoffInitialize(0, true);
      f.advance(4000);
      f.drop(true);
      f.advance(constants.progressStartTimeoutMs! + 2000);
      assert.equal(f.lastBlocked(), true);
      f.drop(false);
      f.advance(4000);
      assert.equal(f.lastBlocked(), false);
    },
  ],
  [
    'paused entry remains paused without a retry prompt',
    (f) => {
      f.events.READY!();
      f.window.zoffInitialize(12000, false);
      f.advance(10000);
      assert.equal(f.lastBlocked(), false);
      assert.equal(f.plays(), 0);
      assert.equal(f.paused(), true);
    },
  ],
];
for (const [name, run] of tests) {
  test(name, () => run(fixture()));
}
