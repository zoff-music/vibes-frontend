import {
  classNames,
  getProviderItemUrl,
  type PlaylistItem,
  resolvePlaylistItemThumbnail,
} from '@vibes/shared';
import { formatPlaybackSeconds, getProviderDisplayName } from '../../shared';
import { ProviderIcon } from './ProviderIcon';
import { Tooltip } from './Tooltip';

interface NowPlayingPlaylistItemProps {
  playlistItem: PlaylistItem;
  isPlaying: boolean;
  providerLink?: boolean;
  animate?: boolean;
  density?: 'normal' | 'compact';
  showStatus?: boolean;
}

export function NowPlayingPlaylistItem({
  playlistItem,
  isPlaying,
  providerLink = true,
  animate = true,
  density = 'normal',
  showStatus = true,
}: NowPlayingPlaylistItemProps) {
  const providerUrl = getProviderItemUrl(
    playlistItem.sourceType,
    playlistItem.sourceId,
    playlistItem.providerUrl,
  );
  return (
    <>
      {showStatus && (
        <div className="mb-3 flex items-center gap-2">
          <div
            className={classNames(
              'h-2 w-2 rounded-full',
              isPlaying
                ? 'bg-secondary shadow-secondary-strong'
                : 'bg-white/30',
              isPlaying && animate && 'motion-safe:animate-pulse',
            )}
          />
          <span className="font-display text-2xs text-theme-muted tracking-label">
            {isPlaying ? 'Now Playing' : 'Paused'}
          </span>
        </div>
      )}
      <div
        key={playlistItem.id}
        className={classNames(
          'overflow-hidden',
          animate && 'motion-safe:animate-slide-up',
        )}
      >
        <div
          className={classNames(
            'group/card panel-surface no-box relative flex min-w-0 items-center overflow-hidden rounded-2xl',
            density === 'compact' ? 'gap-3 p-3' : 'gap-4 p-4',
          )}
        >
          <div className="vhs-scanlines pointer-events-none absolute inset-0" />
          <div className="relative z-10 shrink-0">
            <img
              src={resolvePlaylistItemThumbnail(
                playlistItem.thumbnailUrl,
                true,
              )}
              alt=""
              width={64}
              height={64}
              className={classNames(
                'rounded-xl border border-theme object-cover shadow-xs transition-transform group-hover/card:scale-105',
                density === 'compact' ? 'h-12 w-12' : 'h-16 w-16',
              )}
            />
          </div>
          <div className="relative z-10 min-w-0 flex-1 overflow-hidden">
            <h2 className="mb-1 block max-w-full truncate font-display text-theme text-xs">
              {playlistItem.title}
            </h2>
            <div className="flex min-w-0 items-center gap-2 overflow-hidden text-theme-muted text-xs">
              <span className="min-w-0 truncate">
                {playlistItem.publisher || 'Unknown Artist'}
              </span>
              <span className="text-theme-subtle">•</span>
              <span className="shrink-0 font-mono text-theme-muted text-xs">
                {formatPlaybackSeconds(playlistItem.duration)}
              </span>
            </div>
          </div>
          <div className="relative z-10 flex shrink-0 items-center justify-center opacity-70">
            {providerUrl && providerLink && (
              <Tooltip
                align="end"
                className="inline-flex"
                content={`Open on ${getProviderDisplayName(playlistItem.sourceType)}`}
              >
                <a
                  href={providerUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="cursor-pointer rounded-md p-1 transition-opacity hover:opacity-100 focus:outline-hidden focus:ring-2 focus:ring-secondary/40"
                  aria-label={`Open ${playlistItem.title} on ${getProviderDisplayName(playlistItem.sourceType)}`}
                >
                  <ProviderIcon
                    className="h-5 w-5 text-white"
                    provider={playlistItem.sourceType}
                  />
                </a>
              </Tooltip>
            )}
            {(!providerLink ||
              (!providerUrl && playlistItem.sourceType === 'soundcloud')) && (
              <ProviderIcon
                className="h-5 w-5 text-theme-muted"
                provider={playlistItem.sourceType}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
