import { useRoomRequests } from '@vibes/api';
import { safeWrapAsync } from '@vibes/shared';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import {
  CastButton as NativeCastButton,
  useCastChannel,
} from 'react-native-google-cast';

import { useAppTheme } from '@/hooks/use-app-theme';
import { mobileApi } from '@/lib/api';
import { useApp } from '@/providers/app-provider';

const castNamespace = 'urn:x-cast:com.vibez.cast';

export function CastButton() {
  const roomRequests = useRoomRequests(mobileApi);
  const theme = useAppTheme();
  const colorScheme = useColorScheme();
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
          theme: colorScheme === 'light' ? 'light' : 'dark',
          timestamp: Date.now(),
        }),
      );
    };
    void joinRoom();
  }, [channel, colorScheme, roomId, roomRequests]);

  return (
    <NativeCastButton
      style={{ height: castButtonSize, width: castButtonSize }}
      tintColor={theme.text}
    />
  );
}

const castButtonSize = 48;
