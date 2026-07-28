import {
  getProviderTrackUrl,
  resolveSongThumbnail,
  type Song,
} from '@vibes/shared';
import { motion } from 'framer-motion';
import React from 'react';
import { TrashIcon, VoteIcon } from '../../icons';
import { Button } from '../Button';
import { ProviderIcon } from '../ProviderIcon';
import { Tooltip } from '../Tooltip';

interface Props {
  song: Song;
  position: number;
  onRemove?: (id: string) => void;
  onVote?: (id: string) => void;
  isAdmin?: boolean;
  isVoting?: boolean;
}

export const QueueItem: React.FC<Props> = ({
  song,
  position,
  onRemove,
  onVote,
  isAdmin,
  isVoting = false,
}) => {
  const formatDuration = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  const handleVote = () => {
    onVote?.(song.id);
  };

  const handleRemove = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onRemove?.(song.id);
  };

  const providerUrl = getProviderTrackUrl(
    song.sourceType,
    song.sourceId,
    song.providerUrl,
  );
  const voteCount = song.voteCount || 0;

  return (
    <article className="group w-full overflow-hidden rounded-2xl border border-theme bg-theme-surface p-4 transition-colors hover:border-theme-strong">
      <div className="flex min-w-0 items-center gap-3 sm:gap-4">
        <div className="w-6 shrink-0 text-center sm:w-8">
          <span className="text-theme-subtle text-xs">{position}</span>
        </div>

        <img
          src={resolveSongThumbnail(song.thumbnailUrl)}
          alt=""
          className="h-14 w-14 shrink-0 rounded-xl border border-theme bg-theme-surface object-cover sm:h-16 sm:w-16"
          loading="lazy"
        />

        <div className="min-w-0 flex-1 overflow-hidden">
          <h4 className="mb-1 block max-w-full truncate text-left text-theme text-xs">
            {song.title}
          </h4>
          <div className="flex min-w-0 items-center gap-2 overflow-hidden text-theme-muted text-xs">
            <span className="min-w-0 truncate">
              {song.artist || 'Unknown Artist'}
            </span>
            <span className="text-theme-subtle">•</span>
            <span className="shrink-0 text-theme-subtle text-xs">
              {formatDuration(song.duration)}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2 border-theme border-t pt-3">
        {providerUrl && (
          <Tooltip
            align="start"
            className="inline-flex"
            content={`Open on ${providerNames[song.sourceType]}`}
          >
            <a
              href={providerUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-xl px-2.5 text-theme-muted text-xs transition-colors hover:bg-theme hover:text-theme focus:outline-hidden focus:ring-2 focus:ring-secondary/40"
              aria-label={`Open ${song.title} on ${providerNames[song.sourceType]}`}
            >
              <ProviderIcon
                className="h-4 w-4 text-white"
                provider={song.sourceType}
              />
              <span className="hidden sm:inline">
                {providerNames[song.sourceType]}
              </span>
            </a>
          </Tooltip>
        )}

        <div className="ml-auto flex items-center gap-2">
          {onVote && (
            <Tooltip className="inline-flex" content="Vote this song up">
              <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.92 }}>
                <Button
                  onClick={handleVote}
                  disabled={isVoting}
                  variant="tertiary"
                  size="none"
                  className="min-h-10 min-w-24 gap-2 rounded-xl px-3 font-pixel text-2xs"
                  aria-label={`Vote for ${song.title} by ${song.artist || 'Unknown Artist'}`}
                  aria-busy={isVoting}
                >
                  <motion.span
                    animate={
                      isVoting
                        ? { rotate: [0, -14, 14, 0], scale: [1, 1.2, 1] }
                        : { rotate: 0, scale: 1 }
                    }
                    transition={{ duration: 0.4 }}
                  >
                    <VoteIcon className="h-4 w-4 text-secondary" />
                  </motion.span>
                  <span>{isVoting ? 'Voting…' : 'Vote'}</span>
                  <motion.span
                    key={voteCount}
                    initial={{ scale: 1.35 }}
                    animate={{ scale: 1 }}
                    className="min-w-5 rounded-full bg-secondary/15 px-1.5 py-0.5 text-center text-secondary tabular-nums"
                  >
                    {voteCount}
                  </motion.span>
                </Button>
              </motion.div>
            </Tooltip>
          )}

          {isAdmin && (
            <Tooltip align="end" className="inline-flex" content="Remove">
              <Button
                onClick={handleRemove}
                variant="destructive"
                size="none"
                className="min-h-10 min-w-10 rounded-xl p-2.5"
                aria-label="Remove from queue"
              >
                <TrashIcon className="h-5 w-5" />
              </Button>
            </Tooltip>
          )}
        </div>
      </div>
    </article>
  );
};

const providerNames: Record<Song['sourceType'], string> = {
  soundcloud: 'SoundCloud',
  spotify: 'Spotify',
  youtube: 'YouTube',
};
