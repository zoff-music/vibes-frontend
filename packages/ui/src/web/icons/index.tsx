import type { SVGProps } from 'react';
import {
  alertIcon,
  arrowLeftIcon,
  arrowRightIcon,
  autoThemeIcon,
  caretIcon,
  castIcon,
  checkCircleIcon,
  checkIcon,
  closeIcon,
  copyIcon,
  diceIcon,
  externalLinkIcon,
  type IconDefinition,
  infoIcon,
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
  soundCloudProviderIcon,
  sparklesIcon,
  spinnerIcon,
  spotifyProviderIcon,
  sunIcon,
  trashIcon,
  voteIcon,
  youTubeProviderIcon,
} from '../../shared';

export type IconProps = SVGProps<SVGSVGElement>;

interface DefinitionIconProps extends IconProps {
  definition: IconDefinition;
}

const DefinitionIcon = ({ definition, ...props }: DefinitionIconProps) => (
  <svg viewBox={definition.viewBox} fill="currentColor" {...props}>
    {definition.paths.map((path) => (
      <path d={path} key={path} />
    ))}
  </svg>
);

export const ArrowLeftIcon = (props: IconProps) => (
  <DefinitionIcon definition={arrowLeftIcon} {...props} />
);
export const ArrowRightIcon = (props: IconProps) => (
  <DefinitionIcon definition={arrowRightIcon} {...props} />
);
export const ChevronDownIcon = (props: IconProps) => (
  <DefinitionIcon definition={caretIcon} {...props} />
);
export const SunIcon = (props: IconProps) => (
  <DefinitionIcon definition={sunIcon} {...props} />
);
export const MoonIcon = (props: IconProps) => (
  <DefinitionIcon definition={moonIcon} {...props} />
);
export const ShareIcon = (props: IconProps) => (
  <DefinitionIcon definition={shareIcon} {...props} />
);
export const SettingsIcon = (props: IconProps) => (
  <DefinitionIcon definition={settingsIcon} {...props} />
);
export const CloseIcon = (props: IconProps) => (
  <DefinitionIcon definition={closeIcon} {...props} />
);
export const SearchIcon = (props: IconProps) => (
  <DefinitionIcon definition={searchIcon} {...props} />
);
export const SparklesIcon = (props: IconProps) => (
  <DefinitionIcon definition={sparklesIcon} {...props} />
);
export const InfoIcon = (props: IconProps) => (
  <DefinitionIcon definition={infoIcon} {...props} />
);
export const AlertCircleIcon = (props: IconProps) => (
  <DefinitionIcon definition={alertIcon} {...props} />
);
export const CopyIcon = (props: IconProps) => (
  <DefinitionIcon definition={copyIcon} {...props} />
);
export const CheckIcon = (props: IconProps) => (
  <DefinitionIcon definition={checkIcon} {...props} />
);
export const CheckCircleIcon = (props: IconProps) => (
  <DefinitionIcon definition={checkCircleIcon} {...props} />
);
export const TrashIcon = (props: IconProps) => (
  <DefinitionIcon definition={trashIcon} {...props} />
);
export const VoteIcon = (props: IconProps) => (
  <DefinitionIcon definition={voteIcon} {...props} />
);
export const QueueEmptyIcon = (props: IconProps) => (
  <DefinitionIcon definition={queueIcon} {...props} />
);
export const PlayIcon = (props: IconProps) => (
  <DefinitionIcon definition={playIcon} {...props} />
);
export const PauseIcon = (props: IconProps) => (
  <DefinitionIcon definition={pauseIcon} {...props} />
);
export const SkipIcon = (props: IconProps) => (
  <DefinitionIcon definition={skipIcon} {...props} />
);
export const ResetIcon = (props: IconProps) => (
  <DefinitionIcon definition={resetIcon} {...props} />
);
export const SpinnerIcon = (props: IconProps) => (
  <DefinitionIcon definition={spinnerIcon} {...props} />
);
export const ExternalLinkIcon = (props: IconProps) => (
  <DefinitionIcon definition={externalLinkIcon} {...props} />
);

interface CastIconProps extends IconProps {
  showDot?: boolean;
}

export const CastIcon = ({ showDot, ...props }: CastIconProps) => (
  <svg viewBox={castIcon.viewBox} fill="currentColor" {...props}>
    {castIcon.paths.map((path) => (
      <path d={path} key={path} />
    ))}
    {showDot && <rect x="2" y="19" width="3" height="3" />}
  </svg>
);

export const RemoteIcon = (props: IconProps) => (
  <DefinitionIcon definition={remoteIcon} aria-hidden="true" {...props} />
);

export const SpotifyIcon = (props: IconProps) => (
  <DefinitionIcon definition={spotifyProviderIcon} {...props} />
);

export const YouTubeIcon = (props: IconProps) => (
  <DefinitionIcon definition={youTubeProviderIcon} {...props} />
);

export const SoundCloudIcon = (props: IconProps) => (
  <DefinitionIcon definition={soundCloudProviderIcon} {...props} />
);

export const PlusIcon = (props: IconProps) => (
  <DefinitionIcon definition={plusIcon} {...props} />
);

export const CircleHalfIcon = (props: IconProps) => (
  <DefinitionIcon definition={autoThemeIcon} {...props} />
);

export const DiceIcon = (props: IconProps) => (
  <DefinitionIcon definition={diceIcon} {...props} />
);
