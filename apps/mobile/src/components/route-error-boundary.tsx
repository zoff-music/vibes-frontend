import { NativePressable as Pressable } from '@vibes/ui/native';
import { Text, View } from 'react-native';

interface RecoveryProps {
  retry: () => void;
}

export function ErrorBoundary({ retry }: RecoveryProps) {
  return (
    <View className="bg-mobile-background dark:bg-mobile-dark-background flex-1 items-center justify-center gap-5 p-8">
      <Text className="font-heading text-mobile-text dark:text-mobile-dark-text text-center text-3xl">
        The signal dropped
      </Text>
      <Text className="font-body text-mobile-muted dark:text-mobile-dark-muted text-center">
        Zoff could not load this screen. Check your connection and try again.
      </Text>
      <Pressable
        accessibilityRole="button"
        className="bg-mobile-primary min-h-13 rounded-full px-6 py-4 active:opacity-80"
        onPress={retry}
      >
        <Text className="font-heading text-mobile-dark-background text-lg">
          Try again
        </Text>
      </Pressable>
    </View>
  );
}
