import { resolveSongThumbnail } from '@vibes/shared';
import { QueueList, SoundCloudIcon, SpotifyIcon, YouTubeIcon } from '@vibes/ui';
import { QRCodeSVG } from 'qrcode.react';
import React from 'react';
import { useCast } from './CastProvider';
import { PlayerLayer } from './PlayerLayer';

export const ActiveView: React.FC = () => {
  const { currentSong, queue, roomInfo, actualPositionMs, roomId } = useCast();

  if (!currentSong) return null;

  const joinUrl = `${window.location.origin}/rooms/${roomId}`;
  const upNext = queue.filter((song) => song.id !== currentSong.id);
  const participantCount = roomInfo?.participantCount ?? 0;
  const roomName = roomInfo?.name ?? roomId;

  return (
    <div className="flex h-screen w-screen flex-row gap-6 overflow-hidden p-6 font-body">
      <div className="cast-panel relative h-full w-[65%] shrink-0 overflow-hidden rounded-frame">
        <PlayerLayer />

        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/80 to-transparent px-10 pt-32 pb-10">
          <div className="flex items-end gap-6">
            <div className="relative shrink-0">
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-primary to-secondary opacity-30" />
              <img
                src={resolveSongThumbnail(currentSong.thumbnailUrl)}
                alt={currentSong.title}
                className="relative h-28 w-28 rounded-xl border border-white/20 object-cover"
              />
            </div>
            <div className="mb-2 min-w-0 flex-1">
              <h1 className="mb-2 truncate font-display text-4xl text-white leading-tight">
                {currentSong.title}
              </h1>
              <p className="truncate font-light font-sans text-2xl text-white/80">
                {currentSong.artist || 'Unknown Artist'}
              </p>
              {(currentSong.voteCount || 0) > 0 && (
                <div className="mt-3 flex items-center gap-2">
                  <span className="flex items-center gap-2 rounded-full border border-white/5 bg-white/10 px-3 py-1.5 font-medium text-base text-secondary">
                    <span className="text-lg">🔥</span> {currentSong.voteCount}{' '}
                    votes
                  </span>
                </div>
              )}
            </div>

            <div className="mb-2 flex shrink-0 items-center justify-center pr-4 pb-1">
              {currentSong.sourceType === 'spotify' && (
                <SpotifyIcon className="h-10 w-10 text-white/50" />
              )}
              {currentSong.sourceType === 'soundcloud' && (
                <SoundCloudIcon className="h-10 w-10 text-white/50" />
              )}
              {currentSong.sourceType !== 'spotify' &&
                currentSong.sourceType !== 'soundcloud' && (
                  <YouTubeIcon className="h-10 w-10 text-white/50" />
                )}
            </div>
          </div>

          <div className="mt-8">
            <div className="mb-3 flex justify-between font-mono text-lg text-white/60">
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

      <div className="cast-panel flex h-full min-w-0 flex-1 flex-col rounded-frame p-7">
        <div className="mb-6 flex items-center justify-between border-white/10 border-b pb-5">
          <h2 className="font-display text-sm text-theme-muted uppercase tracking-banner">
            Up Next
          </h2>
          <div className="flex items-center gap-2 rounded-full border border-secondary/30 bg-black/30 px-4 py-2 text-sm text-theme-muted">
            <span className="h-2 w-2 animate-pulse rounded-full bg-secondary" />
            {participantCount}{' '}
            {participantCount === 1 ? 'listener' : 'listeners'}
          </div>
        </div>

        <div className="custom-scrollbar flex-1 overflow-y-auto pr-2">
          <QueueList songs={upNext} {...(roomId && { roomId })} />
        </div>

        <div className="mt-6 rounded-3xl border border-primary/30 bg-black/30 p-5">
          <div className="flex items-center gap-5">
            <div className="inline-flex shrink-0 items-center justify-center rounded-2xl bg-white p-2 shadow-lg">
              <QRCodeSVG
                value={joinUrl}
                size={108}
                bgColor="#ffffff"
                fgColor="#000000"
                level="M"
              />
            </div>
            <div className="min-w-0 flex-1 text-left">
              <div className="mb-3 flex items-center gap-3">
                <img
                  src="/casting/receiver/logo.png"
                  alt="Zoff"
                  className="h-10 w-10 object-contain"
                />
                <p className="font-mono text-secondary text-xs uppercase tracking-heading">
                  Scan to join
                </p>
              </div>
              <p className="truncate font-display text-2xl text-theme">
                {roomName}
              </p>
              <p className="mt-2 flex items-center gap-2 text-base text-theme-muted">
                <span className="h-2 w-2 rounded-full bg-secondary" />
                {participantCount}{' '}
                {participantCount === 1 ? 'listener' : 'listeners'} · Add songs
                and vote
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
