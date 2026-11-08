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
    <div className="cast-square:flex-col cast-compact:gap-3 cast-compact:p-3 font-body flex h-screen w-screen flex-row gap-6 overflow-hidden p-6 max-sm:gap-2 max-sm:p-2">
      <div className="cast-square:h-auto cast-square:min-h-0 cast-landscape:w-[64%] cast-square:w-full cast-square:shrink cast-short-square:grow-3 cast-square-wide:grow-11 cast-square:basis-0 rounded-frame border-cast-border-strong dark:border-cast-border-strong-dark dark:bg-cast-panel-dark flex h-full w-[65%] shrink-0 flex-col overflow-hidden border bg-white/90 [contain:layout_paint] max-sm:grow-6">
        <div className="relative min-h-0 flex-1 bg-black">
          <PlayerLayer />
        </div>

        <div className="border-cast-border cast-compact:p-3 cast-compact:px-5 cast-short:py-2 dark:border-cast-border-dark dark:bg-cast-track-dark shrink-0 border-t bg-white px-8 py-5 max-sm:px-3.5 max-sm:py-2.5">
          <div className="cast-compact:gap-3 flex items-end gap-6 max-sm:gap-3">
            <div className="cast-short:hidden relative shrink-0">
              <img
                src={resolvePlaylistItemThumbnail(
                  currentPlaylistItem.thumbnailUrl,
                )}
                alt={currentPlaylistItem.title}
                decoding="async"
                className="cast-compact:h-14 cast-compact:w-14 border-cast-border dark:border-cast-border-dark h-20 w-20 rounded-xl border object-cover max-sm:h-12 max-sm:w-12"
              />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="cast-compact:mb-1 font-display cast-compact:text-lg text-text dark:text-dark-text mb-2 truncate text-2xl leading-tight max-sm:mb-1 max-sm:text-base">
                {currentPlaylistItem.title}
              </h1>
              <p className="cast-compact:text-sm text-text-muted dark:text-dark-text-muted truncate font-sans text-lg font-light max-sm:text-xs">
                {currentPlaylistItem.publisher || 'Unknown publisher'}
              </p>
            </div>

            <div className="flex shrink-0 items-center justify-center pr-2 max-sm:pr-0 max-sm:[&_svg]:size-5">
              {currentPlaylistItem.sourceType === 'soundcloud' && (
                <SoundCloudIcon className="text-text-muted dark:text-dark-text-muted h-8 w-8" />
              )}
              {currentPlaylistItem.sourceType !== 'soundcloud' && (
                <YouTubeIcon className="text-text-muted dark:text-dark-text-muted h-8 w-8" />
              )}
            </div>
          </div>

          <CastTrackProgress playlistItem={currentPlaylistItem} />
        </div>
      </div>

      <div className="cast-square:h-auto cast-square:min-h-0 cast-square:w-full cast-square:shrink cast-short-square:grow-2 cast-square-wide:grow-9 cast-square:basis-0 rounded-frame border-cast-border-strong cast-compact:p-3 dark:border-cast-border-strong-dark dark:bg-cast-panel-dark flex h-full min-w-0 flex-1 flex-col border bg-white/90 p-7 [contain:layout_paint] max-sm:grow-5 max-sm:p-2.5">
        <div className="cast-compact:mb-3 border-cast-border cast-compact:pb-3 dark:border-cast-border-dark mb-5 flex items-center justify-between gap-3 border-b pb-5 max-sm:mb-2 max-sm:pb-2">
          <h2 className="font-display text-text-muted tracking-banner dark:text-dark-text-muted text-sm uppercase">
            Up Next ({upNext.length})
          </h2>
          <div className="cast-compact:shrink-0 border-secondary/30 bg-surface/88 cast-compact:px-3 cast-compact:py-1.5 cast-compact:text-xs text-text-muted dark:bg-cast-surface-dark/88 dark:text-dark-text-muted flex items-center gap-2 rounded-full border px-4 py-2 text-sm max-sm:px-2 max-sm:py-1 max-sm:text-xs">
            <span className="bg-secondary h-2 w-2 rounded-full" />
            {participantCount}{' '}
            {participantCount === 1 ? labels.participant : labels.participants}
          </div>
        </div>

        <CastQueue playlistItems={upNext} />

        <div className="cast-compact:mt-3 cast-tiny-square:hidden cast-compact:gap-3 border-primary/30 bg-surface/88 cast-compact:p-3 dark:bg-cast-surface-dark/88 mt-5 grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4 rounded-3xl border p-4 max-sm:mt-2 max-sm:gap-2 max-sm:p-2">
          <div className="inline-flex shrink-0 items-center justify-center rounded-xl bg-white p-2">
            <QRCodeSVG
              className="cast-compact:h-18 cast-short:h-14 cast-compact:w-18 cast-short:w-14 h-24 w-24 max-sm:h-14 max-sm:w-14"
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
            <p className="text-secondary tracking-heading font-mono text-xs uppercase">
              Scan to join
            </p>
            <p className="font-display text-text dark:text-dark-text mt-3 truncate text-2xl">
              {roomName}
            </p>
            <p className="cast-short:hidden text-text-subtle dark:text-dark-text-subtle mt-2 text-sm max-sm:hidden">
              Add {labels.items} and vote from your phone
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const castLogoUrl = `${import.meta.env.BASE_URL}logo.png`;
