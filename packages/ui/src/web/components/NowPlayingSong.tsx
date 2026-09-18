import {
  classNames,
  getProviderTrackUrl,
  resolveSongThumbnail,
  type Song,
} from '@vibes/shared';
import { formatPlaybackSeconds, getProviderDisplayName } from '../../shared';
import { ProviderIcon } from './ProviderIcon';
import { Tooltip } from './Tooltip';

interface NowPlayingSongProps {
  song: Song;
  isPlaying: boolean;
  providerLink?: boolean;
  animate?: boolean;
}

export function NowPlayingSong({
  song,
  isPlaying,
  providerLink = true,
  animate = true,
}: NowPlayingSongProps) {
  const providerUrl = getProviderTrackUrl(
    song.sourceType,
    song.sourceId,
    song.providerUrl,
  );
  return (
    <>
      <div className="mb-3 flex items-center gap-2">
        <div
          className={classNames(
            'h-2 w-2 rounded-full',
            isPlaying
              ? 'bg-secondary shadow-secondary-strong motion-safe:animate-pulse'
              : 'bg-white/30',
          )}
        />
        <span className="font-display text-2xs text-theme-muted tracking-label">
          {isPlaying ? 'Now Playing' : 'Paused'}
        </span>
      </div>
      <div
        key={song.id}
        className={classNames(
          'overflow-hidden',
          animate && 'motion-safe:animate-slide-up',
        )}
      >
        <div className="group/card panel-surface no-box relative flex min-w-0 items-center gap-4 overflow-hidden rounded-2xl p-4">
          <div className="vhs-scanlines pointer-events-none absolute inset-0" />
          <div className="relative z-10 shrink-0">
            <img
              src={resolveSongThumbnail(song.thumbnailUrl)}
              alt=""
              className="h-16 w-16 rounded-xl border border-theme object-cover shadow-xs transition-transform group-hover/card:scale-105"
            />
          </div>
          <div className="relative z-10 min-w-0 flex-1 overflow-hidden">
            <h3 className="mb-1 block max-w-full truncate font-display text-theme text-xs">
              {song.title}
            </h3>
            <div className="flex min-w-0 items-center gap-2 overflow-hidden text-theme-muted text-xs">
              <span className="min-w-0 truncate">
                {song.artist || 'Unknown Artist'}
              </span>
              <span className="text-theme-subtle">•</span>
              <span className="shrink-0 font-mono text-theme-subtle text-xs">
                {formatPlaybackSeconds(song.duration)}
              </span>
            </div>
          </div>
          <div className="relative z-10 flex shrink-0 items-center justify-center opacity-70">
            {providerUrl && providerLink && (
              <Tooltip
                align="end"
                className="inline-flex"
                content={`Open on ${getProviderDisplayName(song.sourceType)}`}
              >
                <a
                  href={providerUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="cursor-pointer rounded-md p-1 transition-opacity hover:opacity-100 focus:outline-hidden focus:ring-2 focus:ring-secondary/40"
                  aria-label={`Open ${song.title} on ${getProviderDisplayName(song.sourceType)}`}
                >
                  <ProviderIcon
                    className="h-5 w-5 text-white"
                    provider={song.sourceType}
                  />
                </a>
              </Tooltip>
            )}
            {(!providerLink ||
              (!providerUrl && song.sourceType === 'soundcloud')) && (
              <ProviderIcon
                className="h-5 w-5 text-theme-muted"
                provider={song.sourceType}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
