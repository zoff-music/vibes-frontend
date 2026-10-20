import { classNames } from '@vibes/shared';
import { NativePressable as Pressable } from '@vibes/ui/native';
import { Text } from 'react-native';

interface TabButtonProps {
  label: string;
  selected: boolean;
  count?: number;
  onPress: () => void;
}

export function TabButton({ label, selected, count, onPress }: TabButtonProps) {
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected }}
      onPress={onPress}
      className={classNames(
        'min-h-13 flex-1 flex-row items-center justify-center gap-2 rounded-full border px-4 py-3 active:scale-95 active:border-accent active:bg-accent/30 active:opacity-80',
        selected && 'border-accent bg-accent',
        !selected &&
          'border-mobile-border bg-mobile-card dark:border-mobile-dark-border dark:bg-mobile-dark-card',
      )}
    >
      <Text
        className={classNames(
          'font-heading text-lg',
          selected
            ? 'text-mobile-dark-background'
            : 'text-mobile-text dark:text-mobile-dark-text',
        )}
      >
        {label}
      </Text>
      {count !== undefined && (
        <Text
          className={classNames(
            'font-heading text-lg',
            selected
              ? 'text-mobile-dark-background'
              : 'text-mobile-text dark:text-mobile-dark-text',
          )}
        >
          {count}
        </Text>
      )}
    </Pressable>
  );
}
