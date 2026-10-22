import { safeWrap, safeWrapAsync } from '@vibes/shared';
import { useCallback, useEffect, useRef } from 'preact/compat';
import type { Pad } from './beatGameState';

export function useDrumSounds() {
  const context = useRef<AudioContext | null>(null);

  useEffect(
    () => () => {
      if (context.current) void safeWrapAsync(context.current.close());
    },
    [],
  );

  return useCallback((pad: Pad) => {
    if (!context.current) {
      const [error, audio] = safeWrap(() => new AudioContext());
      if (error || !audio) return;
      context.current = audio;
    }
    const audio = context.current;
    if (audio.state === 'suspended') void safeWrapAsync(audio.resume());
    if (audio.state === 'closed') return;
    const now = audio.currentTime;
    const gain = audio.createGain();
    if (pad === 1 || pad === 2) {
      const length = Math.floor(audio.sampleRate * 0.18);
      const buffer = audio.createBuffer(1, length, audio.sampleRate);
      const data = buffer.getChannelData(0);
      for (let index = 0; index < length; index += 1)
        data[index] = Math.random() * 2 - 1;
      const source = audio.createBufferSource();
      const filter = audio.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = pad === 2 ? 7000 : 1200;
      source.buffer = buffer;
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        now + (pad === 2 ? 0.06 : 0.16),
      );
      source.connect(filter);
      filter.connect(gain);
      gain.connect(audio.destination);
      source.start(now);
      source.onended = () => {
        source.disconnect();
        filter.disconnect();
        gain.disconnect();
      };
      return;
    }
    const oscillator = audio.createOscillator();
    const frequencies = [150, 240, 1800, 65];
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequencies[pad], now);
    oscillator.frequency.exponentialRampToValueAtTime(35, now + 0.16);
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    oscillator.connect(gain);
    gain.connect(audio.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.24);
    oscillator.onended = () => {
      oscillator.disconnect();
      gain.disconnect();
    };
  }, []);
}
