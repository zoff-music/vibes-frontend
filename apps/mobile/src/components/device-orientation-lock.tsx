import { safeWrapAsync } from '@vibes/shared';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useEffect } from 'react';
import { Platform } from 'react-native';

import { useTabletLandscapeLayout } from '@/hooks/use-tablet-landscape-layout';

export function DeviceOrientationLock() {
  const { isTablet } = useTabletLandscapeLayout();

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const applyOrientationLock = async () => {
      const orientationLock = isTablet
        ? ScreenOrientation.OrientationLock.DEFAULT
        : ScreenOrientation.OrientationLock.PORTRAIT_UP;
      await safeWrapAsync(ScreenOrientation.lockAsync(orientationLock));
    };
    void applyOrientationLock();
  }, [isTablet]);

  return null;
}
