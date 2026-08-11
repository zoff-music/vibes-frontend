import type { Song } from '@vibes/models';
import { NativeIcon } from '@vibes/ui/native';
import {
  soundCloudProviderIcon,
  spotifyProviderIcon,
  youTubeProviderIcon,
} from '@vibes/ui/shared';

interface ProviderIconProps {
  color: string;
  provider: Song['sourceType'];
  size: number;
}

export function ProviderIcon({ color, provider, size }: ProviderIconProps) {
  let definition = youTubeProviderIcon;
  if (provider === 'spotify') definition = spotifyProviderIcon;
  if (provider === 'soundcloud') definition = soundCloudProviderIcon;
  return <NativeIcon color={color} definition={definition} size={size} />;
}
