import { type ReactNode, useEffect, useRef } from 'preact/compat';
import { useAnimatedPlaceholder } from '../hooks/useAnimatedPlaceholder';

interface HomePlaceholderProps {
  isAIMode: boolean;
  enabled: boolean;
  watch: boolean;
  children: (placeholder: string) => ReactNode;
}

// Keep the typing timer below the page so each letter only updates the form.
export function HomePlaceholder({
  isAIMode,
  enabled,
  watch,
  children,
}: HomePlaceholderProps) {
  const { placeholder, reset } = useAnimatedPlaceholder(
    isAIMode,
    enabled,
    watch,
  );
  const previousMode = useRef(isAIMode);

  useEffect(() => {
    if (previousMode.current === isAIMode) return;

    previousMode.current = isAIMode;
    reset();
  }, [isAIMode, reset]);

  return children(placeholder);
}
