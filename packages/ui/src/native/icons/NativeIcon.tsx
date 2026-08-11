import Svg, { Path } from 'react-native-svg';
import type { IconDefinition } from '../../shared';

interface NativeIconProps {
  color: string;
  definition: IconDefinition;
  size: number;
}

export function NativeIcon({ color, definition, size }: NativeIconProps) {
  return (
    <Svg height={size} viewBox={definition.viewBox} width={size}>
      {definition.paths.map((path) => (
        <Path d={path} fill={color} key={path} />
      ))}
    </Svg>
  );
}
