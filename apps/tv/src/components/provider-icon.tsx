import type { PlaylistItem } from '@vibes/models';
import { NativeIcon } from '@vibes/ui/native';
import { soundCloudProviderIcon, youTubeProviderIcon } from '@vibes/ui/shared';

interface ProviderIconProps {
  color: string;
  provider: PlaylistItem['sourceType'];
  size: number;
}

export function ProviderIcon({ color, provider, size }: ProviderIconProps) {
  let definition = youTubeProviderIcon;
  if (provider === 'soundcloud') definition = soundCloudProviderIcon;
  return <NativeIcon color={color} definition={definition} size={size} />;
}
