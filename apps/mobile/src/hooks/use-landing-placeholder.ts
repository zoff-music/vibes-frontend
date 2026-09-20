import { safeWrapAsync } from '@vibes/shared';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { AccessibilityInfo, AppState } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';
import { triggerSelectionFeedback } from '@/lib/interaction-feedback';

const roomExamples = [
  'electro',
  'afterhours',
  'jazzclub',
  'nightdrive',
  'ambient',
];
const promptExamples = [
  'Jazz after midnight',
  'Synthwave for a night drive',
  'Indie for a rainy afternoon',
  'Disco for the kitchen',
];

export function useLandingPlaceholder(isAIMode: boolean, enabled: boolean) {
  const examples = isAIMode ? promptExamples : roomExamples;
  const [placeholder, setPlaceholder] = useState(examples[0]);
  const [focused, setFocused] = useState(false);
  const [active, setActive] = useState(AppState.currentState === 'active');
  const [screenReader, setScreenReader] = useState(true);
  const reducedMotion = useReducedMotion();

  useFocusEffect(
    useCallback(() => {
      setFocused(true);
      return () => setFocused(false);
    }, []),
  );

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      setActive(state === 'active');
    });
    let mounted = true;
    const readAccessibility = async () => {
      const [error, value] = await safeWrapAsync(
        AccessibilityInfo.isScreenReaderEnabled(),
      );
      if (error || value === null || !mounted) return;
      setScreenReader(value);
    };
    void readAccessibility();
    const readerSubscription = AccessibilityInfo.addEventListener(
      'screenReaderChanged',
      setScreenReader,
    );
    return () => {
      mounted = false;
      subscription.remove();
      readerSubscription.remove();
    };
  }, []);

  useEffect(() => {
    setPlaceholder(examples[0]);
    if (!enabled || !focused || !active || reducedMotion || screenReader)
      return;

    let word = 0;
    let letter = examples[0].length;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      if (letter === examples[word].length) {
        word = (word + 1) % examples.length;
        letter = 0;
      }
      letter += 1;
      setPlaceholder(examples[word].slice(0, letter));
      if (examples[word][letter - 1] !== ' ') {
        void triggerSelectionFeedback();
      }
      timer = setTimeout(tick, letter === examples[word].length ? 3000 : 110);
    };
    timer = setTimeout(tick, 3000);
    return () => clearTimeout(timer);
  }, [examples, enabled, focused, active, reducedMotion, screenReader]);

  return placeholder;
}
