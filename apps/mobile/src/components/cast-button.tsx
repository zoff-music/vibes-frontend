import type { CastingTokenResponse } from '@vibes/models';
import { useFetcher } from '@vibes/native-router';
import { safeWrapAsync } from '@vibes/shared';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  CastButton as NativeCastButton,
  useCastChannel,
} from 'react-native-google-cast';

import { ZoffIcon } from '@/components/zoff-icon';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useRoomSession } from '@/providers/app-provider';
import { useThemePreference } from '@/providers/theme-provider';

const castNamespace = 'urn:x-cast:com.vibez.cast';

export function CastButton() {
  const theme = useAppTheme();
  const [{ resolvedScheme }] = useThemePreference();
  const { roomId } = useRoomSession();
  const { submit } = useFetcher<CastingTokenResponse>({
    params: { roomId },
    routeId: 'cast.$roomId',
  });
  const channel = useCastChannel(castNamespace);

  useEffect(() => {
    if (!channel || !roomId) return;
    const joinRoom = async () => {
      const result = await submit({ intent: 'createToken' });
      if (!result.data) return;
      await safeWrapAsync(
        channel.sendMessage({
          action: 'joinRoom',
          roomId,
          castToken: result.data.token,
          theme: resolvedScheme,
          timestamp: Date.now(),
        }),
      );
    };
    void joinRoom();
  }, [channel, resolvedScheme, roomId, submit]);

  return (
    <View className="size-13 items-center justify-center rounded-xl border border-mobile-border bg-mobile-card/90 active:opacity-65 dark:border-mobile-dark-border dark:bg-mobile-dark-card/90">
      <NativeCastButton
        accessibilityLabel="Cast room"
        style={StyleSheet.absoluteFill}
      />
      <View
        className="absolute inset-0 items-center justify-center rounded-xl bg-mobile-card dark:bg-mobile-dark-card"
        pointerEvents="none"
      >
        <ZoffIcon color={theme.text} name="cast" size={castIconSize} />
      </View>
    </View>
  );
}

const castIconSize = 20;
