import { classNames, type SourceType } from '@vibes/shared';
import { getProviderDisplayName } from '../../shared';
import soundCloudDark from '../assets/providers/soundcloud-dark.png?no-inline';
import soundCloudDarkWebp from '../assets/providers/soundcloud-dark.webp?no-inline';
import soundCloudLight from '../assets/providers/soundcloud-light.png?no-inline';
import soundCloudLightWebp from '../assets/providers/soundcloud-light.webp?no-inline';
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
      <span className="sr-only">{getProviderDisplayName(provider)}</span>
      <picture className="contents">
        {marks.lightWebp && (
          <source type="image/webp" srcSet={marks.lightWebp} />
        )}
        <img
          alt=""
          className={classNames(
            'provider-mark-light object-contain',
            className,
          )}
          src={marks.light}
          width={marks.width}
          height={marks.height}
        />
      </picture>
      <picture className="contents">
        {marks.darkWebp && <source type="image/webp" srcSet={marks.darkWebp} />}
        <img
          alt=""
          className={classNames('provider-mark-dark object-contain', className)}
          src={marks.dark}
          width={marks.width}
          height={marks.height}
        />
      </picture>
    </>
  );
}

const providerMarks: Record<
  SourceType,
  {
    dark: string;
    light: string;
    darkWebp?: string;
    lightWebp?: string;
    width: number;
    height: number;
  }
> = {
  soundcloud: {
    dark: soundCloudDark,
    light: soundCloudLight,
    darkWebp: soundCloudDarkWebp,
    lightWebp: soundCloudLightWebp,
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
