import type { Song } from '@vibes/models';
import {
  TerminalButton,
  TerminalSection,
} from '../../../components/konami/TerminalPrimitives';

interface TerminalPlayerControlsProps {
  canPlay: boolean;
  canSkip: boolean;
  castDeviceName?: string | null;
  currentSong: Song | null;
  isCasting: boolean;
  isPlaying: boolean;
  isSkipping: boolean;
  onAddSong: () => void;
  onConnectSpotify: () => void;
  onOpenCast: () => void;
  onPause: () => void;
  onPlay: () => void;
  onReset: () => void;
  onSkip: () => void;
  onToggleMuted: () => void;
  onVolumeChange: (volume: number) => void;
  showReset: boolean;
  showSpotifyConnect: boolean;
  volume: number;
}

export function TerminalPlayerControls({
  canPlay,
  canSkip,
  castDeviceName,
  currentSong,
  isCasting,
  isPlaying,
  isSkipping,
  onAddSong,
  onConnectSpotify,
  onOpenCast,
  onPause,
  onPlay,
  onReset,
  onSkip,
  onToggleMuted,
  onVolumeChange,
  showReset,
  showSpotifyConnect,
  volume,
}: TerminalPlayerControlsProps) {
  const handleVolumeInput = (event: React.FormEvent<HTMLInputElement>) => {
    onVolumeChange(Number(event.currentTarget.value));
  };

  return (
    <TerminalSection
      label="PLAYBACK CONTROL"
      status={isPlaying ? 'TRANSMITTING' : 'PAUSED'}
    >
      <div className="mb-4 min-w-0 border-[#71f5ad]/20 border-b pb-4">
        <p className="text-[#71f5ad]/55 text-[0.6rem] uppercase tracking-[0.16em]">
          CURRENT SIGNAL
        </p>
        <p className="mt-2 truncate text-[#e0ffef] text-sm uppercase">
          {currentSong?.title ?? 'NO TRACK MOUNTED'}
        </p>
        <p className="mt-1 truncate text-[#a6ffd0]/60 text-xs uppercase">
          {currentSong?.artist ?? 'WAITING FOR INPUT'}
          {currentSong && ` / ${currentSong.sourceType}`}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <TerminalButton
          disabled={!canPlay}
          onClick={isPlaying ? onPause : onPlay}
        >
          [F1] {isPlaying ? 'PAUSE' : 'PLAY'}
        </TerminalButton>
        <TerminalButton disabled={!canSkip || isSkipping} onClick={onSkip}>
          [F2] {isSkipping ? 'SKIPPING' : 'SKIP'}
        </TerminalButton>
        {showReset && (
          <TerminalButton onClick={onReset}>[F3] RESYNC</TerminalButton>
        )}
        {!showReset && <TerminalButton disabled>[F3] SYNCED</TerminalButton>}
        <TerminalButton onClick={onOpenCast}>
          [F4] {isCasting ? 'CAST ON' : 'CAST'}
        </TerminalButton>
        <TerminalButton onClick={onAddSong}>[F5] ADD SONG</TerminalButton>
        {showSpotifyConnect && (
          <TerminalButton onClick={onConnectSpotify}>
            [F6] SPOTIFY LINK
          </TerminalButton>
        )}
      </div>

      <div className="mt-4 grid items-center gap-3 border-[#71f5ad]/20 border-t pt-4 sm:grid-cols-[auto_1fr_auto]">
        <button
          className="cursor-pointer text-left font-mono text-[#b9ffda] text-xs uppercase hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#71f5ad]"
          onClick={onToggleMuted}
          type="button"
        >
          [VOL] {volume === 0 ? 'MUTED' : 'LEVEL'}
        </button>
        <div className="relative">
          <input
            aria-label="Player volume"
            aria-valuetext={`${volume}%`}
            className="peer absolute inset-x-0 -inset-y-2 z-10 w-full cursor-pointer opacity-0"
            max="100"
            min="0"
            onInput={handleVolumeInput}
            type="range"
            value={volume}
          />
          <div className="pointer-events-none h-3 border border-[#71f5ad]/45 bg-black p-0.5 peer-focus-visible:ring-1 peer-focus-visible:ring-[#a6ffd0] peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-[#020e09]">
            <div
              className="h-full bg-[repeating-linear-gradient(90deg,#71f5ad_0_9px,transparent_9px_12px)]"
              style={{ width: `${volume}%` }}
            />
            <div
              className="absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 border-2 border-[#020e09] bg-[#a6ffd0] shadow-[0_0_0.75rem_rgba(113,245,173,0.65)] outline outline-[#71f5ad]/75"
              style={{
                left: `calc(${volume}% + ${10 - volume * 0.2}px)`,
              }}
            />
          </div>
        </div>
        <span className="text-right text-[#dffff0] text-xs tabular-nums">
          {volume.toString().padStart(3, '0')}
        </span>
      </div>

      {isCasting && castDeviceName && (
        <p className="mt-3 text-[#71f5ad] text-[0.65rem] uppercase">
          REMOTE OUTPUT: {castDeviceName}
        </p>
      )}
    </TerminalSection>
  );
}
