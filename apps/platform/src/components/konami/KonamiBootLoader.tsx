import { lazy, Suspense, useEffect, useState } from 'react';

const KONAMI_SEQUENCE = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'KeyB',
  'KeyA',
] as const;

const MAX_KEY_INTERVAL_MS = 1_800;
type BootPhase = 'idle' | 'booting' | 'enabled';

const RetroBootExperience = lazy(async () => {
  const module = await import('./RetroBootExperience');
  return { default: module.RetroBootExperience };
});

const RetroModeHud = lazy(async () => {
  const module = await import('./RetroBootExperience');
  return { default: module.RetroModeHud };
});

export function KonamiBootLoader() {
  const [phase, setPhase] = useState<BootPhase>('idle');

  useEffect(() => {
    let sequenceIndex = 0;
    let lastKeyAt = 0;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.repeat || event.altKey || event.ctrlKey || event.metaKey)
        return;

      const now = Date.now();
      if (now - lastKeyAt > MAX_KEY_INTERVAL_MS) sequenceIndex = 0;
      lastKeyAt = now;

      const expectedCode = KONAMI_SEQUENCE[sequenceIndex];
      if (event.code === expectedCode) {
        event.preventDefault();
        sequenceIndex += 1;
      } else {
        sequenceIndex = event.code === KONAMI_SEQUENCE[0] ? 1 : 0;
      }

      if (sequenceIndex !== KONAMI_SEQUENCE.length) return;

      sequenceIndex = 0;
      setPhase((currentPhase) => {
        if (currentPhase === 'enabled') return 'idle';
        return 'booting';
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (phase === 'enabled') {
      document.documentElement.dataset.konamiMode = 'retro-boot';
    }
    if (phase !== 'enabled') {
      delete document.documentElement.dataset.konamiMode;
    }

    return () => {
      delete document.documentElement.dataset.konamiMode;
    };
  }, [phase]);

  if (phase === 'idle') return null;

  return (
    <Suspense fallback={null}>
      {phase === 'booting' && (
        <RetroBootExperience onComplete={() => setPhase('enabled')} />
      )}
      {phase === 'enabled' && <RetroModeHud />}
    </Suspense>
  );
}
