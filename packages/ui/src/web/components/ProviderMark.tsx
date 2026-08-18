import { classNames, type SourceType } from '@vibes/shared';
import { getProviderDisplayName } from '../../shared';
import soundCloudDark from '../assets/providers/soundcloud-dark.png';
import soundCloudLight from '../assets/providers/soundcloud-light.png';
import youTubeDark from '../assets/providers/youtube-dark.svg';
import youTubeLight from '../assets/providers/youtube-light.svg';

interface ProviderMarkProps {
  className?: string;
  provider: SourceType;
}

export function ProviderMark({
  className = 'h-5 w-auto',
  provider,
}: ProviderMarkProps) {
  const marks = providerMarks[provider];

  return (
    <>
      <img
        alt={getProviderDisplayName(provider)}
        className={classNames('provider-mark-light object-contain', className)}
        src={marks.light}
      />
      <img
        alt=""
        aria-hidden="true"
        className={classNames('provider-mark-dark object-contain', className)}
        src={marks.dark}
      />
    </>
  );
}

const providerMarks: Record<
  SourceType,
  {
    dark: string;
    light: string;
  }
> = {
  soundcloud: {
    dark: soundCloudDark,
    light: soundCloudLight,
  },
  youtube: {
    dark: youTubeDark,
    light: youTubeLight,
  },
};
