import {
  alertIcon,
  arrowLeftIcon,
  autoThemeIcon,
  caretIcon,
  castIcon,
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
  sparklesIcon,
  sunIcon,
  trashIcon,
  voteIcon,
} from '@vibes/iconography';
import type { SVGProps } from 'react';

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
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
  </svg>
);

export const YouTubeIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M21.8 7.2c-.2-1-1-1.8-2-2-1.8-.4-7.8-.4-7.8-.4s-6 0-7.8.4c-1 .2-1.8 1-2 2C2 9 2 12 2 12s0 3 .4 4.8c.2 1 1 1.8 2 2 1.8.4 7.8.4 7.8.4s6 0 7.8-.4c1-.2 1.8-1 2-2 .4-1.8.4-4.8.4-4.8s0-3-.4-4.8zM10 15.5v-7l6 3.5-6 3.5z" />
  </svg>
);

export const SoundCloudIcon = (props: IconProps) => (
  <svg viewBox="-271 345.8 256 111.2" fill="currentColor" {...props}>
    <g>
      <path d="M-238.4,398.1c-0.8,0-1.4,0.6-1.5,1.5l-2.3,28l2.3,27.1c0.1,0.8,0.7,1.5,1.5,1.5c0.8,0,1.4-0.6,1.5-1.5l2.6-27.1l-2.6-28 C-237,398.7-237.7,398.1-238.4,398.1z" />
      <path d="M-228.2,399.9c-0.9,0-1.7,0.7-1.7,1.7l-2.1,26l2.1,27.3c0.1,1,0.8,1.7,1.7,1.7c0.9,0,1.6-0.7,1.7-1.7l2.4-27.3l-2.4-26 C-226.6,400.6-227.3,399.9-228.2,399.9z" />
      <path d="M-258.6,403.5c-0.5,0-1,0.4-1.1,1l-2.5,23l2.5,22.5c0.1,0.6,0.5,1,1.1,1c0.5,0,1-0.4,1.1-1l2.9-22.5l-2.9-23 C-257.7,404-258.1,403.5-258.6,403.5z" />
      <path d="M-268.1,412.3c-0.5,0-1,0.4-1,1l-1.9,14.3l1.9,14c0.1,0.6,0.5,1,1,1s0.9-0.4,1-1l2.2-14l-2.2-14.2 C-267.2,412.8-267.6,412.3-268.1,412.3z" />
      <path d="M-207.5,373.5c-1.2,0-2.1,0.9-2.2,2.1l-1.9,52l1.9,27.2c0.1,1.2,1,2.1,2.2,2.1s2.1-0.9,2.2-2.1l2.1-27.2l-2.1-52 C-205.4,374.4-206.4,373.5-207.5,373.5z" />
      <path d="M-248.6,399c-0.7,0-1.2,0.5-1.3,1.3l-2.4,27.3l2.4,26.3c0.1,0.7,0.6,1.3,1.3,1.3c0.7,0,1.2-0.5,1.3-1.2l2.7-26.3l-2.7-27.3 C-247.4,399.6-247.9,399-248.6,399z" />
      <path d="M-217.9,383.4c-1,0-1.9,0.8-1.9,1.9l-2,42.3l2,27.3c0.1,1.1,0.9,1.9,1.9,1.9s1.9-0.8,1.9-1.9l2.3-27.3l-2.3-42.3 C-216,384.2-216.9,383.4-217.9,383.4z" />
      <path d="M-154.4,359.3c-1.8,0-3.2,1.4-3.2,3.2l-1.2,65l1.2,26.1c0,1.8,1.5,3.2,3.2,3.2c1.8,0,3.2-1.5,3.2-3.2l1.4-26.1l-1.4-65 C-151.1,360.8-152.6,359.3-154.4,359.3z" />
      <path d="M-197.1,368.9c-1.3,0-2.3,1-2.4,2.4l-1.8,56.3l1.8,26.9c0,1.3,1.1,2.3,2.4,2.3s2.3-1,2.4-2.4l2-26.9l-2-56.3 C-194.7,370-195.8,368.9-197.1,368.9z" />
      <path d="M-46.5,394c-4.3,0-8.4,0.9-12.2,2.4C-61.2,368-85,345.8-114,345.8c-7.1,0-14,1.4-20.1,3.8c-2.4,0.9-3,1.9-3,3.7v99.9 c0,1.9,1.5,3.5,3.4,3.7c0.1,0,86.7,0,87.3,0c17.4,0,31.5-14.1,31.5-31.5C-15,408.1-29.1,394-46.5,394z" />
      <path d="M-143.6,353.2c-1.9,0-3.4,1.6-3.5,3.5l-1.4,70.9l1.4,25.7c0,1.9,1.6,3.4,3.5,3.4c1.9,0,3.4-1.6,3.5-3.5l1.5-25.8l-1.5-70.9 C-140.2,354.8-141.7,353.2-143.6,353.2z" />
      <path d="M-186.5,366.8c-1.4,0-2.5,1.1-2.6,2.6l-1.6,58.2l1.6,26.7c0,1.4,1.2,2.6,2.6,2.6s2.5-1.1,2.6-2.6l1.8-26.7l-1.8-58.2 C-184,367.9-185.1,366.8-186.5,366.8z" />
      <path d="M-175.9,368.1c-1.5,0-2.8,1.2-2.8,2.8l-1.5,56.7l1.5,26.5c0,1.6,1.3,2.8,2.8,2.8s2.8-1.2,2.8-2.8l1.7-26.5l-1.7-56.7 C-173.1,369.3-174.3,368.1-175.9,368.1z" />
      <path d="M-165.2,369.9c-1.7,0-3,1.3-3,3l-1.4,54.7l1.4,26.3c0,1.7,1.4,3,3,3c1.7,0,3-1.3,3-3l1.5-26.3l-1.5-54.7 C-162.2,371.3-163.5,369.9-165.2,369.9z" />
    </g>
  </svg>
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
