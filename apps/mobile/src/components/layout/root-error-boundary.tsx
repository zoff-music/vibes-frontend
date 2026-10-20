import { NativePressable as Pressable } from '@vibes/ui/native';
import type { ErrorBoundaryProps } from 'expo-router';
import { Text, View } from 'react-native';

export function ErrorBoundary({ retry }: ErrorBoundaryProps) {
  return (
    <View className="flex-1 items-center justify-center gap-5 bg-mobile-background p-8 dark:bg-mobile-dark-background">
      <Text className="text-center font-heading text-4xl text-mobile-text dark:text-mobile-dark-text">
        Zoff needs a restart
      </Text>
      <Text className="max-w-xl text-center font-body text-lg text-mobile-muted dark:text-mobile-dark-muted">
        The app could not recover this screen. Your room is still safe; try
        loading it again.
      </Text>
      <Pressable
        accessibilityRole="button"
        className="min-h-13 rounded-full bg-mobile-primary px-6 py-4 active:opacity-80"
        onPress={retry}
      >
        <Text className="font-heading text-lg text-mobile-dark-background">
          Try again
        </Text>
      </Pressable>
    </View>
  );
}
