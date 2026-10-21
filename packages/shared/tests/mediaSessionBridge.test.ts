import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createMediaSessionBridge } from '../src/hooks/mediaSessionBridge.ts';

test('bridge is silent, loops locally, and releases its media resource', async (t) => {
  let source: Blob | undefined;
  let revoked = '';
  class AudioStub {
    loop = false;
    preload = '';
    paused = false;
    loaded = false;
    src: string;
    constructor(src: string) {
      this.src = src;
    }
    pause() {
      this.paused = true;
    }
    removeAttribute(name: string) {
      assert.equal(name, 'src');
      this.src = '';
    }
    load() {
      this.loaded = true;
    }
  }
  const originalAudio = Object.getOwnPropertyDescriptor(globalThis, 'Audio');
  Object.defineProperty(globalThis, 'Audio', {
    configurable: true,
    value: AudioStub,
  });
  t.after(() => {
    if (originalAudio)
      Object.defineProperty(globalThis, 'Audio', originalAudio);
    else Reflect.deleteProperty(globalThis, 'Audio');
  });
  t.mock.method(URL, 'createObjectURL', (blob: Blob) => {
    source = blob;
    return 'blob:local-media-session';
  });
  t.mock.method(URL, 'revokeObjectURL', (url: string) => {
    revoked = url;
  });
  const bridge = createMediaSessionBridge();
  assert.equal(bridge.audio.src, 'blob:local-media-session');
  assert.equal(bridge.audio.loop, true);
  assert.ok(source);
  const bytes = new Uint8Array(await source.arrayBuffer());
  const header = new DataView(bytes.buffer);
  assert.equal(new TextDecoder().decode(bytes.slice(0, 4)), 'RIFF');
  assert.equal(header.getUint16(34, true), 8);
  assert.equal(header.getUint32(40, true), 64000);
  assert.ok(bytes.slice(44).every((sample) => sample === 128));
  bridge.dispose();
  assert.equal(bridge.audio.paused, true);
  assert.equal(bridge.audio.src, '');
  assert.equal(revoked, 'blob:local-media-session');
});
