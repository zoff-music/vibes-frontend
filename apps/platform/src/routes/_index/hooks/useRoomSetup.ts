import { usePageVisibility } from '@vibes/shared';
import { useInView, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import {
  type RoomSetupId,
  type RoomSetupSettings,
  roomSetups,
} from './roomSetups';

export function useRoomSetup() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.75 });
  const visible = usePageVisibility();
  const reducedMotion = useReducedMotion();
  const [settings, setSettings] = useState(roomSetups[0].settings);
  const [setupId, setSetupId] = useState<RoomSetupId>('adding');
  const [revision, setRevision] = useState(0);
  const [announcement, setAnnouncement] = useState('');
  const [paused, setPaused] = useState(false);
  const [manual, setManual] = useState(false);
  const cycleElapsed = useRef(0);
  const showingAlternate = useRef(false);
  const active = inView && visible;
  const cycling = active && !paused && !manual && !reducedMotion;

  useEffect(() => {
    if (!cycling) return;

    let previous = performance.now();
    const timer = window.setInterval(() => {
      const now = performance.now();
      cycleElapsed.current += Math.min(now - previous, 250);
      previous = now;
      if (cycleElapsed.current < 6000) return;

      cycleElapsed.current = 0;
      if (!showingAlternate.current) {
        showingAlternate.current = true;
        setSettings((current) => ({
          ...current,
          onlyAdminAddSongs: setupId === 'adding' || current.onlyAdminAddSongs,
          skipAllowed: setupId !== 'skipping' && current.skipAllowed,
          removeOnPlay: setupId === 'repeating' || current.removeOnPlay,
        }));
        setRevision((current) => current + 1);
        return;
      }

      showingAlternate.current = false;
      const index = roomSetups.findIndex((setup) => setup.id === setupId);
      const next = roomSetups[(index + 1) % roomSetups.length];
      setSettings(next.settings);
      setSetupId(next.id);
      setRevision((current) => current + 1);
    }, 200);

    return () => window.clearInterval(timer);
  }, [cycling, setupId]);

  function selectSetup(id: RoomSetupId) {
    const setup = roomSetups.find((item) => item.id === id);
    if (!setup) return;

    setSettings(setup.settings);
    setSetupId(id);
    setManual(true);
    setPaused(false);
    cycleElapsed.current = 0;
    showingAlternate.current = false;
    setRevision((current) => current + 1);
    setAnnouncement(
      `${setup.label} example selected. Change its switch to try a different rule.`,
    );
  }

  function updateSetting(key: keyof RoomSetupSettings, checked: boolean) {
    setSettings((current) => ({ ...current, [key]: checked }));
    setManual(true);
    setPaused(false);
    setRevision((current) => current + 1);
    setAnnouncement('');
  }

  function replay() {
    setRevision((current) => current + 1);
    setManual(false);
    setPaused(false);
    cycleElapsed.current = 0;
    showingAlternate.current =
      (setupId === 'adding' && settings.onlyAdminAddSongs) ||
      (setupId === 'skipping' && !settings.skipAllowed) ||
      (setupId === 'repeating' && settings.removeOnPlay);
  }

  function takeControl() {
    setManual(true);
  }

  function togglePlayback() {
    if (paused) {
      setPaused(false);
      return;
    }

    if (manual) {
      replay();
      return;
    }

    setPaused(true);
  }

  return {
    state: {
      ref,
      settings,
      setupId,
      revision,
      announcement,
      active: active && !paused && !manual,
      paused: paused || manual,
      manual,
      reducedMotion: reducedMotion === true,
    },
    actions: {
      selectSetup,
      updateSetting,
      replay,
      takeControl,
      togglePlayback,
    },
  };
}
