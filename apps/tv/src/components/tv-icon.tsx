import type { IconDefinition } from '@vibes/iconography';
import { arrowLeftIcon, playIcon, sparklesIcon } from '@vibes/iconography';
import Svg, { Path } from 'react-native-svg';

const icons = {
  back: arrowLeftIcon,
  play: playIcon,
  sparkles: sparklesIcon,
} as const;

interface TvIconProps {
  color: string;
  name: keyof typeof icons;
  size: number;
}

export function TvIcon({ color, name, size }: TvIconProps) {
  const icon: IconDefinition = icons[name];
  return (
    <Svg height={size} viewBox={icon.viewBox} width={size}>
      {icon.paths.map((path) => (
        <Path d={path} fill={color} key={path} />
      ))}
    </Svg>
  );
}
