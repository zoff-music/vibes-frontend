import { classNames } from '@vibes/shared';
import type { PropsWithChildren } from 'react';
import { useState } from 'react';
import { Pressable, Text } from 'react-native';

interface FocusButtonProps extends PropsWithChildren {
  disabled?: boolean;
  label?: string;
  onPress: () => void;
  preferred?: boolean;
  tone?: 'primary' | 'secondary';
}

export function FocusButton({
  children,
  disabled,
  label,
  onPress,
  preferred,
  tone = 'secondary',
}: FocusButtonProps) {
  const [focused, setFocused] = useState(false);
  return (
    <Pressable
      accessibilityRole="button"
      className={classNames(
        'min-h-16 flex-row items-center justify-center gap-3 rounded-2xl border-2 px-8',
        tone === 'primary' && 'border-primary bg-primary',
        tone === 'secondary' && 'border-tv-border bg-tv-surface',
        focused && 'scale-105 border-accent bg-accent',
        disabled && 'opacity-35',
      )}
      disabled={disabled}
      hasTVPreferredFocus={preferred}
      onBlur={() => setFocused(false)}
      onFocus={() => setFocused(true)}
      onPress={onPress}
    >
      {children}
      {label && (
        <Text
          className={classNames(
            'font-heading text-2xl text-tv-text',
            focused && 'text-tv-background',
          )}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}
