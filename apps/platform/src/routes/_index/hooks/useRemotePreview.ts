import { usePageVisibility } from '@vibes/shared';
import { useInView, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { queueDemoSongs } from '../../../components/seo/previewSongs';
import { previewPairingCode } from './remotePreviewData';

type PairingPhase = 'entering' | 'connecting' | 'paired';

export function useRemotePreview() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { amount: 0.7 });
  const visible = usePageVisibility();
  const reducedMotion = useReducedMotion();
  const [phase, setPhase] = useState<PairingPhase>('entering');
  const [entered, setEntered] = useState(0);
  const [paused, setPaused] = useState(false);
  const playButtonRef = useRef<HTMLButtonElement>(null);
  const manualPairing = useRef(false);
  const [playing, setPlaying] = useState(true);
  const [playback, setPlayback] = useState({ track: 0, position: 45000 });
  const song = queueDemoSongs[playback.track % queueDemoSongs.length];
  const durationMs = song.duration * 1000;

  useEffect(() => {
    // A requested pairing finishes even if the user scrolls past the player.
    if (
      (!inView && !manualPairing.current) ||
      !visible ||
      reducedMotion ||
      paused ||
      phase === 'paired'
    ) {
      return;
    }

    let delay = 180;
    if (phase === 'connecting') {
      delay = 1100;
    } else if (entered === 0) {
      delay = 1400;
    } else if (entered === previewPairingCode.length) {
      delay = 800;
    }

    const timer = window.setTimeout(() => {
      if (phase === 'connecting') {
        setPhase('paired');
      } else if (entered === previewPairingCode.length) {
        setPhase('connecting');
      } else {
        setEntered((current) => current + 1);
      }
    }, delay);

    return () => window.clearTimeout(timer);
  }, [inView, visible, reducedMotion, paused, phase, entered]);

  useEffect(() => {
    if (
      phase !== 'paired' ||
      !playing ||
      !inView ||
      !visible ||
      reducedMotion
    ) {
      return;
    }

    const timer = window.setInterval(() => {
      setPlayback((current) => {
        if (current.position + 250 >= durationMs) {
          return { track: current.track + 1, position: 0 };
        }

        return { ...current, position: current.position + 250 };
      });
    }, 250);

    return () => window.clearInterval(timer);
  }, [phase, playing, inView, visible, reducedMotion, durationMs]);

  function pair() {
    manualPairing.current = true;
    setEntered(previewPairingCode.length);
    setPaused(false);
    setPhase(reducedMotion ? 'paired' : 'connecting');
  }

  function replayPairing() {
    manualPairing.current = false;
    setPhase('entering');
    setEntered(0);
    setPaused(false);
    setPlaying(true);
    setPlayback({ track: 0, position: 45000 });
  }

  return {
    state: {
      ref,
      playButtonRef,
      phase,
      paused,
      reducedMotion,
      animate: inView && visible && !reducedMotion && !paused,
      code: reducedMotion
        ? previewPairingCode
        : previewPairingCode.slice(0, entered),
      playing,
      song,
      durationMs,
      position: playback.position,
    },
    actions: {
      pair,
      focusControls: () => {
        if (manualPairing.current && playButtonRef.current) {
          playButtonRef.current.focus({ preventScroll: true });
          manualPairing.current = false;
        }
      },
      replayPairing,
      pausePairing: () => setPaused(true),
      togglePairing: () => setPaused((current) => !current),
      togglePlayback: () => setPlaying((current) => !current),
      skip: () =>
        setPlayback((current) => ({ track: current.track + 1, position: 0 })),
      seek: (position: number) =>
        setPlayback((current) => ({ ...current, position })),
    },
  };
}
