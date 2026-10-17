import { resolvePlaylistItemThumbnail } from '@vibes/shared';
import { getRoomLabels } from '@vibes/ui/shared';
import { SoundCloudIcon, YouTubeIcon } from '@vibes/ui/web';
import React from 'preact/compat';
import { QRCodeSVG } from 'qrcode.react';
import { useCast } from './CastProvider';
import { CastQueue } from './CastQueue';
import { CastTrackProgress } from './CastTrackProgress';
import { PlayerLayer } from './PlayerLayer';

export const ActiveView: React.FC = () => {
  const { currentPlaylistItem, queue, roomInfo, roomId } = useCast();
  const labels = getRoomLabels(roomInfo?.roomType ?? 'MUSIC');

  if (!currentPlaylistItem) return null;

  const joinUrl = `${window.location.origin}/${encodeURIComponent(roomId ?? '')}`;
  const upNext = queue.filter(
    (playlistItem) => playlistItem.id !== currentPlaylistItem.id,
  );
  const participantCount = roomInfo?.participantCount ?? 0;
  const roomName = roomInfo?.name ?? roomId;

  return (
    <div className="flex h-screen w-screen flex-row cast-square:flex-col cast-compact:gap-3 gap-6 overflow-hidden cast-compact:p-3 p-6 font-body max-sm:gap-2 max-sm:p-2">
      <div className="flex cast-square:h-auto h-full cast-square:min-h-0 cast-landscape:w-[64%] cast-square:w-full w-[65%] cast-square:shrink shrink-0 cast-short-square:grow-3 cast-square-wide:grow-11 cast-square:basis-0 flex-col overflow-hidden rounded-frame border border-cast-border-strong bg-white/90 [contain:layout_paint] max-sm:grow-6 dark:border-cast-border-strong-dark dark:bg-cast-panel-dark">
        <div className="relative min-h-0 flex-1 bg-black">
          <PlayerLayer />
        </div>

        <div className="shrink-0 border-cast-border border-t bg-white cast-compact:p-3 cast-compact:px-5 px-8 cast-short:py-2 py-5 max-sm:px-3.5 max-sm:py-2.5 dark:border-cast-border-dark dark:bg-cast-track-dark">
          <div className="flex items-end cast-compact:gap-3 gap-6 max-sm:gap-3">
            <div className="relative cast-short:hidden shrink-0">
              <img
                src={resolvePlaylistItemThumbnail(
                  currentPlaylistItem.thumbnailUrl,
                )}
                alt={currentPlaylistItem.title}
                decoding="async"
                className="cast-compact:h-14 h-20 cast-compact:w-14 w-20 rounded-xl border border-cast-border object-cover max-sm:h-12 max-sm:w-12 dark:border-cast-border-dark"
              />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="cast-compact:mb-1 mb-2 truncate font-display cast-compact:text-lg text-2xl text-text leading-tight max-sm:mb-1 max-sm:text-base dark:text-dark-text">
                {currentPlaylistItem.title}
              </h1>
              <p className="truncate font-light font-sans cast-compact:text-sm text-lg text-text-muted max-sm:text-xs dark:text-dark-text-muted">
                {currentPlaylistItem.publisher || 'Unknown publisher'}
              </p>
            </div>

            <div className="flex shrink-0 items-center justify-center pr-2 max-sm:pr-0 max-sm:[&_svg]:size-5">
              {currentPlaylistItem.sourceType === 'soundcloud' && (
                <SoundCloudIcon className="h-8 w-8 text-text-muted dark:text-dark-text-muted" />
              )}
              {currentPlaylistItem.sourceType !== 'soundcloud' && (
                <YouTubeIcon className="h-8 w-8 text-text-muted dark:text-dark-text-muted" />
              )}
            </div>
          </div>

          <CastTrackProgress playlistItem={currentPlaylistItem} />
        </div>
      </div>

      <div className="flex cast-square:h-auto h-full cast-square:min-h-0 cast-square:w-full min-w-0 flex-1 cast-square:shrink cast-short-square:grow-2 cast-square-wide:grow-9 cast-square:basis-0 flex-col rounded-frame border border-cast-border-strong bg-white/90 cast-compact:p-3 p-7 [contain:layout_paint] max-sm:grow-5 max-sm:p-2.5 dark:border-cast-border-strong-dark dark:bg-cast-panel-dark">
        <div className="cast-compact:mb-3 mb-5 flex items-center justify-between gap-3 border-cast-border border-b cast-compact:pb-3 pb-5 max-sm:mb-2 max-sm:pb-2 dark:border-cast-border-dark">
          <h2 className="font-display text-sm text-text-muted uppercase tracking-banner dark:text-dark-text-muted">
            Up Next ({upNext.length})
          </h2>
          <div className="flex cast-compact:shrink-0 items-center gap-2 rounded-full border border-secondary/30 bg-surface/88 cast-compact:px-3 px-4 cast-compact:py-1.5 py-2 cast-compact:text-xs text-sm text-text-muted max-sm:px-2 max-sm:py-1 max-sm:text-xs dark:bg-cast-surface-dark/88 dark:text-dark-text-muted">
            <span className="h-2 w-2 rounded-full bg-secondary" />
            {participantCount}{' '}
            {participantCount === 1 ? labels.participant : labels.participants}
          </div>
        </div>

        <CastQueue playlistItems={upNext} />

        <div className="cast-compact:mt-3 mt-5 grid cast-tiny-square:hidden grid-cols-[auto_minmax(0,1fr)] items-center cast-compact:gap-3 gap-4 rounded-3xl border border-primary/30 bg-surface/88 cast-compact:p-3 p-4 max-sm:mt-2 max-sm:gap-2 max-sm:p-2 dark:bg-cast-surface-dark/88">
          <div className="inline-flex shrink-0 items-center justify-center rounded-xl bg-white p-2">
            <QRCodeSVG
              className="cast-compact:h-18 cast-short:h-14 h-24 cast-compact:w-18 cast-short:w-14 w-24 max-sm:h-14 max-sm:w-14"
              value={joinUrl}
              size={96}
              bgColor="#ffffff"
              fgColor="#000000"
              level="H"
              marginSize={4}
              title={`Join ${roomName}`}
              imageSettings={{
                src: castLogoUrl,
                height: 18,
                width: 18,
                excavate: true,
              }}
            />
          </div>
          <div className="min-w-0">
            <p className="font-mono text-secondary text-xs uppercase tracking-heading">
              Scan to join
            </p>
            <p className="mt-3 truncate font-display text-2xl text-text dark:text-dark-text">
              {roomName}
            </p>
            <p className="mt-2 cast-short:hidden text-sm text-text-subtle max-sm:hidden dark:text-dark-text-subtle">
              Add {labels.items} and vote from your phone
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const castLogoUrl = `${import.meta.env.BASE_URL}logo.png`;
