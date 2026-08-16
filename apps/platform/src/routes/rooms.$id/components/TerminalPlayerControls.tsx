import type { Song } from '@vibes/models';
import {
  TerminalButton,
  TerminalSection,
  TerminalSlider,
} from '@vibes/ui/konami';

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

      <TerminalSlider
        aria-label="Player volume"
        aria-valuetext={`${volume}%`}
        className="mt-4 border-[#71f5ad]/20 border-t pt-4"
        end={
          <span className="text-right text-[#dffff0] text-xs tabular-nums">
            {volume.toString().padStart(3, '0')}
          </span>
        }
        max={100}
        min={0}
        onValueChange={onVolumeChange}
        start={
          <TerminalButton
            className="px-0 py-0"
            onClick={onToggleMuted}
            variant="ghost"
          >
            [VOL] {volume === 0 ? 'MUTED' : 'LEVEL'}
          </TerminalButton>
        }
        value={volume}
      />

      {isCasting && castDeviceName && (
        <p className="mt-3 text-[#71f5ad] text-[0.65rem] uppercase">
          REMOTE OUTPUT: {castDeviceName}
        </p>
      )}
    </TerminalSection>
  );
}
