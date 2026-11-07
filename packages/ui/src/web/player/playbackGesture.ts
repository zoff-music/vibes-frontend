import { safeWrapAsync } from '@vibes/shared';

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

// 10 ms of 8-bit silence: enough for the browser to evaluate its autoplay policy.
const SILENT_WAV =
  'data:audio/wav;base64,UklGRnQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YVAAAACAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgA==';

interface AutoplayPolicyNavigator {
  getAutoplayPolicy: (type: 'mediaelement') => string;
}

function hasAutoplayPolicy(
  navigator: Navigator,
): navigator is Navigator & AutoplayPolicyNavigator {
  return 'getAutoplayPolicy' in navigator;
}

/** Whether this document may start audible playback without a new user gesture. */
export async function canAutoplayAudibly(): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  if (window.navigator.userActivation?.hasBeenActive) return true;

  if (hasAutoplayPolicy(window.navigator)) {
    return window.navigator.getAutoplayPolicy('mediaelement') === 'allowed';
  }

  const audio = new Audio(SILENT_WAV);
  const [error] = await safeWrapAsync(audio.play());
  audio.pause();
  audio.removeAttribute('src');

  return !error;
}
