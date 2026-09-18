import { usePageVisibility } from '@vibes/shared';
import { useInView, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { queueDemoSongs } from '../previewSongs';

interface EmbedPreviewOptions {
  player: boolean;
  playlist: boolean;
  vote: boolean;
  skip: boolean;
  autoplay: boolean;
}

export function useEmbedPreview() {
  const [options, setOptions] = useState<EmbedPreviewOptions>({
    player: true,
    playlist: true,
    vote: true,
    skip: true,
    autoplay: false,
  });
  const [votes, setVotes] = useState<string[]>([]);
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(45000);
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { amount: 0.15 });
  const visible = usePageVisibility();
  const reduceMotion = useReducedMotion();
  const song = queueDemoSongs[current];
  const songs = queueDemoSongs
    .filter((track) => track.id !== song.id)
    .map((track) => ({ ...track, voteCount: Number(votes.includes(track.id)) }))
    .sort((a, b) => b.voteCount - a.voteCount)
    .slice(0, 2);

  useEffect(() => {
    if (!playing || !options.player || !inView || !visible || reduceMotion) {
      return;
    }

    const timer = window.setInterval(() => {
      setPosition((value) => (value + 250) % (song.duration * 1000));
    }, 250);

    return () => window.clearInterval(timer);
  }, [playing, options.player, inView, visible, reduceMotion, song.duration]);

  function changeOption(key: keyof EmbedPreviewOptions, enabled: boolean) {
    setOptions((previous) => ({ ...previous, [key]: enabled }));

    if (key === 'autoplay') {
      setPlaying(enabled && options.player);
    }

    if (key === 'player') {
      setPlaying(enabled && options.autoplay);
    }
  }

  function vote(id: string) {
    setVotes((previous) => {
      if (previous.includes(id)) {
        return previous;
      }

      return [...previous, id];
    });
  }

  function skip() {
    const nextIndex = queueDemoSongs.findIndex(
      (track) => track.id === songs[0].id,
    );

    setCurrent(nextIndex);
    setPosition(0);
    setVotes((previous) => previous.filter((id) => id !== songs[0].id));
  }

  return {
    state: { ref, options, song, songs, playing, position },
    actions: {
      changeOption,
      vote,
      skip,
      togglePlayback: () => setPlaying((value) => !value),
    },
  };
}
