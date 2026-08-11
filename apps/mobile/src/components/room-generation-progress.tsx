import {
  playlistGenerationMessageIntervalMs,
  playlistGenerationMessages,
} from '@vibes/ui/shared';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { Copy } from '@/components/native';
import { useAppTheme } from '@/hooks/use-app-theme';

export function RoomGenerationProgress() {
  const theme = useAppTheme();
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex(
        (current) => (current + 1) % playlistGenerationMessages.length,
      );
    }, playlistGenerationMessageIntervalMs);
    return () => clearInterval(interval);
  }, []);

  return (
    <Animated.View
      className="flex-1 items-center justify-center gap-4 px-8"
      entering={FadeIn.duration(250)}
    >
      <View className="size-16 items-center justify-center rounded-2xl bg-accent/10">
        <ActivityIndicator color={theme.accent} size="large" />
      </View>
      <View className="items-center gap-2">
        <Text className="text-center font-heading text-mobile-text text-xl dark:text-mobile-dark-text">
          {playlistGenerationMessages[messageIndex]}
        </Text>
        <Copy muted>Your playlist will appear here automatically.</Copy>
      </View>
    </Animated.View>
  );
}
