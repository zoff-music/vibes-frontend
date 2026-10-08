import { usePageVisibility } from '@vibes/shared';
import { useInView, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { queueDemoPlaylistItems } from '../../../components/seo/preview';

const durations = [2800, 3000, 2200, 2800, 4000];
const captions = [
  'Scan the player’s code to pair your phone.',
  'Connected. The sound stays on the player.',
  'Pause on your phone. The player pauses too.',
  'Press play and pick up where you left off.',
  'Skip from the sofa. The player moves to the next song.',
];

export function useRemotePreview() {
  const ref = useRef<HTMLElement>(null);
  const playButtonRef = useRef<HTMLButtonElement>(null);
  const pairRequested = useRef(false);
  const inView = useInView(ref, { amount: 0.3 });
  const visible = usePageVisibility();
  const reducedMotion = useReducedMotion();
  const [phase, setPhase] = useState(0);
  const [paused, setPaused] = useState(false);
  const [manual, setManual] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [position, setPosition] = useState(45000);
  const [track, setTrack] = useState(0);
  const [announcement, setAnnouncement] = useState('');
  const animate = inView && visible && !reducedMotion && !paused;
  const paired = phase > 0 || manual;
  const playing = !userPaused && (manual || phase !== 2);
  const playlistItem =
    queueDemoPlaylistItems[track % queueDemoPlaylistItems.length];

  useEffect(() => {
    if (!paired || !pairRequested.current) return;

    pairRequested.current = false;
    playButtonRef.current?.focus({ preventScroll: true });
  }, [paired]);

  useEffect(() => {
    if (!animate || manual) return;

    const timer = window.setTimeout(() => {
      const next = (phase + 1) % durations.length;
      setPhase(next);
      if (next === 4) {
        setTrack((current) => current + 1);
        setPosition(0);
      }
      if (next === 0) {
        setTrack(0);
        setPosition(45000);
      }
    }, durations[phase]);

    return () => window.clearTimeout(timer);
  }, [phase, animate, manual]);

  useEffect(() => {
    if (!animate || !playing) return;

    const timer = window.setInterval(() => {
      setPosition((current) =>
        Math.min(current + 250, playlistItem.duration * 1000),
      );
    }, 250);

    return () => window.clearInterval(timer);
  }, [animate, playing, playlistItem.duration]);

  function togglePlayback() {
    setManual(true);
    setUserPaused(playing);
    setAnnouncement(
      playing
        ? 'Paused from your phone. Both screens update.'
        : 'Playing again on the paired player.',
    );
  }

  return {
    ref,
    playButtonRef,
    state: {
      paired,
      phase,
      paused,
      reducedMotion,
      animate,
      playing,
      playlistItem,
      durationMs: playlistItem.duration * 1000,
      position,
      caption: announcement || captions[phase],
      announcement,
    },
    actions: {
      toggle: () => setPaused((current) => !current),
      pair: () => {
        pairRequested.current = true;
        setManual(true);
        setAnnouncement('Connected. Try the controls on the phone.');
      },
      togglePlayback,
      skip: () => {
        setManual(true);
        setTrack((current) => current + 1);
        setPosition(0);
        setAnnouncement('Skipped from your phone. The player follows.');
      },
      seek: (next: number) => {
        setManual(true);
        setPosition(next);
        setAnnouncement('Playback position updated on the player.');
      },
    },
  };
}
