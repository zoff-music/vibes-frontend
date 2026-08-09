import { useRoomRequests } from '@vibes/api';
import { safeWrapAsync } from '@vibes/shared';
import { useEffect } from 'react';
import { Pressable } from 'react-native';
import GoogleCast, { useCastChannel } from 'react-native-google-cast';

import { ZoffIcon } from '@/components/zoff-icon';
import { useAppTheme } from '@/hooks/use-app-theme';
import { mobileApi } from '@/lib/api';
import { useApp } from '@/providers/app-provider';
import { useThemePreference } from '@/providers/theme-provider';

const castNamespace = 'urn:x-cast:com.vibez.cast';

export function CastButton() {
  const roomRequests = useRoomRequests(mobileApi);
  const theme = useAppTheme();
  const { resolvedScheme } = useThemePreference();
  const { roomId } = useApp();
  const channel = useCastChannel(castNamespace);

  useEffect(() => {
    if (!channel || !roomId) return;
    const joinRoom = async () => {
      const [tokenError, token] = await roomRequests.createCastingToken(roomId);
      if (tokenError || !token) return;
      await safeWrapAsync(
        channel.sendMessage({
          action: 'joinRoom',
          roomId,
          castToken: token.token,
          theme: resolvedScheme,
          timestamp: Date.now(),
        }),
      );
    };
    void joinRoom();
  }, [channel, resolvedScheme, roomId, roomRequests]);

  return (
    <Pressable
      accessibilityLabel="Cast room"
      accessibilityRole="button"
      className="size-12 items-center justify-center rounded-2xl border border-mobile-border bg-mobile-card/90 active:opacity-65 dark:border-mobile-dark-border dark:bg-mobile-dark-card/90"
      onPress={() => void GoogleCast.showCastDialog()}
    >
      <ZoffIcon color={theme.text} name="cast" size={castIconSize} />
    </Pressable>
  );
}

const castIconSize = 30;
