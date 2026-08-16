import { lazy, Suspense, useEffect, useState } from 'react';
import { konamiModeCookieName } from './constants';

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
type BootPhase = 'idle' | 'booting';

const RetroBootExperience = lazy(async () => {
  const module = await import('@vibes/ui/konami/boot');
  return { default: module.RetroBootExperience };
});

interface KonamiBootLoaderProps {
  enabled: boolean;
}

function setKonamiCookie(enabled: boolean) {
  const isSecure = window.location.protocol === 'https:';
  const cookieValue = enabled
    ? `${konamiModeCookieName}=enabled; Path=/; Max-Age=31536000; SameSite=Lax${isSecure ? '; Secure' : ''}`
    : `${konamiModeCookieName}=; Path=/; Max-Age=0; SameSite=Lax${isSecure ? '; Secure' : ''}`;
  Reflect.set(document, 'cookie', cookieValue);
}

export function KonamiBootLoader({ enabled }: KonamiBootLoaderProps) {
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
      if (enabled) {
        setKonamiCookie(false);
        window.location.reload();
        return;
      }
      setPhase('booting');
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled]);

  if (phase === 'idle') return null;

  return (
    <Suspense fallback={null}>
      <RetroBootExperience
        onComplete={() => {
          setKonamiCookie(true);
          window.location.reload();
        }}
      />
    </Suspense>
  );
}
