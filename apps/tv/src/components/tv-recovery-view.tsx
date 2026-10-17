import { NativeButton } from '@vibes/ui/native';
import { Text, View } from 'react-native';

interface Props {
  title: string;
  message: string;
  retry: () => void;
}

export function TvRecoveryView({ title, message, retry }: Props) {
  return (
    <View className="flex-1 items-center justify-center gap-6 bg-tv-background p-12">
      <Text
        accessibilityRole="header"
        className="text-center font-heading text-4xl text-tv-text"
      >
        {title}
      </Text>
      <Text className="max-w-2xl text-center font-heading text-2xl text-tv-muted">
        {message}
      </Text>
      <NativeButton
        label="Try again"
        onPress={retry}
        tone="primary"
        preferred
      />
    </View>
  );
}
