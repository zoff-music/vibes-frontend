import { Pressable, Text, View } from 'react-native';

export function HydrateFallback() {
  return (
    <View className="flex-1 items-center justify-center gap-4 bg-mobile-background p-8 dark:bg-mobile-dark-background">
      <View className="size-14 rounded-2xl bg-mobile-primary/20" />
      <Text className="font-heading text-mobile-muted text-xl dark:text-mobile-dark-muted">
        Tuning the signal…
      </Text>
    </View>
  );
}

export function ErrorBoundary({ retry }: { retry: () => void }) {
  return (
    <View className="flex-1 items-center justify-center gap-5 bg-mobile-background p-8 dark:bg-mobile-dark-background">
      <Text className="text-center font-heading text-3xl text-mobile-text dark:text-mobile-dark-text">
        The signal dropped
      </Text>
      <Text className="text-center font-body text-mobile-muted dark:text-mobile-dark-muted">
        Zoff could not load this screen. Check your connection and try again.
      </Text>
      <Pressable
        accessibilityRole="button"
        className="rounded-xl bg-mobile-primary px-6 py-4 active:opacity-80"
        onPress={retry}
      >
        <Text className="font-heading text-lg text-white">Try again</Text>
      </Pressable>
    </View>
  );
}
