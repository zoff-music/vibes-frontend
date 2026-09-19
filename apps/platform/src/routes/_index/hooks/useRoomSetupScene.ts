import { useEffect, useState } from 'react';
import { queueDemoSongs } from '../../../components/seo/previewSongs';
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
    (setupId === 'adding' && settings.onlyAdminAddSongs) ||
    (setupId === 'skipping' && !settings.skipAllowed);
  const changedSong = advanced && !blocked && setupId !== 'adding';
  const currentSong = queueDemoSongs[changedSong ? 1 : 0];
  const positionMs = changedSong
    ? 0
    : setupId === 'repeating'
      ? 207600 + Math.min(elapsed, ACTION_TIME_MS)
      : 45000 + Math.min(elapsed, ACTION_TIME_MS);

  useEffect(() => {
    if (!running) return;

    let previous = performance.now();
    const timer = window.setInterval(() => {
      const now = performance.now();
      const delta = Math.min(now - previous, 100);
      previous = now;
      setElapsed((current) => Math.min(current + delta, SETTLE_TIME_MS));
    }, 50);

    return () => window.clearInterval(timer);
  }, [running]);

  let caption = 'Tap the song to add it as a listener.';

  if (setupId === 'adding' && complete) {
    caption = blocked
      ? 'Only admins can add. The queue stays as it was.'
      : 'Song title 02 joins the queue.';
  }

  if (setupId === 'skipping') {
    caption = settings.skipAllowed
      ? 'Listeners can skip. Try the skip button.'
      : 'Skip is disabled for listeners. Admins keep control.';
    if (changedSong) caption = 'Skipped. Song title 02 is playing.';
  }

  if (setupId === 'repeating') {
    caption = 'What happens when Song title 01 ends?';
    if (advanced) {
      caption = settings.removeOnPlay
        ? 'Song title 01 is removed after playing.'
        : 'Song title 01 returns to the queue.';
    }
  }

  function performAction() {
    setRequested(true);
    setElapsed(SETTLE_TIME_MS);
  }

  return {
    state: {
      currentSong,
      positionMs,
      caption,
      complete,
      advanced,
      blocked,
      changedSong,
    },
    actions: { performAction },
  };
}
