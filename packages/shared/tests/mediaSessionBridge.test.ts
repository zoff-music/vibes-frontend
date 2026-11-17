import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createMediaSessionBridge } from '../src/hooks/mediaSessionBridge.ts';

for (const userAgent of ['Chrome/130', 'Firefox/156']) {
  test(`bridge owns and releases media resources for ${userAgent}`, async (t) => {
    const isGecko = userAgent.includes('Firefox/');
    let source: Blob | undefined;
    let revoked = '';
    class AudioStub extends EventTarget {
      volume = 1;
      loop = false;
      preload = '';
      paused = false;
      loaded = false;
      src: string;
      constructor(src: string) {
        super();
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
    const bridge = createMediaSessionBridge(userAgent);
    assert.equal(bridge.audio.src, 'blob:local-media-session');
    assert.equal(bridge.audio.loop, true);
    assert.ok(source);
    const bytes = new Uint8Array(await source.arrayBuffer());
    const header = new DataView(bytes.buffer);
    assert.equal(new TextDecoder().decode(bytes.slice(0, 4)), 'RIFF');
    assert.equal(header.getUint16(34, true), 8);
    assert.equal(header.getUint32(40, true), 64000);
    if (isGecko) {
      assert.ok(bytes.slice(44).some((sample) => sample !== 128));
      assert.ok(
        bytes.slice(44).every((sample) => sample >= 127 && sample <= 129),
      );
      assert.equal(bridge.audio.volume, 0.000001);
      assert.ok((1 / 128) * bridge.audio.volume < 1e-8);
      bridge.audio.volume = 0.5;
      bridge.audio.dispatchEvent(new Event('timeupdate'));
      assert.equal(bridge.audio.volume, 0.000001);
      bridge.audio.pause();
      bridge.audio.volume = 0.5;
      bridge.audio.dispatchEvent(new Event('timeupdate'));
      assert.equal(bridge.audio.volume, 0.5);
    } else {
      assert.ok(bytes.slice(44).every((sample) => sample === 128));
      assert.equal(bridge.audio.volume, 1);
    }
    bridge.dispose();
    assert.equal(bridge.audio.paused, true);
    assert.equal(bridge.audio.src, '');
    assert.equal(revoked, 'blob:local-media-session');
    bridge.audio.volume = 0.5;
    bridge.audio.dispatchEvent(new Event('playing'));
    assert.equal(bridge.audio.volume, 0.5);
  });
}
