import type { PlaylistItem } from '@vibes/models';
import { usePageVisibility } from '@vibes/shared';
import { useInView, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState } from 'preact/compat';
import {
  queueDemoOpeningArtwork,
  queueDemoPlaylistItems,
  watchDemoPlaylistItems,
} from '../preview';

export type DemoPointerTarget = 'add' | 'search' | 'submit' | 'result' | 'vote';

export type DemoModal = 'closed' | 'empty' | 'typing' | 'results' | 'added';

export type DemoGuest = 'link' | 'room' | 'aim' | 'vote';

type PhaseId =
  | 'listening'
  | 'joinLink'
  | 'joinIn'
  | 'joinMore'
  | 'aimAdd'
  | 'openSearch'
  | 'typing'
  | 'submit'
  | 'results'
  | 'pickResult'
  | 'added'
  | 'lands'
  | 'ownAim'
  | 'ownPress'
  | 'ownVoted'
  | 'guestAim'
  | 'guestVote'
  | 'ending'
  | 'handoff'
  | 'reset';

interface DemoPhase {
  id: PhaseId;
  duration: number;
  caption: string;
  // Elapsed share of the current item over the phase. A new item starts at
  // zero; the bar never runs backwards.
  progress: [number, number];
  pointer?: DemoPointerTarget;
  pressed?: boolean;
  modal?: DemoModal;
  guest?: DemoGuest;
}

// One loop of a real room: a friend opens the link and joins, you add
// something through the room's search, votes move it up on every screen, and
// the most voted item plays next for everyone.
const phases: DemoPhase[] = [
  {
    id: 'listening',
    duration: 2200,
    caption: 'You start a room and share the link.',
    progress: [0.48, 0.5],
  },
  {
    id: 'joinLink',
    duration: 1500,
    caption: 'Mira opens it on her phone…',
    progress: [0.5, 0.52],
    guest: 'link',
  },
  {
    id: 'joinIn',
    duration: 1900,
    caption: '…and she’s in, at the same point in the song.',
    progress: [0.52, 0.54],
    guest: 'room',
  },
  {
    id: 'joinMore',
    duration: 1400,
    caption: 'Lou joins too. No account, no app.',
    progress: [0.54, 0.56],
  },
  {
    id: 'aimAdd',
    duration: 1100,
    caption: 'Anyone can add to the queue.',
    progress: [0.56, 0.57],
    pointer: 'add',
    pressed: true,
  },
  {
    id: 'openSearch',
    duration: 600,
    caption: 'Anyone can add to the queue.',
    progress: [0.57, 0.58],
    pointer: 'search',
    modal: 'empty',
  },
  {
    id: 'typing',
    duration: 1500,
    caption: 'Search by title, or paste a link.',
    progress: [0.58, 0.6],
    pointer: 'search',
    modal: 'typing',
  },
  {
    id: 'submit',
    duration: 800,
    caption: 'Search by title, or paste a link.',
    progress: [0.6, 0.61],
    pointer: 'submit',
    pressed: true,
    modal: 'typing',
  },
  {
    id: 'results',
    duration: 1100,
    caption: 'Pick a result to add it.',
    progress: [0.61, 0.62],
    pointer: 'result',
    modal: 'results',
  },
  {
    id: 'pickResult',
    duration: 700,
    caption: 'Pick a result to add it.',
    progress: [0.62, 0.63],
    pointer: 'result',
    pressed: true,
    modal: 'results',
  },
  {
    id: 'added',
    duration: 1500,
    caption: 'Everyone will hear it soon.',
    progress: [0.63, 0.66],
    modal: 'added',
  },
  {
    id: 'lands',
    duration: 1500,
    caption: 'It lands in the queue for everyone.',
    progress: [0.66, 0.69],
  },
  {
    id: 'ownAim',
    duration: 900,
    caption: 'Like it? Vote it up.',
    progress: [0.69, 0.71],
    pointer: 'vote',
  },
  {
    id: 'ownPress',
    duration: 700,
    caption: 'Like it? Vote it up.',
    progress: [0.71, 0.72],
    pointer: 'vote',
    pressed: true,
  },
  {
    id: 'ownVoted',
    duration: 1600,
    caption: 'Your vote moves it up for everyone.',
    progress: [0.72, 0.75],
    pointer: 'vote',
  },
  {
    id: 'guestAim',
    duration: 1500,
    caption: 'Mira votes from her phone…',
    progress: [0.75, 0.77],
    guest: 'aim',
  },
  {
    id: 'guestVote',
    duration: 2300,
    caption: '…and it jumps to the top on every screen.',
    progress: [0.77, 0.8],
    guest: 'vote',
  },
  {
    id: 'ending',
    duration: 2400,
    caption: 'When it ends…',
    progress: [0.8, 1],
  },
  {
    id: 'handoff',
    duration: 3000,
    caption: '…the most voted plays next, in sync for everyone.',
    progress: [0, 0.03],
  },
  { id: 'reset', duration: 600, caption: '', progress: [0.03, 0.035] },
];

