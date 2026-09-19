import { useFetcher } from '@vibes/native-router';
import { classNames } from '@vibes/shared';
import { useKeepAwake } from 'expo-keep-awake';
import { usePathname } from 'expo-router';
import { View } from 'react-native';
import { CastState, useCastState } from 'react-native-google-cast';

import { ProviderPlayer } from '@/components/provider-player';
import { useKeyboardVisible } from '@/hooks/use-keyboard-visible';
import { useLivePosition } from '@/hooks/use-live-position';
import {
  usePlaybackActions,
  usePlaybackSession,
  useRoomActions,
  useRoomSession,
} from '@/providers/app-provider';
import { useRoomPlayerLayout } from '@/providers/room-player-layout-provider';
import type { RoomPlaybackActionData } from '@/routes/rooms.$id.playback/action';

export function PersistentRoomPlayer() {
  const { playback, playbackResetVersion } = usePlaybackSession();
  const { room, roomId } = useRoomSession();
  const {
    observeLocalPlaybackPosition,
    setLocalPlaybackPosition,
    setLocalPlaying,
  } = usePlaybackActions();
  const { setError } = useRoomActions();
  const [, { submit }] = useFetcher<RoomPlaybackActionData>({
    params: { id: roomId },
    routeId: 'rooms.$id.playback',
  });
  const castState = useCastState();
  const pathname = usePathname();
  const [{ active, frame }] = useRoomPlayerLayout();
  const keyboardVisible = useKeyboardVisible();
  const isCasting =
    castState === CastState.CONNECTING || castState === CastState.CONNECTED;
  const visible =
    pathname === '/' &&
    Boolean(room && roomId) &&
    active &&
    Boolean(frame) &&
    !isCasting &&
    !keyboardVisible;
  const livePositionMs = useLivePosition(
    playback?.positionMs ?? 0,
    playback?.isPlaying ?? false,
    playback?.currentSong?.duration ?? 0,
    playback?.serverTimeMs,
  );

  if (!room || !roomId || !frame) return null;

  return (
    <View
      className={classNames(
        'absolute',
        visible && 'z-20 opacity-100',
        !visible && 'z-0 opacity-0',
      )}
      accessibilityElementsHidden={!visible}
      importantForAccessibility={visible ? 'auto' : 'no-hide-descendants'}
      pointerEvents={visible ? 'auto' : 'none'}
      style={{
        left: frame.x,
        top: frame.y,
        width: frame.width,
      }}
    >
      <ProviderPlayer
        horizontalMargin={0}
        availableWidth={frame.width}
        availableHeight={frame.height}
        isGenerating={room.isGenerating}
        onLocalPositionObserved={observeLocalPlaybackPosition}
        onLocalSeek={(positionMs) => {
          if (
            playback?.currentSong?.sourceType !== 'soundcloud' ||
            room.mode === 'server'
          ) {
            setLocalPlaybackPosition(positionMs);
            return;
          }
          const hasAuthority =
            Boolean(room.isAdmin) ||
            (Boolean(room.userId) && room.hostId === room.userId);
          if (!hasAuthority) return;
          const update = async () => {
            const result = await submit({
              action: 'seek',
              intent: 'update',
              positionMs,
            });
            if (result.error) setError(result.error);
          };
          void update();
        }}
        playback={playback}
        positionMs={livePositionMs}
        resetVersion={playbackResetVersion}
        song={playback?.currentSong ?? null}
        suppressPlayback={isCasting}
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
            const result = await submit({
              action: isPlaying ? 'play' : 'pause',
              intent: 'update',
            });
            if (result.error) setError(result.error);
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
