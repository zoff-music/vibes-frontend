import { useEffect, useState } from 'react';
import { queueDemoSongs } from '../../../components/seo/previewSongs';
import type { RoomSetupId, RoomSetupSettings } from './roomSetups';

interface RoomSetupSceneOptions {
  setupId: RoomSetupId;
  settings: RoomSetupSettings;
  active: boolean;
  reducedMotion: boolean;
  manual: boolean;
}

const EXAMPLE_DURATION_MS = 5500;

export function useRoomSetupScene({
  setupId,
  settings,
  active,
  reducedMotion,
  manual,
}: RoomSetupSceneOptions) {
  const [elapsed, setElapsed] = useState(0);
  const [asAdmin, setAsAdmin] = useState(false);
  const complete = reducedMotion || elapsed >= 3000;
  const running = active && !reducedMotion && elapsed < EXAMPLE_DURATION_MS;
  const repeat = setupId === 'repeat';
  const canAdd = !settings.onlyAdminAddSongs || asAdmin;

  useEffect(() => {
    if (setupId !== 'curated' || manual || reducedMotion || asAdmin) return;
    if (elapsed >= 4500) setAsAdmin(true);
  }, [setupId, manual, reducedMotion, asAdmin, elapsed]);

  useEffect(() => {
    if (!running) return;

    // Hold the result until the parent transitions to the next setup.
    let previous = performance.now();
    const timer = window.setInterval(() => {
      const now = performance.now();
      const delta = Math.min(now - previous, 100);
      previous = now;
      setElapsed((current) => Math.min(current + delta, EXAMPLE_DURATION_MS));
    }, 50);

    return () => window.clearInterval(timer);
  }, [running]);

  let currentSong = queueDemoSongs[0];
  let songs = queueDemoSongs.slice(1, 3);
  let positionMs = 45000 + Math.min(elapsed, 3000);
  let caption = 'A friend adds Song title 04.';

  if (setupId === 'curated') {
    songs = queueDemoSongs.slice(1);
    caption = 'A listener tries to skip.';

    if (complete) {
      caption = 'Only admins can skip in this setup.';

      if (settings.skipAllowed && settings.democraticSkip && !asAdmin) {
        caption = 'A skip vote is registered. The song keeps playing.';
      } else if (settings.skipAllowed || asAdmin) {
        currentSong = queueDemoSongs[1];
        songs = queueDemoSongs.slice(2);
        positionMs = 0;
        caption = asAdmin
          ? 'Skipped by an admin. The next song starts.'
          : 'Listeners can skip. The next song starts.';
      }
    }
  }

  if (repeat) {
    songs = queueDemoSongs.slice(1);
    positionMs = 207000 + Math.min(elapsed, 3000);
    caption = 'The current song is about to finish.';

    if (complete) {
      currentSong = queueDemoSongs[1];
      songs = queueDemoSongs.slice(2);
      positionMs = 0;
      caption = 'Played once. Removed from the queue.';

      if (!settings.removeOnPlay) {
        songs = [...songs, queueDemoSongs[0]];
        caption = 'Song title 01 goes back to the end of the queue.';
      }
    }
  } else if (setupId === 'friends' && complete) {
    caption = 'Only admins can add songs in this setup.';

    if (canAdd) {
      songs = [...songs, queueDemoSongs[3]];
      caption = asAdmin
        ? 'Added by an admin. The queue stays in your hands.'
        : 'Song title 04 joins the queue.';
    }
  }

  function actAsAdmin() {
    setAsAdmin(true);
    setElapsed(3000);
  }

  return {
    state: {
      currentSong,
      songs,
      positionMs,
      caption,
      complete,
      asAdmin,
      blocked:
        complete &&
        !asAdmin &&
        ((setupId === 'friends' && !canAdd) ||
          (setupId === 'curated' && !settings.skipAllowed)),
    },
    actions: { actAsAdmin },
  };
}