const indexOf = (id: PhaseId) => phases.findIndex((phase) => phase.id === id);
const joinInPhase = indexOf('joinIn');
const joinMorePhase = indexOf('joinMore');
const typingPhase = indexOf('typing');
const addedPhase = indexOf('lands');
const ownVotePhase = indexOf('ownVoted');
const guestVotePhase = indexOf('guestVote');
const handoffPhase = indexOf('handoff');
const resetPhase = indexOf('reset');
const staticPhase = ownVotePhase;

const baseVotes: Record<string, number> = {
  'demo-1': 1,
  'demo-2': 0,
  'demo-4': 0,
};

export function useLiveRoomDemo(watch: boolean) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.4 });
  const visible = usePageVisibility();
  const motionPreference = useReducedMotion();
  const [hydrated, setHydrated] = useState(false);
  const reducedMotion = hydrated && motionPreference === true;
  const [phase, setPhase] = useState(0);
  const [cycle, setCycle] = useState(0);
  const [paused, setPaused] = useState(false);
  const [myVotes, setMyVotes] = useState<string[]>([]);
  const [announcement, setAnnouncement] = useState('');
  const playing = hydrated && inView && visible && !reducedMotion && !paused;
  const shown = reducedMotion ? staticPhase : phase;
  const current = phases[shown];

  useEffect(() => setHydrated(true), []);

  useEffect(() => {
    if (!playing) return;

    const timeout = window.setTimeout(() => {
      if (phase === resetPhase) {
        setMyVotes([]);
        setCycle((value) => value + 1);
        setPhase(0);

        return;
      }

      setPhase(phase + 1);
    }, phases[phase].duration);

    return () => window.clearTimeout(timeout);
  }, [playing, phase]);

  const source = watch ? watchDemoPlaylistItems : queueDemoPlaylistItems;
  const added = source[3];
  const opening: PlaylistItem = {
    ...source[0],
    id: 'demo-playing',
    title: watch ? 'Night drive' : 'The warm-up',
    duration: 214,
    ...(!watch && { thumbnailUrl: queueDemoOpeningArtwork }),
  };
  const votes = (id: string) =>
    baseVotes[id] +
    (id === added.id && shown >= ownVotePhase ? 1 : 0) +
    (id === added.id && shown >= guestVotePhase ? 1 : 0) +
    Number(myVotes.includes(id));
  const items = source
    .filter((item) => item.id in baseVotes)
    .filter((item) => item.id !== added.id || shown >= addedPhase)
    .map((item) => ({ ...item, voteCount: votes(item.id) }))
    .sort(
      (a, b) =>
        b.voteCount - a.voteCount ||
        Date.parse(a.addedAt) - Date.parse(b.addedAt),
    );
  const handedOff = shown >= handoffPhase;
  const ownVote = shown === ownVotePhase && playing;
  const guestVote = shown === guestVotePhase && playing;
  const listeners = shown >= joinMorePhase ? 3 : shown >= joinInPhase ? 2 : 1;

  function vote(id: string) {
    setPaused(true);

    if (myVotes.includes(id)) {
      setAnnouncement('Your vote is already counted.');

      return;
    }

    setMyVotes((values) => [...values, id]);
    setAnnouncement('Vote added. Queue updated.');
  }

  return {
    ref,
    state: {
      cycle,
      phase: shown,
      phaseDuration: current.duration,
      playing,
      paused: paused || reducedMotion,
      userPaused: paused,
      reducedMotion,
      current: handedOff ? items[0] : opening,
      queue: handedOff ? items.slice(1) : items,
      listeners,
      joining: playing && (shown === joinInPhase || shown === joinMorePhase),
      unread: (shown >= addedPhase ? 1 : 0) + (shown >= guestVotePhase ? 1 : 0),
      caption: announcement || current.caption || phases[0].caption,
      announcement,
      progress: current.progress[1],
      previousProgress: current.progress[0],
      guest: playing ? (current.guest ?? null) : null,
      guestVotingId: guestVote ? added.id : null,
      resetting: shown === resetPhase,
      modal: playing ? (current.modal ?? 'closed') : 'closed',
      typing: playing && shown === typingPhase,
      query: added.title.toLowerCase(),
      added,
      pointer: playing ? (current.pointer ?? null) : null,
      pressed: current.pressed === true,
      toast: ownVote ? 'Vote added. Queue updated.' : announcement || null,
      toastKey: ownVote ? `auto-${cycle}` : `mine-${myVotes.length}`,
      votingId: ownVote || guestVote ? added.id : null,
      voteTargetId: added.id,
    },
    actions: {
      vote,
      dismissToast: () => setAnnouncement(''),
      toggle: () => {
        setAnnouncement('');
        setPaused((value) => !value);
      },
    },
  };
}
