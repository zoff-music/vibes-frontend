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
import type { ImageSourcePropType } from 'react-native';
import Svg, { Path } from 'react-native-svg';

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

function createImageSource(definition: IconDefinition): ImageSourcePropType {
  const paths = definition.paths
    .map((path) => `<path fill="#000" d="${path}"/>`)
    .join('');
  const markup = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${definition.viewBox}">${paths}</svg>`;
  return { uri: `data:image/svg+xml,${encodeURIComponent(markup)}` };
}

export const zoffIconSources = {
  add: createImageSource(plusIcon),
  home: createImageSource(queueIcon),
  player: createImageSource(playIcon),
  remote: createImageSource(remoteIcon),
  settings: createImageSource(settingsIcon),
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
