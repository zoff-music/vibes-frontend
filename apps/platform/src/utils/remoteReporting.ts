import { safeWrapAsync, usePlaybackStore } from '@vibes/shared';

export function subscribeRemoteReports(submit: () => Promise<unknown>) {
  let active = true;
  let pending = false;
  let submitting = false;

  const flush = async () => {
    if (!active || !pending || submitting) return;

    pending = false;
    submitting = true;
    await safeWrapAsync(submit());
    submitting = false;

    if (active && pending) queueMicrotask(() => void flush());
  };
  const report = () => {
    pending = true;
    queueMicrotask(() => void flush());
  };

  report();
  window.addEventListener('online', report);
  const unsubscribe = usePlaybackStore.subscribe((state, previous) => {
    if (
      state.isPlaying !== previous.isPlaying ||
      state.currentPlaylistItem?.id !== previous.currentPlaylistItem?.id ||
      state.positionMs !== previous.positionMs ||
      state.resetVersion !== previous.resetVersion
    ) {
      report();
    }
  });

  return () => {
    active = false;
    window.removeEventListener('online', report);
    unsubscribe();
  };
}
