import { useRoomRequests } from '@vibes/api';
import { useKeepAwake } from 'expo-keep-awake';
import { usePathname } from 'expo-router';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ProviderPlayer } from '@/components/provider-player';
import { getRequestErrorMessage, mobileApi } from '@/lib/api';
import { useApp } from '@/providers/app-provider';

export function PersistentRoomPlayer() {
  const {
    observeLocalPlaybackPosition,
    playback,
    playbackResetVersion,
    refresh,
    room,
    roomId,
    setError,
    setLocalPlaybackPosition,
    setLocalPlaying,
  } = useApp();
  const roomRequests = useRoomRequests(mobileApi);
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const visible = pathname === '/' && Boolean(room && roomId);

  if (!room || !roomId) return null;

  return (
    <View
      pointerEvents={visible ? 'auto' : 'none'}
      style={{
        left: 0,
        opacity: visible ? 1 : 0,
        position: 'absolute',
        right: 0,
        top: visible ? insets.top + playerHeaderHeight : 0,
        zIndex: visible ? playerZIndex : 0,
      }}
    >
      <ProviderPlayer
        isGenerating={room.isGenerating}
        onLocalPositionObserved={observeLocalPlaybackPosition}
        onLocalSeek={setLocalPlaybackPosition}
        playback={playback}
        resetVersion={playbackResetVersion}
        song={playback?.currentSong ?? null}
        synchronizePosition={room.mode === 'host'}
        onLocalPlayingChange={(isPlaying) => {
          if (room.mode === 'server') {
            setLocalPlaying(isPlaying);
            return;
          }
          const hasAuthority =
            Boolean(room.isAdmin) ||
            (Boolean(room.userId) && room.hostId === room.userId);
          if (!hasAuthority || playback?.isPlaying === isPlaying) return;
          const update = async () => {
            const [requestError] = await roomRequests.updatePlayback(
              roomId,
              isPlaying ? 'play' : 'pause',
            );
            if (requestError) {
              setError(
                await getRequestErrorMessage(
                  requestError,
                  'Could not update playback.',
                ),
              );
              return;
            }
            await refresh();
          };
          void update();
        }}
      />
    </View>
  );
}

export function ActiveRoomKeepAwake() {
  useKeepAwake('zoff-active-room');
  return null;
}

export const playerHeaderHeight = 76;

const playerZIndex = 20;
