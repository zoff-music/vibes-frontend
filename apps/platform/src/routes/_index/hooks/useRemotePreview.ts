import { usePageVisibility } from '@vibes/shared';
import { useInView, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { queueDemoSongs } from '../../../components/seo/previewSongs';

export function useRemotePreview() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { amount: 0.25 });
  const visible = usePageVisibility();
  const reducedMotion = useReducedMotion();
  const [playing, setPlaying] = useState(true);
  const [playback, setPlayback] = useState({ track: 0, position: 45000 });
  const song = queueDemoSongs[playback.track % queueDemoSongs.length];
  const durationMs = song.duration * 1000;

  useEffect(() => {
    if (!playing || !inView || !visible || reducedMotion) {
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
  }, [playing, inView, visible, reducedMotion, durationMs]);

  return {
    state: { ref, playing, song, durationMs, position: playback.position },
    actions: {
      togglePlayback: () => setPlaying((current) => !current),
      skip: () =>
        setPlayback((current) => ({ track: current.track + 1, position: 0 })),
      seek: (position: number) =>
        setPlayback((current) => ({ ...current, position })),
    },
  };
}
