import { usePageVisibility } from '@vibes/shared';
import { useInView, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { queueDemoSongs } from '../../../components/seo/previewSongs';
import { previewPairingCode } from './remotePreviewData';

type PairingPhase = 'entering' | 'connecting' | 'paired';

export function useRemotePreview() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { amount: 0.35 });
  const visible = usePageVisibility();
  const reducedMotion = useReducedMotion();
  const [phase, setPhase] = useState<PairingPhase>('entering');
  const [entered, setEntered] = useState(0);
  const [announcement, setAnnouncement] = useState('');
  const playButtonRef = useRef<HTMLButtonElement>(null);
  const manualPairing = useRef(false);
  const pairedElapsed = useRef(0);
  const [playing, setPlaying] = useState(true);
  const [playback, setPlayback] = useState({ track: 0, position: 45000 });
  const song = queueDemoSongs[playback.track % queueDemoSongs.length];
  const durationMs = song.duration * 1000;
  const animate = inView && visible && !reducedMotion;

  useEffect(() => {
    // A requested pairing finishes even if the user scrolls past the player.
    if (
      (!inView && !manualPairing.current) ||
      !visible ||
      reducedMotion ||
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
        setPlayback({ track: 0, position: 45000 });
        setPlaying(true);
        pairedElapsed.current = 0;
        setPhase('paired');
        if (manualPairing.current) {
          setAnnouncement(
            'Remote paired. The phone now controls the electro player.',
          );
        }
      } else if (entered === previewPairingCode.length) {
        if (ref.current?.contains(document.activeElement)) {
          ref.current.focus({ preventScroll: true });
        }
        setPhase('connecting');
      } else {
        setEntered((current) => current + 1);
      }
    }, delay);

    return () => window.clearTimeout(timer);
  }, [inView, visible, reducedMotion, phase, entered]);

  useEffect(() => {
    if (phase !== 'paired' || !animate) {
      return;
    }

    let previous = performance.now();
    const timer = window.setInterval(() => {
      const now = performance.now();
      const elapsed = Math.min(now - previous, 500);
      previous = now;
      pairedElapsed.current += elapsed;

      if (pairedElapsed.current >= 12000) {
        if (ref.current?.contains(document.activeElement)) {
          ref.current.focus({ preventScroll: true });
        }

        manualPairing.current = false;
        setAnnouncement('');
        setEntered(0);
        setPhase('entering');
        return;
      }

      if (!playing) return;

      setPlayback((current) => {
        if (current.position + elapsed >= durationMs) {
          return { track: current.track + 1, position: 0 };
        }

        return { ...current, position: current.position + elapsed };
      });
    }, 250);

    return () => window.clearInterval(timer);
  }, [phase, playing, animate, durationMs]);

  function pair() {
    manualPairing.current = true;
    setEntered(previewPairingCode.length);
    ref.current?.focus({ preventScroll: true });
    setAnnouncement(
      reducedMotion
        ? 'Remote paired. The phone now controls the electro player.'
        : 'Pairing remote.',
    );
    setPhase(reducedMotion ? 'paired' : 'connecting');
  }

  function togglePlayback() {
    pairedElapsed.current = 0;
    setPlaying((current) => !current);
  }

  function skip() {
    pairedElapsed.current = 0;
    setPlayback((current) => ({ track: current.track + 1, position: 0 }));
  }

  function seek(position: number) {
    pairedElapsed.current = 0;
    setPlayback((current) => ({ ...current, position }));
  }

  return {
    ref,
    playButtonRef,
    state: {
      phase,
      announcement,
      reducedMotion,
      animate,
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
      togglePlayback,
      skip,
      seek,
    },
  };
}
