import { NativeIcon } from '@vibes/ui/native';
import type { ZoffIconName } from '@vibes/ui/shared';
import { zoffIconDefinitions } from '@vibes/ui/shared';

import addTabIcon from '@/assets/icons/add.png';
import addTabIconAndroid from '@/assets/icons/add-android.png';
import homeTabIcon from '@/assets/icons/home.png';
import homeTabIconAndroid from '@/assets/icons/home-android.png';
import remoteTabIcon from '@/assets/icons/remote.png';
import remoteTabIconAndroid from '@/assets/icons/remote-android.png';
import settingsTabIcon from '@/assets/icons/settings.png';
import settingsTabIconAndroid from '@/assets/icons/settings-android.png';

export type { ZoffIconName };

interface ZoffIconProps {
  color: string;
  name: ZoffIconName;
  size?: number;
}

export function ZoffIcon({ color, name, size = 20 }: ZoffIconProps) {
  return (
    <NativeIcon
      color={color}
      definition={zoffIconDefinitions[name]}
      size={size}
    />
  );
}

export const zoffIconSources = {
  add: addTabIcon,
  home: homeTabIcon,
  remote: remoteTabIcon,
  settings: settingsTabIcon,
};

export const zoffAndroidIconSources = {
  add: addTabIconAndroid,
  home: homeTabIconAndroid,
  remote: remoteTabIconAndroid,
  settings: settingsTabIconAndroid,
};
