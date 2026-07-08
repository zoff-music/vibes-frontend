import React from 'react';
import { Button } from '../components/Button';
import {
  CastIcon,
  PauseIcon,
  PlayIcon,
  PlusIcon,
  SkipIcon,
  SpotifyIcon,
} from '../icons';

interface Props {
  isPlaying: boolean;
  canPlay: boolean;
  canSkip: boolean;
  onPlay: () => void;
  onPause: () => void;
  onSkip: () => void;
  onAddSong: () => void;
  onOpenCast: () => void;
  isCasting: boolean;
  castDeviceName?: string | null;
  showSpotifyConnect?: boolean;
  onConnectSpotify?: () => void;
}

const PlayerControlsComponent: React.FC<Props> = ({
  isPlaying,
  canPlay,
  canSkip,
  onPlay,
  onPause,
  onSkip,
  onAddSong,
  onOpenCast,
  isCasting,
  castDeviceName,
  showSpotifyConnect,
  onConnectSpotify,
}) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-start gap-4">
        <Button
          onClick={isPlaying ? onPause : onPlay}
          disabled={!canPlay}
          variant="player-primary"
        >
          {isPlaying ? (
            <PauseIcon className="h-6 w-6 fill-current" />
          ) : (
            <PlayIcon className="ml-0.5 h-6 w-6 fill-current" />
          )}
        </Button>

        <Button
          onClick={onSkip}
          disabled={!canSkip}
          variant="player-control"
          title="Skip"
        >
          <SkipIcon className="h-5 w-5 text-theme-muted transition-colors group-hover:text-primary" />
        </Button>

        <Button
          onClick={onOpenCast}
          variant={isCasting ? 'player-control-active' : 'player-control'}
          title={
            isCasting && castDeviceName
              ? `Casting to ${castDeviceName}`
              : 'Cast'
          }
        >
          <CastIcon
            className={`h-5 w-5 transition-colors ${isCasting ? 'text-primary' : 'text-theme-muted group-hover:text-primary'}`}
            showDot={isCasting}
          />
        </Button>

        {showSpotifyConnect && onConnectSpotify && (
          <Button
            onClick={onConnectSpotify}
            variant="player-spotify"
            title="Connect Spotify"
          >
            <SpotifyIcon className="h-6 w-6" />
            <span className="whitespace-nowrap font-display text-xs tracking-[0.2em]">
              Connect Spotify
            </span>
          </Button>
        )}

        <Button onClick={onAddSong} variant="player-add-song" title="Add Song">
          <PlusIcon className="h-5 w-5 shrink-0" />
          <span className="whitespace-nowrap font-display text-theme text-xs tracking-[0.2em]">
            Add Song
          </span>
        </Button>
      </div>
    </div>
  );
};

export const PlayerControls = React.memo(PlayerControlsComponent);
