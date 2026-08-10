import type { IconDefinition } from '@vibes/iconography';
import {
  autoThemeIcon,
  caretIcon,
  castIcon,
  checkIcon,
  closeIcon,
  externalLinkIcon,
  moonIcon,
  pauseIcon,
  playIcon,
  plusIcon,
  queueIcon,
  remoteIcon,
  resetIcon,
  searchIcon,
  settingsIcon,
  shareIcon,
  skipIcon,
  sparklesIcon,
  sunIcon,
  trashIcon,
  voteIcon,
} from '@vibes/iconography';
import Svg, { Path } from 'react-native-svg';

import addTabIcon from '@/assets/icons/add.png';
import addTabIconAndroid from '@/assets/icons/add-android.png';
import homeTabIcon from '@/assets/icons/home.png';
import homeTabIconAndroid from '@/assets/icons/home-android.png';
import remoteTabIcon from '@/assets/icons/remote.png';
import remoteTabIconAndroid from '@/assets/icons/remote-android.png';
import settingsTabIcon from '@/assets/icons/settings.png';
import settingsTabIconAndroid from '@/assets/icons/settings-android.png';

export type ZoffIconName = keyof typeof iconDefinitions;

interface ZoffIconProps {
  color: string;
  name: ZoffIconName;
  size?: number;
}

export function ZoffIcon({ color, name, size = 20 }: ZoffIconProps) {
  const definition = iconDefinitions[name];
  return (
    <Svg height={size} viewBox={definition.viewBox} width={size}>
      {definition.paths.map((path) => (
        <Path d={path} fill={color} key={path} />
      ))}
    </Svg>
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

const iconDefinitions = {
  add: plusIcon,
  auto: autoThemeIcon,
  caret: caretIcon,
  cast: castIcon,
  check: checkIcon,
  close: closeIcon,
  external: externalLinkIcon,
  home: queueIcon,
  moon: moonIcon,
  pause: pauseIcon,
  play: playIcon,
  player: playIcon,
  remote: remoteIcon,
  reset: resetIcon,
  scan: searchIcon,
  search: searchIcon,
  settings: settingsIcon,
  share: shareIcon,
  skip: skipIcon,
  sparkles: sparklesIcon,
  sun: sunIcon,
  trash: trashIcon,
  vote: voteIcon,
} satisfies Record<string, IconDefinition>;
