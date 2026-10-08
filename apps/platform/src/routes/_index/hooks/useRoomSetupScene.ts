import { useEffect, useState } from 'react';
import { queueDemoPlaylistItems } from '../../../components/seo/preview';
import type { RoomSetupId, RoomSetupSettings } from './roomSetups';

interface RoomSetupSceneOptions {
  setupId: RoomSetupId;
  settings: RoomSetupSettings;
  active: boolean;
  reducedMotion: boolean;
}

const ACTION_TIME_MS = 2400;
const SETTLE_TIME_MS = 3000;

export function useRoomSetupScene({
  setupId,
  settings,
  active,
  reducedMotion,
}: RoomSetupSceneOptions) {
  const [elapsed, setElapsed] = useState(0);
  const [requested, setRequested] = useState(false);
  const complete = requested || (!reducedMotion && elapsed >= ACTION_TIME_MS);
  const advanced = complete && elapsed >= SETTLE_TIME_MS;
  const running = active && !reducedMotion && elapsed < SETTLE_TIME_MS;
  const blocked =
    (setupId === 'adding' && settings.onlyAdminAddPlaylistItems) ||
    (setupId === 'skipping' && !settings.skipAllowed);
  const changedPlaylistItem = advanced && !blocked && setupId !== 'adding';
  const currentPlaylistItem =
    queueDemoPlaylistItems[changedPlaylistItem ? 1 : 0];
  const positionMs = changedPlaylistItem
    ? 0
    : setupId === 'repeating'
      ? 207600 + Math.min(elapsed, ACTION_TIME_MS)
      : 45000 + Math.min(elapsed, ACTION_TIME_MS);

  useEffect(() => {
    if (!running) return;

    let previous = performance.now();
    const timer = window.setInterval(() => {
      const now = performance.now();
      const delta = Math.min(now - previous, 250);
      previous = now;
      setElapsed((current) => Math.min(current + delta, SETTLE_TIME_MS));
    }, 250);

    return () => window.clearInterval(timer);
  }, [running]);

  let caption = 'Tap the song to add it.';

  if (setupId === 'adding' && complete) {
    caption = blocked ? 'Only admins can add songs.' : 'Added to the queue.';
  }

  if (setupId === 'skipping') {
    caption = settings.skipAllowed
      ? 'Try skipping as a listener.'
      : 'Skipping is locked to admins.';
    if (changedPlaylistItem)
      caption = 'Streetlight swing is playing for everyone.';
  }

  if (setupId === 'repeating') {
    caption = 'Finish the song to try it.';
    if (advanced) {
      caption = settings.removeOnPlay
        ? 'Finished and removed.'
        : 'Back in the queue.';
    }
  }

  function performAction() {
    setRequested(true);
    setElapsed(SETTLE_TIME_MS);
  }

  return {
    state: {
      currentPlaylistItem,
      positionMs,
      caption,
      complete,
      advanced,
      blocked,
      changedPlaylistItem,
      requested,
    },
    actions: { performAction },
  };
}
