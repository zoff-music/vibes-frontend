import { usePageVisibility } from '@vibes/shared';
import { useReducedMotion } from 'framer-motion';
import { useCallback, useEffect, useState } from 'preact/compat';

const ANIMATED_WORDS = [
  'electro',
  'おんがく',
  'party',
  'ふんいき',
  'jazz',
  'ゾフ',
  'techno',
  'よる',
  'ambient',
  'おと',
  'house',
  'ゆめ',
  'drumandbass',
  'くうき',
  'hiphop',
  'しんや',
  'rnb',
  'ちょうし',
  'soul',
  'きょうゆう',
  'funk',
  'disco',
  'よいん',
  'rock',
  'しずか',
  'punk',
  'metal',
  'indie',
  'なみ',
  'alternative',
  'pop',
  'かんかく',
  'dance',
  'でんし',
];

const AI_PROMPTS = [
  'sunny indie pop for a weekend road trip',
  'late-night jazz in a quiet city bar',
  'high-energy 2000s dance floor anthems',
  'dreamy shoegaze for watching the rain',
  'funk and soul that keeps a party moving',
  'melodic drum and bass for deep focus',
  'classic hip-hop for a summer cookout',
  'heavy riffs for an intense gym session',
];

const WATCH_WORDS = [
  'afterhours',
  'movieclub',
  'えいが',
  'one-more-video',
  'sunday-cinema',
  'よふかし',
  'front-row',
  'docs-night',
];
const WATCH_PROMPTS = [
  'beautiful places after dark',
  'short films with a twist',
  'a trip through the solar system',
];

export function useAnimatedPlaceholder(
  isAIMode: boolean,
  enabled: boolean,
  watch = false,
) {
  const words = watch ? WATCH_WORDS : ANIMATED_WORDS;
  const prompts = watch ? WATCH_PROMPTS : AI_PROMPTS;
  const initialWord = isAIMode ? prompts[0] : words[0];
  const initialPlaceholder = `${initialWord}...`;
  const [placeholderText, setPlaceholderText] = useState(initialPlaceholder);
  const [wordIndex, setWordIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(initialPlaceholder.length);
  const [isPaused, setIsPaused] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isBlinkerVisible, setIsBlinkerVisible] = useState(true);
  const isTabVisible = usePageVisibility();
  const reducedMotion = useReducedMotion();
  const active = enabled && isTabVisible && !reducedMotion;
  const placeholder = placeholderText
    ? isPaused && !isBlinkerVisible
      ? `${placeholderText.slice(0, -1)} `
      : placeholderText
    : '';

  // Start over with the right list as soon as the experience or mode changes.
  useEffect(() => {
    const first = `${(isAIMode ? prompts : words)[0]}...`;

    setPlaceholderText(first);
    setWordIndex(0);
    setCharIndex(first.length);
    setIsDeleting(false);
    setIsPaused(true);
  }, [isAIMode, prompts, words]);

  useEffect(() => {
    if (!active) {
      return;
    }

    const animatedWords = isAIMode ? prompts : words;
    const currentWord = animatedWords[wordIndex % animatedWords.length];
    const fullTarget = `${currentWord}...`;
    const typingDelay = Math.max(18, Math.floor(700 / fullTarget.length));

    if (isPaused) {
      const timer = window.setTimeout(() => {
        setIsPaused(false);
        setIsDeleting(true);
      }, 1600);

      return () => window.clearTimeout(timer);
    }

    // Backspace the shown word before typing the next one.
    if (isDeleting) {
      if (charIndex > 0) {
        const timer = window.setTimeout(() => {
          setPlaceholderText(fullTarget.substring(0, charIndex - 1));
          setCharIndex((current) => current - 1);
        }, 22);

        return () => window.clearTimeout(timer);
      }

      setIsDeleting(false);
      setWordIndex((current) => (current + 1) % animatedWords.length);

      return;
    }

    if (charIndex < fullTarget.length) {
      const timer = window.setTimeout(() => {
        setPlaceholderText(fullTarget.substring(0, charIndex + 1));
        setCharIndex((current) => current + 1);
      }, typingDelay);

      return () => window.clearTimeout(timer);
    }

    setIsPaused(true);
  }, [
    wordIndex,
    charIndex,
    isPaused,
    isDeleting,
    active,
    isAIMode,
    prompts,
    words,
  ]);

  useEffect(() => {
    if (!active) {
      setIsBlinkerVisible(true);

      return;
    }

    if (!isPaused) {
      setIsBlinkerVisible(true);

      return;
    }

    const interval = window.setInterval(() => {
      setIsBlinkerVisible((current) => !current);
    }, 500);

    return () => window.clearInterval(interval);
  }, [isPaused, active]);

  const reset = useCallback(() => {
    setPlaceholderText('');
    setWordIndex(0);
    setCharIndex(0);
    setIsDeleting(false);
    setIsPaused(false);
  }, []);

  return { placeholder, reset };
}
