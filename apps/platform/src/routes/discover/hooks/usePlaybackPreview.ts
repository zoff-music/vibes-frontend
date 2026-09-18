import { useEffect, useState } from 'react';

const durationMs = 12000;

export function usePlaybackPreview(hostMode: boolean, playing: boolean) {
  const [clock, setClock] = useState({
    track: 0,
    position: hostMode ? 0 : 9000,
    tick: 0,
  });
  const [manualPause, setManualPause] = useState(false);
  const phase = clock.tick % 10000;
  const hostPause = hostMode && phase >= 2000 && phase < 4000;

  useEffect(() => {
    if (!playing || manualPause) return;
    const timer = window.setInterval(() => {
      setClock((current) => {
        const phase = current.tick % 10000;
        const tick = current.tick + 250;
        if (hostMode && phase < 7000 && tick % 10000 >= 7000) {
          return { track: current.track + 1, position: 0, tick };
        }
        const paused = hostMode && phase >= 2000 && phase < 4000;
        const position = current.position + (paused ? 0 : 250);
        if (position >= durationMs)
          return { track: current.track + 1, position: 0, tick };
        return { ...current, position, tick };
      });
    }, 250);
    return () => window.clearInterval(timer);
  }, [playing, manualPause, hostMode]);

  function togglePlayback() {
    if (hostPause) {
      setClock((current) => ({
        ...current,
        tick: Math.floor(current.tick / 10000) * 10000 + 4000,
      }));
      setManualPause(false);
      return;
    }
    setManualPause((value) => !value);
  }

  function skip() {
    setClock((current) => ({ track: current.track + 1, position: 0, tick: 0 }));
  }

  return {
    state: { ...clock, durationMs, isPlaying: !manualPause && !hostPause },
    actions: { togglePlayback, skip },
  };
}
