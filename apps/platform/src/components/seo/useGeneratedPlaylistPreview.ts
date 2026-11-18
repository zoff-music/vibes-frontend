import { useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'preact/compat';

type GenerationPhase =
  | 'typing'
  | 'searching'
  | 'arriving'
  | 'ready'
  | 'resetting';

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

    let delay = 450;

    if (progress.phase === 'typing' && progress.characters > 0) {
      delay = progress.characters === prompt.length ? 450 : 45;
    } else if (progress.phase === 'searching') {
      delay = 1500;
    } else if (progress.phase === 'ready') {
      delay = 3800;
    } else if (progress.phase === 'resetting') {
      delay = 400;
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

        if (current.phase === 'ready') {
          return { ...current, phase: 'resetting' };
        }

        return { phase: 'typing', characters: 0, count: 0 };
      });
    }, delay);

    return () => window.clearTimeout(timer);
  }, [playing, reducedMotion, prompt, progress]);

  // Before it has ever played, show the finished result rather than a blank.
  const idle =
    !playing && progress.phase === 'typing' && progress.characters === 0;
  const complete = reducedMotion || idle;

  return {
    state: {
      phase: complete ? 'ready' : progress.phase,
      prompt: complete ? prompt : prompt.slice(0, progress.characters),
      count: complete ? 3 : progress.count,
      reducedMotion,
    },
  };
}
