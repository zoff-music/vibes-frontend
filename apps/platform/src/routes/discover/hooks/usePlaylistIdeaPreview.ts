import { useEffect, useState } from 'react';

export function usePlaylistIdeaPreview(playing: boolean) {
  // Keep the completed queue visible during SSR and with reduced motion.
  const [step, setStep] = useState(5);

  useEffect(() => {
    if (!playing) {
      return;
    }

    const timer = window.setInterval(() => {
      setStep((current) => (current + 1) % 11);
    }, 700);

    return () => window.clearInterval(timer);
  }, [playing]);

  return {
    count: Math.min(3, Math.max(0, step - 2)),
    generating: step < 5,
  };
}
