import type { SourceType } from '@vibes/shared';
import type { SVGProps } from 'react';
import { SoundCloudIcon, YouTubeIcon } from '../icons';

interface ProviderIconProps extends SVGProps<SVGSVGElement> {
  provider: SourceType;
}

export function ProviderIcon({ provider, ...props }: ProviderIconProps) {
  return (
    <>
      {provider === 'soundcloud' && <SoundCloudIcon {...props} />}
      {provider === 'youtube' && <YouTubeIcon {...props} />}
    </>
  );
}
