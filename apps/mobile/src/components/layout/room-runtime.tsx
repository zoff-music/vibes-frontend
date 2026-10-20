import {
  ActiveRoomKeepAwake,
  PersistentRoomPlayer,
} from '@/components/persistent-room-player';
import { usePlaybackSession, useRoomSession } from '@/providers/app-provider';
import { AndroidFloatingNavigation } from './android-floating-navigation';
import { AppTabs } from './app-tabs';
import { DeviceOrientationLock } from './device-orientation-lock';
import { FloatingAddPlaylistItemButton } from './floating-add-button';
import { MobileAnalytics } from './mobile-analytics';
import { TabletTopNavigation } from './tablet-top-navigation';

export function RoomRuntime() {
  const { controllerRemote, room } = useRoomSession();
  const { playerEnabled, playerPreferenceLoaded } = usePlaybackSession();
  const hasActiveSession = Boolean(room || controllerRemote?.roomId);

  return (
    <>
      <MobileAnalytics />
      {hasActiveSession && playerPreferenceLoaded && playerEnabled && (
        <ActiveRoomKeepAwake />
      )}
      {room && playerPreferenceLoaded && playerEnabled && (
        <PersistentRoomPlayer />
      )}
      <DeviceOrientationLock />
      <AppTabs />
      <AndroidFloatingNavigation />
      <TabletTopNavigation />
      <FloatingAddPlaylistItemButton />
    </>
  );
}
