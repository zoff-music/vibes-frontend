import { Image } from 'expo-image';
import type { ImageSourcePropType } from 'react-native';

export type PixelIconName = keyof typeof pixelIconSources;

interface PixelIconProps {
  color: string;
  name: PixelIconName;
  size?: number;
}

export function PixelIcon({ color, name, size = 20 }: PixelIconProps) {
  return (
    <Image
      contentFit="contain"
      source={pixelIconSources[name]}
      style={{ height: size, width: size }}
      tintColor={color}
    />
  );
}

export const pixelIconSources = {
  add: require('../../assets/icons/add.png') as ImageSourcePropType,
  home: require('../../assets/icons/home.png') as ImageSourcePropType,
  pause: require('../../assets/icons/pause.png') as ImageSourcePropType,
  play: require('../../assets/icons/play.png') as ImageSourcePropType,
  player: require('../../assets/icons/player.png') as ImageSourcePropType,
  remote: require('../../assets/icons/remote.png') as ImageSourcePropType,
  scan: require('../../assets/icons/scan.png') as ImageSourcePropType,
  settings: require('../../assets/icons/settings.png') as ImageSourcePropType,
  skip: require('../../assets/icons/skip.png') as ImageSourcePropType,
  trash: require('../../assets/icons/trash.png') as ImageSourcePropType,
  vote: require('../../assets/icons/vote.png') as ImageSourcePropType,
};
