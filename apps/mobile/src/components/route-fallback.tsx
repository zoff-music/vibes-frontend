import { Text, View } from 'react-native';

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
