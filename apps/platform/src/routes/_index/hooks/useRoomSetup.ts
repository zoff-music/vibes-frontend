import { usePageVisibility } from '@vibes/shared';
import { useInView, useReducedMotion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  type RoomSetupId,
  type RoomSetupSettings,
  roomSetups,
} from './roomSetups';

export function useRoomSetup() {
  const ref = useRef<HTMLFieldSetElement>(null);
  const inView = useInView(ref, { amount: 0.35 });
  const visible = usePageVisibility();
  const reducedMotion = useReducedMotion();
  const [settings, setSettings] = useState(roomSetups[0].settings);
  const [setupId, setSetupId] = useState<RoomSetupId>('adding');
  const [revision, setRevision] = useState(0);
  const [announcement, setAnnouncement] = useState('');
  const cycleElapsed = useRef(0);
  const showingAlternate = useRef(false);
  const active = inView && visible;
  const cycling = active && !reducedMotion;

  const retainSceneFocus = useCallback(() => {
    if (ref.current?.contains(document.activeElement)) {
      ref.current.focus({ preventScroll: true });
    }
  }, []);

  useEffect(() => {
    if (!cycling) return;

    let previous = performance.now();
    const timer = window.setInterval(() => {
      const now = performance.now();
      cycleElapsed.current += Math.min(now - previous, 250);
      previous = now;
      if (cycleElapsed.current < 6000) return;

      cycleElapsed.current = 0;
      retainSceneFocus();
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
  }, [cycling, setupId, retainSceneFocus]);

  function selectSetup(id: RoomSetupId) {
    const setup = roomSetups.find((item) => item.id === id);
    if (!setup) return;

    setSettings(setup.settings);
    setSetupId(id);
    cycleElapsed.current = 0;
    showingAlternate.current = false;
    setRevision((current) => current + 1);
    setAnnouncement(
      `${setup.label} example selected. Change its switch to try a different rule.`,
    );
  }

  function updateSetting(key: keyof RoomSetupSettings, checked: boolean) {
    setSettings((current) => ({ ...current, [key]: checked }));
    cycleElapsed.current = 0;
    showingAlternate.current = key === 'skipAllowed' ? !checked : checked;
    setRevision((current) => current + 1);
    setAnnouncement('');
  }

  function completeAction() {
    cycleElapsed.current = 0;
    retainSceneFocus();
  }

  return {
    state: {
      ref,
      settings,
      setupId,
      revision,
      announcement,
      active,
      reducedMotion: reducedMotion === true,
    },
    actions: {
      selectSetup,
      updateSetting,
      completeAction,
    },
  };
}
