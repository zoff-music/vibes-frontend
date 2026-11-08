import { ActivityIndicator, Text, View } from 'react-native';

export function TvLoadingScreen() {
  return (
    <View className="bg-tv-background flex-1 items-center justify-center gap-6 p-12">
      <View className="border-primary bg-tv-card h-20 w-20 items-center justify-center rounded-3xl border-2">
        <Text className="font-heading text-primary text-5xl">Z</Text>
      </View>
      <Text className="font-heading text-tv-text text-center text-4xl">
        Tuning the TV signal…
      </Text>
      <ActivityIndicator color="#22c7e8" size="large" />
    </View>
  );
}
