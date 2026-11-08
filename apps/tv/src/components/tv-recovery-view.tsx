import { NativeButton } from '@vibes/ui/native';
import { Text, View } from 'react-native';

interface Props {
  title: string;
  message: string;
  retry: () => void;
}

export function TvRecoveryView({ title, message, retry }: Props) {
  return (
    <View className="bg-tv-background flex-1 items-center justify-center gap-6 p-12">
      <Text
        accessibilityRole="header"
        className="font-heading text-tv-text text-center text-4xl"
      >
        {title}
      </Text>
      <Text className="font-heading text-tv-muted max-w-2xl text-center text-2xl">
        {message}
      </Text>
      <NativeButton
        shape="pill"
        label="Try again"
        onPress={retry}
        tone="primary"
        preferred
      />
    </View>
  );
}
