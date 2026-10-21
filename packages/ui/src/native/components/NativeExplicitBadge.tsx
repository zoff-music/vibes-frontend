import { Text, View } from 'react-native';

export function NativeExplicitBadge() {
  return (
    <View className="shrink-0 self-start rounded border border-primary/40 bg-primary/10 px-1.5 py-0.5">
      <Text
        accessibilityLabel="Explicit. This list has been marked for profanity and won't be possible to mark public"
        className="font-heading text-native-text text-xs dark:text-native-dark-text"
      >
        Explicit
      </Text>
    </View>
  );
}
