import { Text, View } from 'react-native';

export function LoadingScreen() {
  return (
    <View className="bg-mobile-background dark:bg-mobile-dark-background flex-1 items-center justify-center gap-4 p-8">
      <View className="bg-mobile-primary/20 size-14 rounded-full" />
      <Text className="font-heading text-mobile-muted dark:text-mobile-dark-muted text-xl">
        Tuning the signal…
      </Text>
    </View>
  );
}
