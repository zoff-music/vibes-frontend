import { usePageVisibility } from '@vibes/shared';
import { useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';

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
  'againagainagain',
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

export function useAnimatedPlaceholder(isAIMode: boolean, enabled: boolean) {
  const initialWord = isAIMode ? AI_PROMPTS[0] : ANIMATED_WORDS[0];
  const initialPlaceholder = `${initialWord}...`;
  const [placeholderText, setPlaceholderText] = useState(initialPlaceholder);
  const [wordIndex, setWordIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(initialPlaceholder.length);
  const [isPaused, setIsPaused] = useState(true);
  const [isBlinkerVisible, setIsBlinkerVisible] = useState(true);
  const isTabVisible = usePageVisibility();
  const reducedMotion = useReducedMotion();
  const active = enabled && isTabVisible && !reducedMotion;
  const placeholder = placeholderText
    ? isPaused && !isBlinkerVisible
      ? `${placeholderText.slice(0, -1)} `
      : placeholderText
    : initialPlaceholder;

  useEffect(() => {
    if (!active) {
      return;
    }
    const animatedWords = isAIMode ? AI_PROMPTS : ANIMATED_WORDS;
    const currentWord = animatedWords[wordIndex];
    const fullTarget = `${currentWord}...`;
    const typingDelay = Math.max(10, Math.floor(700 / fullTarget.length));

    if (isPaused) {
      const timer = window.setTimeout(() => {
        setIsPaused(false);
        setCharIndex(0);
        setWordIndex((current) => (current + 1) % animatedWords.length);
      }, 1600);
      return () => window.clearTimeout(timer);
    }

    if (charIndex < fullTarget.length) {
      const timer = window.setTimeout(() => {
        setPlaceholderText(fullTarget.substring(0, charIndex + 1));
        setCharIndex((current) => current + 1);
      }, typingDelay);
      return () => window.clearTimeout(timer);
    }

    setIsPaused(true);
  }, [wordIndex, charIndex, isPaused, active, isAIMode]);

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

  function reset() {
    setPlaceholderText('');
    setWordIndex(0);
    setCharIndex(0);
    setIsPaused(false);
  }

  return { placeholder, reset };
}
