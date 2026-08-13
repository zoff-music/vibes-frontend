const PLAYBACK_GESTURE_EVENT = 'vibes:playback-gesture-unlocked';

export function isPlaybackGestureUnlocked(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  return (
    window.document.documentElement.dataset.playbackGestureUnlocked === 'true'
  );
}

export function markPlaybackGestureUnlocked(): void {
  if (typeof window === 'undefined') return;

  window.document.documentElement.dataset.playbackGestureUnlocked = 'true';
  window.dispatchEvent(new Event(PLAYBACK_GESTURE_EVENT));
}

export function subscribeToPlaybackGestureUnlock(
  listener: () => void,
): () => void {
  if (typeof window === 'undefined') return () => {};

  window.addEventListener(PLAYBACK_GESTURE_EVENT, listener);
  return () => {
    window.removeEventListener(PLAYBACK_GESTURE_EVENT, listener);
  };
}
