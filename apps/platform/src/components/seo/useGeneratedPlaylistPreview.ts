import { useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';

type GenerationPhase = 'typing' | 'searching' | 'arriving' | 'ready';

interface GenerationProgress {
  phase: GenerationPhase;
  characters: number;
  count: number;
}

export function useGeneratedPlaylistPreview(prompt: string, playing: boolean) {
  const motionPreference = useReducedMotion();
  const [hydrated, setHydrated] = useState(false);
  const reducedMotion = hydrated && motionPreference === true;
  const [progress, setProgress] = useState<GenerationProgress>({
    phase: 'typing',
    characters: 0,
    count: 0,
  });

  // Match the server's first frame before applying the browser preference.
  useEffect(() => setHydrated(true), []);

  useEffect(() => {
    if (!playing || reducedMotion) {
      return;
    }

    let delay = 700;
    if (progress.phase === 'typing' && progress.characters > 0) {
      delay = progress.characters === prompt.length ? 650 : 65;
    } else if (progress.phase === 'searching') {
      delay = 2600;
    } else if (progress.phase === 'ready') {
      delay = 5000;
    }

    const timer = window.setTimeout(() => {
      setProgress((current) => {
        if (current.phase === 'typing') {
          if (current.characters < prompt.length) {
            return { ...current, characters: current.characters + 1 };
          }

          return { ...current, phase: 'searching' };
        }

        if (current.phase === 'searching') {
          return { ...current, phase: 'arriving', count: 1 };
        }

        if (current.phase === 'arriving') {
          const count = current.count + 1;
          return {
            ...current,
            count,
            phase: count === 3 ? 'ready' : 'arriving',
          };
        }

        return { phase: 'typing', characters: 0, count: 0 };
      });
    }, delay);

    return () => window.clearTimeout(timer);
  }, [playing, reducedMotion, prompt, progress]);

  return {
    state: {
      phase: reducedMotion ? 'ready' : progress.phase,
      prompt: reducedMotion ? prompt : prompt.slice(0, progress.characters),
      count: reducedMotion ? 3 : progress.count,
      reducedMotion,
    },
  };
}
