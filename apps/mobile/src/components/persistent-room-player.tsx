import { createRoomPlaybackRequests } from '@vibes/api';
import { useKeepAwake } from 'expo-keep-awake';
import { usePathname } from 'expo-router';
import { Platform, View } from 'react-native';
import { CastState, useCastState } from 'react-native-google-cast';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ProviderPlayer } from '@/components/provider-player';
import { useLivePosition } from '@/hooks/use-live-position';
import {
  tabletLandscapePagePadding,
  tabletPlayerTopOffset,
  tabletRoomHeaderHeight,
  useTabletLandscapeLayout,
} from '@/hooks/use-tablet-landscape-layout';
import { getRequestErrorMessage, mobileApi } from '@/lib/api';
import { useApp } from '@/providers/app-provider';

const playbackRequests = createRoomPlaybackRequests(mobileApi);

export function PersistentRoomPlayer() {
  const {
    observeLocalPlaybackPosition,
    playback,
    playbackResetVersion,
    room,
    roomId,
    setError,
    setLocalPlaybackPosition,
    setLocalPlaying,
  } = useApp();
  const castState = useCastState();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const tabletLayout = useTabletLandscapeLayout();
  const isCasting =
    castState === CastState.CONNECTING || castState === CastState.CONNECTED;
  const visible = pathname === '/' && Boolean(room && roomId) && !isCasting;
  const topInset =
    Platform.OS === 'android' && tabletLayout.isTabletLandscape
      ? androidTabletPlayerTopInset
      : insets.top;
  const livePositionMs = useLivePosition(
    playback?.positionMs ?? 0,
    playback?.isPlaying ?? false,
    playback?.currentSong?.duration ?? 0,
    playback?.serverTimeMs,
  );

  let availableWidth: number | undefined;
  let horizontalMargin = playerHorizontalMargin;
  let left = 0;
  let right: number | undefined = 0;
  let width: number | undefined;
  if (tabletLayout.isTabletLandscape) {
    availableWidth = tabletLayout.playerPaneWidth;
    horizontalMargin = 0;
    left = tabletLandscapePagePadding;
    right = undefined;
    width = tabletLayout.playerPaneWidth;
  }
  if (tabletLayout.isTabletPortrait) {
    availableWidth = tabletLayout.portraitPlayerWidth;
    horizontalMargin = 0;
    left = (tabletLayout.width - tabletLayout.portraitPlayerWidth) / 2;
    right = undefined;
    width = tabletLayout.portraitPlayerWidth;
  }

  if (!room || !roomId) return null;

  return (
    <View
      pointerEvents={visible ? 'auto' : 'none'}
      style={{
        left,
        opacity: visible ? 1 : 0,
        position: 'absolute',
        right,
        top: visible
          ? topInset +
            (tabletLayout.isTablet
              ? tabletRoomHeaderHeight + tabletPlayerTopOffset
              : playerHeaderHeight)
          : 0,
        width,
        zIndex: visible ? playerZIndex : 0,
      }}
    >
      <ProviderPlayer
        horizontalMargin={horizontalMargin}
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
            const [requestError] = await playbackRequests.updatePlayback(
              roomId,
              'seek',
              positionMs,
            );
            if (requestError) {
              setError(
                await getRequestErrorMessage(
                  requestError,
                  'Could not seek playback.',
                ),
              );
              return;
            }
          };
          void update();
        }}
        playback={playback}
        positionMs={livePositionMs}
        resetVersion={playbackResetVersion}
        song={playback?.currentSong ?? null}
        suppressPlayback={isCasting}
        synchronizePosition={room.mode === 'host'}
        {...(availableWidth ? { availableWidth } : {})}
        {...(tabletLayout.isTabletLandscape
          ? { availableHeight: tabletLayout.playerHeight }
          : {})}
        {...(tabletLayout.isTabletPortrait
          ? {
              availableHeight:
                tabletLayout.portraitPlayerWidth / playerAspectRatio,
            }
          : {})}
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
            const [requestError] = await playbackRequests.updatePlayback(
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
const playerHorizontalMargin = 16;
const androidTabletPlayerTopInset = 27;
const playerAspectRatio = 16 / 9;
