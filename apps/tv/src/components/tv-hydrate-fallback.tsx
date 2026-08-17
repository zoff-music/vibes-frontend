import { ActivityIndicator, Text, View } from 'react-native';

export function TvHydrateFallback() {
  return (
    <View className="flex-1 items-center justify-center gap-6 bg-tv-background p-12">
      <View className="h-20 w-20 items-center justify-center rounded-3xl border-2 border-primary bg-tv-card">
        <Text className="font-heading text-5xl text-primary">Z</Text>
      </View>
      <Text className="text-center font-heading text-4xl text-tv-text">
        Tuning the TV signal…
      </Text>
      <ActivityIndicator color="#22c7e8" size="large" />
    </View>
  );
}
