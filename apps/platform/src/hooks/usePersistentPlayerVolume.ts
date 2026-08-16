import { safeWrap } from '@vibes/shared';
import { useCallback, useEffect, useRef, useState } from 'react';

const DEFAULT_VOLUME = 100;
const STORAGE_KEY = 'vibes-player-volume';
const AUDIBLE_STORAGE_KEY = 'vibes-player-audible-volume';

interface PersistentPlayerVolume {
  volume: number;
  setVolume: (volume: number) => void;
  toggleMuted: () => void;
}

function normalizeVolume(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_VOLUME;
  return Math.min(100, Math.max(0, Math.round(value)));
}

function readStoredVolume(): number | null {
  if (typeof window === 'undefined') return null;
  const [error, storedVolume] = safeWrap(() =>
    window.localStorage.getItem(STORAGE_KEY),
  );
  if (error || storedVolume === null) return null;

  const parsedVolume = Number(storedVolume);
  if (!Number.isFinite(parsedVolume)) return null;
  return normalizeVolume(parsedVolume);
}

function readLastAudibleVolume(): number {
  if (typeof window === 'undefined') return DEFAULT_VOLUME;
  const [error, storedVolume] = safeWrap(() =>
    window.localStorage.getItem(AUDIBLE_STORAGE_KEY),
  );
  if (error || storedVolume === null) return DEFAULT_VOLUME;

  const parsedVolume = normalizeVolume(Number(storedVolume));
  return parsedVolume > 0 ? parsedVolume : DEFAULT_VOLUME;
}

export function usePersistentPlayerVolume(): PersistentPlayerVolume {
  const [volume, setVolume] = useState(DEFAULT_VOLUME);
  const volumeRef = useRef(volume);
  volumeRef.current = volume;

  useEffect(() => {
    const storedVolume = readStoredVolume();
    if (storedVolume !== null) setVolume(storedVolume);

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) return;
      const nextVolume = readStoredVolume();
      if (nextVolume !== null) setVolume(nextVolume);
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const updateVolume = useCallback((nextVolume: number) => {
    const normalizedVolume = normalizeVolume(nextVolume);
    setVolume(normalizedVolume);
    safeWrap(() =>
      window.localStorage.setItem(STORAGE_KEY, String(normalizedVolume)),
    );
    if (normalizedVolume > 0) {
      safeWrap(() =>
        window.localStorage.setItem(
          AUDIBLE_STORAGE_KEY,
          String(normalizedVolume),
        ),
      );
    }
  }, []);

  const toggleMuted = useCallback(() => {
    if (volumeRef.current === 0) {
      updateVolume(readLastAudibleVolume());
      return;
    }
    updateVolume(0);
  }, [updateVolume]);

  return { volume, setVolume: updateVolume, toggleMuted };
}
