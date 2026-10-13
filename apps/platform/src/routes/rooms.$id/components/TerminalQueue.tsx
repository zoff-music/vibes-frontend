import type { PlaylistItem } from '@vibes/models';
import {
  TerminalButton,
  TerminalFeedback,
  TerminalSection,
} from '@vibes/ui/konami';
import { useProgressiveList } from '@vibes/ui/web';
import { PlaybackProgress } from './PlaybackProgress';

interface TerminalQueueProps {
  playlistItems: PlaylistItem[];
  currentPlaylistItem: PlaylistItem | null;
  isPlaying: boolean;
  isHost: boolean;
  isSSR: boolean;
  isAdmin: boolean;
  votingPlaylistItemId: string | null;
  onVote: (id: string) => void;
  onRemove: (id: string) => void;
}

export function TerminalQueue({
  playlistItems,
  currentPlaylistItem: currentPlaylistItemData,
  isPlaying,
  isHost,
  isSSR,
  isAdmin,
  votingPlaylistItemId,
  onVote: handleVote,
  onRemove: handleRemove,
}: TerminalQueueProps) {
  const queuedPlaylistItems = playlistItems.filter(
    (item) => item.id !== currentPlaylistItemData?.id,
  );
  const [terminalVisibleCount, terminalSentinelRef] = useProgressiveList(
    queuedPlaylistItems.length,
  );
  const visibleQueuedPlaylistItems = queuedPlaylistItems.slice(
    0,
    terminalVisibleCount,
  );

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4 lg:col-span-3 lg:min-h-0 lg:overflow-y-auto">
      <TerminalSection
        label="SERVER SIGNAL"
        status={isPlaying ? 'PLAYING' : 'PAUSED'}
      >
        {isHost && <TerminalFeedback>YOU ARE HOSTING</TerminalFeedback>}
        {!currentPlaylistItemData && (
          <TerminalFeedback>
            NO TRACK MOUNTED. QUEUE A SIGNAL TO BEGIN.
          </TerminalFeedback>
        )}
        {currentPlaylistItemData && (
          <>
            <div className="grid grid-cols-[auto_1fr_auto] gap-x-3 gap-y-1 text-xs uppercase">
              <span className="text-[#71f5ad]/55">TRACK</span>
              <strong className="min-w-0 truncate text-[#e0ffef]">
                {currentPlaylistItemData.title}
              </strong>
              <span className="text-[#71f5ad]">
                {currentPlaylistItemData.sourceType.toUpperCase()}
              </span>
              <span className="text-[#71f5ad]/55">ARTIST</span>
              <span className="min-w-0 truncate text-[#a6ffd0]/70">
                {currentPlaylistItemData.publisher || 'UNKNOWN'}
              </span>
              <span className="text-[#a6ffd0]/55 tabular-nums">
                {formatTime(currentPlaylistItemData.duration * 1000)}
              </span>
            </div>
            <PlaybackProgress
              durationMs={currentPlaylistItemData.duration * 1000}
              isSSR={isSSR}
              terminalMode
            />
          </>
        )}
      </TerminalSection>

      <TerminalSection
        label="QUEUE DIRECTORY"
        status={`${queuedPlaylistItems.length.toString().padStart(2, '0')} WAITING`}
      >
        <div className="space-y-1.5">
          {queuedPlaylistItems.length === 0 && (
            <TerminalFeedback>END OF QUEUE.</TerminalFeedback>
          )}
          {visibleQueuedPlaylistItems.map((playlistItem, index) => (
            <article
              className="grid grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-2 border border-[#71f5ad]/20 bg-black/15 px-2.5 py-2.5 text-xs"
              key={playlistItem.id}
            >
              <span className="text-[#71f5ad]/45 tabular-nums">
                {(index + 1).toString().padStart(2, '0')}
              </span>
              <div className="min-w-0">
                <p className="truncate text-[#dffff0] uppercase">
                  {playlistItem.title}
                </p>
                <p className="mt-1 truncate text-[#a6ffd0]/50 text-[0.6rem] uppercase">
                  {playlistItem.publisher || 'UNKNOWN'} /{' '}
                  {playlistItem.sourceType} /{' '}
                  {formatTime(playlistItem.duration * 1000)}
                </p>
              </div>
              <div className="flex gap-1">
                <TerminalButton
                  aria-label={`Vote for ${playlistItem.title}`}
                  className="px-2 py-1"
                  disabled={Boolean(votingPlaylistItemId)}
                  onClick={() => handleVote(playlistItem.id)}
                >
                  +{playlistItem.voteCount ?? 0}
                </TerminalButton>
                {isAdmin && (
                  <TerminalButton
                    aria-label={`Remove ${playlistItem.title}`}
                    className="px-2 py-1"
                    onClick={() => handleRemove(playlistItem.id)}
                    variant="danger"
                  >
                    DEL
                  </TerminalButton>
                )}
              </div>
            </article>
          ))}
          {terminalVisibleCount < queuedPlaylistItems.length && (
            <div
              aria-hidden="true"
              className="h-10"
              ref={terminalSentinelRef}
            />
          )}
        </div>
      </TerminalSection>
    </div>
  );
}
