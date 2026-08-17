import {
  getProviderTrackUrl,
  resolveSongThumbnail,
  type Song,
} from '@vibes/shared';
import { motion } from 'framer-motion';
import React from 'react';
import { formatPlaybackSeconds, getProviderDisplayName } from '../../../shared';
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

const QueueItemComponent: React.FC<Props> = ({
  song,
  position,
  onRemove,
  onVote,
  isAdmin,
  isVoting = false,
}) => {
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
    <article className="group flex w-full min-w-0 items-center gap-2.5 rounded-2xl border border-theme bg-theme-surface p-3 transition-colors hover:border-theme-strong sm:gap-3">
      <div className="w-5 shrink-0 text-center sm:w-6">
        <span className="text-theme-subtle text-xs">{position}</span>
      </div>

      <img
        src={resolveSongThumbnail(song.thumbnailUrl)}
        alt=""
        className="h-12 w-12 shrink-0 rounded-xl border border-theme bg-theme-surface object-cover sm:h-14 sm:w-14"
        decoding="async"
        fetchPriority="low"
        loading="lazy"
      />

      <div className="min-w-0 flex-1 overflow-hidden">
        <h4 className="block max-w-full truncate text-left text-theme text-xs">
          {song.title}
        </h4>
        <div className="mt-1 flex min-w-0 items-center gap-1.5 overflow-hidden text-theme-muted text-xs">
          <span className="min-w-0 truncate">
            {song.artist || 'Unknown Artist'}
          </span>
          <span className="text-theme-subtle">•</span>
          <span className="shrink-0 text-theme-subtle text-xs">
            {formatPlaybackSeconds(song.duration)}
          </span>
          {providerUrl && (
            <Tooltip
              align="start"
              className="inline-flex shrink-0"
              content={`Open on ${getProviderDisplayName(song.sourceType)}`}
            >
              <a
                href={providerUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-7 min-w-7 cursor-pointer items-center justify-center rounded-lg text-theme-muted transition-colors hover:bg-theme hover:text-theme focus:outline-hidden focus:ring-2 focus:ring-secondary/40"
                aria-label={`Open ${song.title} on ${getProviderDisplayName(song.sourceType)}`}
              >
                <ProviderIcon
                  className="h-3.5 w-3.5 text-white"
                  provider={song.sourceType}
                />
              </a>
            </Tooltip>
          )}
        </div>
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-1.5">
        {onVote && (
          <Tooltip
            align="end"
            className="inline-flex"
            content="Vote this song up"
          >
            <motion.div whileTap={{ scale: 0.92 }}>
              <Button
                onClick={handleVote}
                disabled={isVoting}
                variant="tertiary"
                size="none"
                className="min-h-9 gap-1.5 rounded-xl px-2.5 font-pixel text-2xs"
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
                <span className="hidden min-[360px]:inline">
                  {isVoting ? 'Voting…' : 'Vote'}
                </span>
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
              className="min-h-9 min-w-9 rounded-xl p-2"
              aria-label="Remove from queue"
            >
              <TrashIcon className="h-4 w-4" />
            </Button>
          </Tooltip>
        )}
      </div>
    </article>
  );
};

export const QueueItem = React.memo(QueueItemComponent);
