import { resolveSongThumbnail } from '@vibes/shared';
import { SoundCloudIcon, SpotifyIcon, YouTubeIcon } from '@vibes/ui';
import { QRCodeSVG } from 'qrcode.react';
import React from 'react';
import { useCast } from './CastProvider';
import { CastQueue } from './CastQueue';
import { PlayerLayer } from './PlayerLayer';

export const ActiveView: React.FC = () => {
  const { currentSong, queue, roomInfo, actualPositionMs, roomId } = useCast();

  if (!currentSong) return null;

  const joinUrl = `${window.location.origin}/${encodeURIComponent(roomId ?? '')}`;
  const upNext = queue.filter((song) => song.id !== currentSong.id);
  const participantCount = roomInfo?.participantCount ?? 0;
  const roomName = roomInfo?.name ?? roomId;

  return (
    <div className="cast-active-layout flex h-screen w-screen flex-row gap-6 overflow-hidden p-6 font-body">
      <div className="cast-panel cast-player-panel flex h-full w-[65%] shrink-0 flex-col overflow-hidden rounded-frame">
        <div className="relative min-h-0 flex-1 bg-black">
          <PlayerLayer />
        </div>

        <div className="cast-track-details-panel shrink-0 border-white/10 border-t bg-black/70 px-8 py-5">
          <div className="cast-track-summary flex items-end gap-6">
            <div className="cast-track-artwork relative shrink-0">
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-primary to-secondary opacity-30" />
              <img
                src={resolveSongThumbnail(currentSong.thumbnailUrl)}
                alt={currentSong.title}
                className="cast-track-thumbnail relative h-20 w-20 rounded-xl border border-white/20 object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="cast-track-title mb-2 truncate font-display text-2xl text-white leading-tight">
                {currentSong.title}
              </h1>
              <p className="cast-track-artist truncate font-light font-sans text-lg text-white/80">
                {currentSong.artist || 'Unknown Artist'}
              </p>
            </div>

            <div className="cast-track-provider flex shrink-0 items-center justify-center pr-2">
              {currentSong.sourceType === 'spotify' && (
                <SpotifyIcon className="h-8 w-8 text-white/50" />
              )}
              {currentSong.sourceType === 'soundcloud' && (
                <SoundCloudIcon className="h-8 w-8 text-white/50" />
              )}
              {currentSong.sourceType !== 'spotify' &&
                currentSong.sourceType !== 'soundcloud' && (
                  <YouTubeIcon className="h-8 w-8 text-white/50" />
                )}
            </div>
          </div>

          <div className="cast-track-progress mt-4">
            <div className="mb-2 flex justify-between font-mono text-sm text-white/60">
              <span>
                {Math.floor(actualPositionMs / 60000)}:
                {String(Math.floor((actualPositionMs / 1000) % 60)).padStart(
                  2,
                  '0',
                )}
              </span>
              <span>
                {Math.floor((currentSong.duration || 0) / 60)}:
                {String(Math.floor((currentSong.duration || 0) % 60)).padStart(
                  2,
                  '0',
                )}
              </span>
            </div>
            <progress
              aria-label="Playback progress"
              className="h-2 w-full appearance-none overflow-hidden rounded-full bg-white/20 [&::-moz-progress-bar]:bg-gradient-to-r [&::-moz-progress-bar]:from-primary [&::-moz-progress-bar]:to-secondary [&::-webkit-progress-bar]:bg-white/20 [&::-webkit-progress-value]:bg-gradient-to-r [&::-webkit-progress-value]:from-primary [&::-webkit-progress-value]:to-secondary"
              max={(currentSong.duration || 1) * 1000}
              value={Math.min(
                actualPositionMs,
                (currentSong.duration || 1) * 1000,
              )}
            />
          </div>
        </div>
      </div>

      <div className="cast-panel cast-side-panel flex h-full min-w-0 flex-1 flex-col rounded-frame p-7">
        <div className="cast-side-header mb-5 flex items-center justify-between gap-3 border-white/10 border-b pb-5">
          <h2 className="font-display text-sm text-theme-muted uppercase tracking-banner">
            Up Next ({upNext.length})
          </h2>
          <div className="cast-listener-badge flex items-center gap-2 rounded-full border border-secondary/30 bg-black/30 px-4 py-2 text-sm text-theme-muted">
            <span className="h-2 w-2 animate-pulse rounded-full bg-secondary" />
            {participantCount}{' '}
            {participantCount === 1 ? 'listener' : 'listeners'}
          </div>
        </div>

        <CastQueue songs={upNext} />

        <div className="cast-room-card mt-5 rounded-3xl border border-primary/30 bg-black/30 p-4">
          <div className="inline-flex shrink-0 items-center justify-center rounded-2xl bg-white p-2 shadow-lg">
            <QRCodeSVG
              className="cast-join-code h-24 w-24"
              value={joinUrl}
              size={96}
              bgColor="#ffffff"
              fgColor="#000000"
              level="M"
            />
          </div>
          <div className="min-w-0">
            <p className="font-mono text-secondary text-xs uppercase tracking-heading">
              Scan to join
            </p>
            <p className="mt-3 truncate font-display text-2xl text-theme">
              {roomName}
            </p>
            <p className="cast-room-help mt-2 text-sm text-theme-subtle">
              Add songs and vote from your phone
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
