import { usePageVisibility } from '@vibes/shared';
import { useInView, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { queueDemoPlaylistItems } from '../../../components/seo/preview';

const durations = [2200, 900, 2400, 1000, 2600, 3400, 1200];
const captions = [
  'Everyone brings a song. One queue keeps them together.',
  'Alex adds One more night.',
  'A new find. Everyone sees it arrive.',
  'Mira votes for Streetlight swing.',
  'That vote moves Streetlight swing to the top.',
  'The next song starts for the whole room.',
  'Your friends. Your next favourite song.',
];

export function useQueueDemo() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { amount: 0.3 });
  const visible = usePageVisibility();
  const reduceMotion = useReducedMotion();
  const [phase, setPhase] = useState(0);
  const [paused, setPaused] = useState(false);
  const [voted, setVoted] = useState<string[]>([]);
  const [announcement, setAnnouncement] = useState('');
  const playing = inView && visible && !reduceMotion && !paused;

  useEffect(() => {
    if (!playing) return;

    const timeout = window.setTimeout(() => {
      if (ref.current?.querySelector('ol')?.contains(document.activeElement)) {
        setPaused(true);
        return;
      }

      setPhase((value) => (value + 1) % durations.length);
    }, durations[phase]);

    return () => window.clearTimeout(timeout);
  }, [playing, phase]);

  const advanced = phase >= 5;
  const playlistItems = queueDemoPlaylistItems
    .slice(0, phase >= 2 ? 4 : 3)
    .filter((item) => !advanced || item.id !== 'demo-2')
    .map((item) => ({
      ...item,
      voteCount:
        (item.id === 'demo-1' ? 2 : item.id === 'demo-3' ? 0 : 1) +
        Number(item.id === 'demo-2' && phase >= 4) +
        Number(voted.includes(item.id)),
    }))
    .sort(
      (a, b) =>
        b.voteCount - a.voteCount ||
        Date.parse(b.addedAt) - Date.parse(a.addedAt),
    );

  function vote(id: string) {
    setPaused(true);
    if (voted.includes(id)) {
      setAnnouncement('Your vote is already counted.');
      return;
    }

    setVoted((values) => [...values, id]);
    setAnnouncement('Your vote is in. The queue updates for everyone.');
  }

  return {
    ref,
    state: {
      playing,
      paused,
      reduceMotion,
      phase,
      playlistItems,
      currentItem: advanced
        ? queueDemoPlaylistItems[1]
        : {
            ...queueDemoPlaylistItems[0],
            id: 'demo-playing',
            title: 'The warm-up',
          },
      announcement,
      caption: announcement || captions[phase],
      votingPlaylistItemId: phase === 3 ? 'demo-2' : null,
      step: phase <= 2 ? 0 : phase <= 4 ? 1 : 2,
    },
    actions: {
      vote,
      toggle: () => {
        setAnnouncement('');
        setPaused((value) => !value);
      },
    },
  };
}
