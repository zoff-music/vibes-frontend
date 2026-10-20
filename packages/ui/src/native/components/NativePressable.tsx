import { createContext, useContext } from 'react';
import { Pressable, type PressableProps } from 'react-native';

export const NativePressFeedbackContext = createContext<(() => void) | null>(
  null,
);

export function NativePressable({
  onPress,
  disabled,
  ...props
}: PressableProps) {
  const feedback = useContext(NativePressFeedbackContext);
  return (
    <Pressable
      {...props}
      disabled={disabled}
      onPress={(event) => {
        if (disabled || !onPress) return;
        feedback?.();
        onPress(event);
      }}
    />
  );
}
