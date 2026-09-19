import { usePageVisibility } from '@vibes/shared';
import { useInView, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { queueDemoSongs } from '../../../components/seo/previewSongs';

const durations = [2200, 650, 2600, 900, 3200, 800, 1400];

export function useQueueDemo() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { amount: 0.35 });
  const visible = usePageVisibility();
  const reduceMotion = useReducedMotion();
  const [phase, setPhase] = useState(0);
  const [voted, setVoted] = useState<string[]>([]);
  const [pending, setPending] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const playing = inView && visible && !reduceMotion;

  useEffect(() => {
    if (!playing) {
      return;
    }

    const timeout = window.setTimeout(() => {
      if (phase === 4 && ref.current?.contains(document.activeElement)) {
        ref.current.focus({ preventScroll: true });
      }

      if (phase === durations.length - 1) {
        setVoted([]);
        setPending(null);
        setAnnouncement('');
      }

      setPhase((value) => (value + 1) % durations.length);
    }, durations[phase]);

    return () => window.clearTimeout(timeout);
  }, [playing, phase]);

  useEffect(() => {
    if (!pending) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setVoted((values) => [...values, pending]);
      setPending(null);
      setAnnouncement('Vote added. Queue updated.');
    }, 500);

    return () => window.clearTimeout(timeout);
  }, [pending]);

  const songs = queueDemoSongs
    .slice(0, phase >= 4 ? 4 : 3)
    .map((song) => ({
      ...song,
      voteCount:
        Number((song.id === 'demo-2' && phase >= 2) || song.id === 'demo-4') +
        Number(voted.includes(song.id)),
    }))
    .sort(
      (a, b) =>
        b.voteCount - a.voteCount ||
        Number(b.id === 'demo-4') - Number(a.id === 'demo-4'),
    );

  function vote(id: string) {
    if (pending) {
      return;
    }

    if (voted.includes(id)) {
      setAnnouncement('You have already voted for this song.');
      return;
    }

    setPending(id);
  }

  return {
    state: {
      ref,
      playing,
      reduceMotion,
      phase,
      songs,
      announcement,
      votingSongId: pending ?? (phase === 1 ? 'demo-2' : null),
    },
    actions: { vote },
  };
}
