import type { Room } from '@vibes/models';
import { useRoomStore } from '@vibes/shared';
import {
  Button,
  ExternalLinkIcon,
  ListenerCount,
  PauseIcon,
  PlayIcon,
  ResetIcon,
  SkipIcon,
} from '@vibes/ui';
import { useRouteLoaderData } from 'react-router';
import type { RootLoaderData } from '../../../root';

interface Props {
  canControlPlayback: boolean;
  canSkip: boolean;
  isPlaying: boolean;
  showPlaybackControls: boolean;
  onReset: () => void;
  onPlayPause: () => void;
  onSkip: () => void;
  room: Room;
  roomId: string;
  showReset: boolean;
  showSkip: boolean;
}

export function EmbedRoomHeader({
  canControlPlayback,
  canSkip,
  isPlaying,
  showPlaybackControls,
  onReset,
  onPlayPause,
  onSkip,
  room,
  roomId,
  showReset,
  showSkip,
}: Props) {
  const roomUrl = `/${encodeURIComponent(roomId)}`;
  const { logoUrl } = useRouteLoaderData('root') as RootLoaderData;
  const usersCount = useRoomStore((state) => state.usersCount);

  return (
    <header className="flex items-center justify-between border-theme border-b px-4 py-3">
      <div className="flex min-w-0 items-center gap-2">
        <h1 className="min-w-0 truncate font-pixel text-sm text-theme">
          {room.name}
        </h1>
        {showReset && (
          <Button
            onClick={onReset}
            title="Reset playback"
            aria-label="Reset playback"
            variant="tertiary"
            size="icon"
          >
            <ResetIcon className="h-5 w-5" />
          </Button>
        )}
      </div>
      <div className="ml-3 flex shrink-0 items-center gap-2">
        <ListenerCount count={usersCount} />
        {showPlaybackControls && (
          <Button
            disabled={!canControlPlayback}
            onClick={onPlayPause}
            title={
              canControlPlayback
                ? isPlaying
                  ? 'Pause'
                  : 'Play'
                : 'Nothing is playing'
            }
            aria-label={
              canControlPlayback
                ? isPlaying
                  ? 'Pause'
                  : 'Play'
                : 'Nothing is playing'
            }
            variant="tertiary"
            size="icon"
          >
            {isPlaying && <PauseIcon className="h-5 w-5" />}
            {!isPlaying && <PlayIcon className="h-5 w-5" />}
          </Button>
        )}
        {showSkip && (
          <Button
            disabled={!canSkip}
            onClick={onSkip}
            title={canSkip ? 'Skip' : 'Skipping is unavailable'}
            aria-label={canSkip ? 'Skip' : 'Skipping is unavailable'}
            variant="tertiary"
            size="icon"
          >
            <SkipIcon className="h-5 w-5" />
          </Button>
        )}
        <a
          href={roomUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-theme bg-theme-surface p-1.5 pr-2.5 text-theme transition-colors hover:border-theme-strong"
          title="Open room on Zoff in a new tab"
          aria-label="Open room on Zoff in a new tab"
        >
          <img className="h-7 w-7 rounded-full" src={logoUrl} alt="" />
          <ExternalLinkIcon className="h-4 w-4" />
        </a>
      </div>
    </header>
  );
}
