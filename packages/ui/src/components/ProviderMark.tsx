import type { SourceType } from '@vibes/shared';
import soundCloudDark from '../assets/providers/soundcloud-dark.png';
import soundCloudLight from '../assets/providers/soundcloud-light.png';
import spotifyDark from '../assets/providers/spotify-dark.svg';
import spotifyLight from '../assets/providers/spotify-light.svg';
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
        alt={providerNames[provider]}
        className={`${className} object-contain dark:hidden`}
        src={marks.light}
      />
      <img
        alt=""
        aria-hidden="true"
        className={`hidden ${className} object-contain dark:block`}
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
  spotify: {
    dark: spotifyDark,
    light: spotifyLight,
  },
  youtube: {
    dark: youTubeDark,
    light: youTubeLight,
  },
};

const providerNames: Record<SourceType, string> = {
  soundcloud: 'SoundCloud',
  spotify: 'Spotify',
  youtube: 'YouTube',
};
