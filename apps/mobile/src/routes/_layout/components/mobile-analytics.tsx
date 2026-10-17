import { getRoomAnalyticsPath } from '@vibes/api';
import { usePathname } from 'expo-router';
import { useEffect } from 'react';
import { mobileAnalytics } from '@/lib/analytics';
import { useRoomSession } from '@/providers/app-provider';

export function MobileAnalytics() {
  const pathname = usePathname();
  const { controllerRemote, roomId } = useRoomSession();
  const analyticsPath = roomId
    ? getRoomAnalyticsPath(roomId)
    : controllerRemote?.roomId
      ? getRoomAnalyticsPath(controllerRemote.roomId)
      : pathname;

  useEffect(() => {
    void mobileAnalytics.trackPageview({
      path: analyticsPath,
      surface: 'mobile',
    });
  }, [analyticsPath]);

  return null;
}
