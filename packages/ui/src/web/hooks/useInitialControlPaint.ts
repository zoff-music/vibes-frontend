import { useEffect } from 'preact/hooks';

export function useInitialControlPaint() {
  useEffect(() => {
    const root = document.documentElement;
    let frame = requestAnimationFrame(() => {
      // Let the hydrated controls paint their final styles before enabling transitions.
      frame = requestAnimationFrame(() => {
        root.dataset.controlsPainted = 'true';
      });
    });

    return () => {
      cancelAnimationFrame(frame);
    };
  }, []);
}
