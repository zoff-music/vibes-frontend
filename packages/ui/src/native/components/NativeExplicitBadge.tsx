import { Text, View } from 'react-native';

export function NativeExplicitBadge() {
  return (
    <View className="border-primary/40 bg-primary/10 shrink-0 self-start rounded border px-1.5 py-0.5">
      <Text
        accessibilityLabel="Explicit. This list has been marked for profanity and won't be possible to mark public"
        className="font-heading text-native-text dark:text-native-dark-text text-xs"
      >
        Explicit
      </Text>
    </View>
  );
}
