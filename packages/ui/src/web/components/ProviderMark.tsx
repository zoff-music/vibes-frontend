import { classNames, type SourceType } from '@vibes/shared';
import { getProviderDisplayName } from '../../shared';
import soundCloudDark from '../assets/providers/soundcloud-dark.png?no-inline';
import soundCloudLight from '../assets/providers/soundcloud-light.png?no-inline';
import youTubeDark from '../assets/providers/youtube-dark.svg?no-inline';
import youTubeLight from '../assets/providers/youtube-light.svg?no-inline';

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
        width={marks.width}
        height={marks.height}
      />
      <img
        alt=""
        aria-hidden="true"
        className={classNames('provider-mark-dark object-contain', className)}
        src={marks.dark}
        width={marks.width}
        height={marks.height}
      />
    </>
  );
}

const providerMarks: Record<
  SourceType,
  {
    dark: string;
    light: string;
    width: number;
    height: number;
  }
> = {
  soundcloud: {
    dark: soundCloudDark,
    light: soundCloudLight,
    width: 104,
    height: 16,
  },
  youtube: {
    dark: youTubeDark,
    light: youTubeLight,
    width: 492,
    height: 110,
  },
};
