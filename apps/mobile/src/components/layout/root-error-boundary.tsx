import { NativePressable as Pressable } from '@vibes/ui/native';
import type { ErrorBoundaryProps } from 'expo-router';
import { Text, View } from 'react-native';

export function ErrorBoundary({ retry }: ErrorBoundaryProps) {
  return (
    <View className="bg-mobile-background dark:bg-mobile-dark-background flex-1 items-center justify-center gap-5 p-8">
      <Text className="font-heading text-mobile-text dark:text-mobile-dark-text text-center text-4xl">
        Zoff needs a restart
      </Text>
      <Text className="font-body text-mobile-muted dark:text-mobile-dark-muted max-w-xl text-center text-lg">
        The app could not recover this screen. Your room is still safe; try
        loading it again.
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
