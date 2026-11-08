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
      <View className="bg-accent/10 size-16 items-center justify-center rounded-full">
        <ActivityIndicator color={theme.accent} size="large" />
      </View>
      <View className="items-center gap-2">
        <Text className="font-heading text-mobile-text dark:text-mobile-dark-text text-center text-xl">
          {playlistGenerationMessages[messageIndex]}
        </Text>
        <Copy muted>Your playlist will appear here automatically.</Copy>
      </View>
    </Animated.View>
  );
}
