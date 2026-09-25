import type { RoomMessage } from '@vibes/models';
import { usePageVisibility } from '@vibes/shared';
import { useInView, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

const messages: RoomMessage[] = [
  {
    id: 'hello',
    userId: 'mia',
    name: 'Mia',
    isAdmin: true,
    kind: 'chat',
    text: 'A soundtrack for the ride home?',
    createdAt: 1789848000000,
  },
  {
    id: 'added',
    userId: 'sam',
    name: 'Sam',
    isAdmin: false,
    kind: 'added',
    text: 'Song title 01',
    createdAt: 1789848010000,
  },
  {
    id: 'voted',
    userId: 'lou',
    name: 'Lou',
    isAdmin: false,
    kind: 'voted',
    text: 'Song title 01',
    createdAt: 1789848020000,
  },
  {
    id: 'reply',
    userId: 'lou',
    name: 'Lou',
    isAdmin: false,
    kind: 'chat',
    text: 'Yes. Turn this one up.',
    createdAt: 1789848030000,
  },
  {
    id: 'skipvoted',
    userId: 'sam',
    name: 'Sam',
    isAdmin: false,
    kind: 'skipvoted',
    text: 'Song title 02',
    createdAt: 1789848040000,
  },
  {
    id: 'skipped',
    userId: 'mia',
    name: 'Mia',
    isAdmin: true,
    kind: 'skipped',
    text: 'Song title 02',
    createdAt: 1789848050000,
  },
  {
    id: 'deleted',
    userId: 'mia',
    name: 'Mia',
    isAdmin: true,
    kind: 'deleted',
    text: 'Song title 03',
    createdAt: 1789848060000,
  },
  {
    id: 'renamed',
    userId: 'sam',
    name: 'Sam',
    isAdmin: false,
    kind: 'renamed',
    text: 'Night owl',
    createdAt: 1789848070000,
  },
  {
    id: 'again',
    userId: 'sam',
    name: 'Night owl',
    isAdmin: false,
    kind: 'chat',
    text: 'One more, then home.',
    createdAt: 1789848080000,
  },
];

const durations = [
  1800, 1500, 1500, 1800, 1800, 1800, 1600, 1800, 3200, 4000, 650, 1500,
];

export function useChatPreview() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { amount: 0.3 });
  const visible = usePageVisibility();
  const reducedMotion = useReducedMotion();
  const [phase, setPhase] = useState(0);
  const playing = inView && visible && !reducedMotion;

  useEffect(() => {
    if (!playing) return;
    const timeout = window.setTimeout(() => {
      setPhase((current) => (current + 1) % durations.length);
    }, durations[phase]);
    return () => window.clearTimeout(timeout);
  }, [phase, playing]);

  const count = Math.min(phase + 1, messages.length);

  return {
    ref,
    state: {
      playing,
      reducedMotion,
      branding: !reducedMotion && phase > messages.length,
      chatEnabled: phase < messages.length,
      setChatEnabled: (enabled: boolean) =>
        setPhase(enabled ? 0 : messages.length),
      phase,
      messages: reducedMotion
        ? messages.slice(-5)
        : messages.slice(Math.max(0, count - 5), count),
    },
  };
}
