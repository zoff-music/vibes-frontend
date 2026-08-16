import {
  generatedPlaylistPromptMaxLength,
  type Providers,
  type PublicRoom,
} from '@vibes/models';
import { usePageVisibility } from '@vibes/shared';
import {
  playlistGenerationMessageIntervalMs,
  playlistGenerationMessages,
} from '@vibes/ui/shared';
import {
  type ChangeEvent,
  type KeyboardEvent,
  useEffect,
  useState,
} from 'react';
import { Link, useFetcher } from 'react-router';
import {
  TerminalButton,
  TerminalSection,
} from '../../../components/konami/TerminalPrimitives';
import { TerminalShell } from '../../../components/konami/TerminalShell';
import type { HomeActionData } from '../action';

interface TerminalHomeProps {
  isAIMode: boolean;
  onJoinRoom: (roomId?: string) => void;
  onRoomCodeChange: (value: string) => void;
  onStartSession: () => void;
  onToggleAIMode: () => void;
  pendingRoomSlug: string | null;
  placeholder: string;
  providers: Providers;
  publicRooms: PublicRoom[];
  roomCode: string;
  totalListeners: number;
}

export function TerminalHome({
  isAIMode,
  onJoinRoom,
  onRoomCodeChange,
  onStartSession,
  onToggleAIMode,
  pendingRoomSlug,
  placeholder,
  providers,
  publicRooms,
  roomCode,
  totalListeners,
}: TerminalHomeProps) {
  const fetcher = useFetcher<HomeActionData>();
  const isTabVisible = usePageVisibility();
  const [generationMessageIndex, setGenerationMessageIndex] = useState(0);
  const isGenerating = fetcher.state !== 'idle';

  useEffect(() => {
    if (!isGenerating || !isTabVisible) return;

    const interval = window.setInterval(() => {
      setGenerationMessageIndex(
        (current) => (current + 1) % playlistGenerationMessages.length,
      );
    }, playlistGenerationMessageIntervalMs);
    return () => window.clearInterval(interval);
  }, [isGenerating, isTabVisible]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onRoomCodeChange(event.target.value);
  };

  const handleJoin = () => {
    onJoinRoom();
  };

  const handleGenerate = () => {
    const prompt = roomCode.trim();
    if (!prompt || isGenerating) return;
    setGenerationMessageIndex(0);
    fetcher.submit({ intent: 'generateRoom', prompt }, { method: 'post' });
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') return;
    if (isAIMode) {
      handleGenerate();
      return;
    }
    handleJoin();
  };

  return (
    <TerminalShell
      channel="SIGNAL DIRECTORY"
      title="HOME"
      footer={
        <>
          <span>{totalListeners.toString().padStart(3, '0')} LISTENERS</span>
          <span>KONAMI LINK ACTIVE</span>
        </>
      }
    >
      <div className="grid flex-1 gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="flex min-h-0 flex-col gap-4">
          <section className="border border-[#71f5ad]/35 px-4 py-8 text-center sm:py-10">
            <p className="mb-5 text-[#71f5ad]/65 text-[0.65rem] uppercase tracking-[0.2em]">
              Shared room protocol initialized
            </p>
            <div
              aria-label="Zoff OS"
              className="text-[#dffff0] text-[clamp(1.2rem,4vw,2.4rem)] leading-[1.35] [text-shadow:0_0_0.8rem_rgba(113,245,173,0.85)]"
              role="img"
            >
              <div>╔════════════════════╗</div>
              <div>║　　ゾ フ O S　　║</div>
              <div>╚════════════════════╝</div>
            </div>
            <p className="mt-6 text-[#b9ffda] text-xs uppercase tracking-[0.12em]">
              Signal acquired. Select a room to transmit.
              <span className="terminal-cursor">_</span>
            </p>
          </section>

          <TerminalSection
            label={isAIMode ? 'AI PLAYLIST COMMAND' : 'ROOM UPLINK'}
            status={isGenerating ? 'PROCESSING' : 'READY'}
          >
            <label
              className="mb-2 block text-[#a6ffd0]/70 text-[0.6rem] uppercase tracking-[0.16em]"
              htmlFor="terminal-room-command"
            >
              {isAIMode ? 'Describe requested signal' : 'Enter channel name'}
            </label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <span className="hidden self-center text-[#71f5ad] sm:inline">
                &gt;
              </span>
              <input
                autoComplete="off"
                className="min-w-0 flex-1 border border-[#71f5ad]/55 bg-black/40 px-3 py-2.5 font-mono text-[#e0ffef] text-sm placeholder:text-[#71f5ad]/35 focus:border-[#a6ffd0] focus:outline-none focus:ring-1 focus:ring-[#71f5ad] disabled:opacity-50"
                disabled={isGenerating}
                id="terminal-room-command"
                {...(isAIMode && {
                  maxLength: generatedPlaylistPromptMaxLength,
                })}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                type="text"
                value={roomCode}
              />
              <TerminalButton
                className="shrink-0"
                disabled={!roomCode.trim() || isGenerating}
                onClick={isAIMode ? handleGenerate : handleJoin}
              >
                {isAIMode ? '[ EXECUTE ]' : '[ JOIN ]'}
              </TerminalButton>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <TerminalButton onClick={onStartSession}>
                [ NEW ROOM ]
              </TerminalButton>
              <TerminalButton onClick={onToggleAIMode}>
                {isAIMode ? '[ ROOM MODE ]' : '[ AI PLAYLIST ]'}
              </TerminalButton>
            </div>
            {isGenerating && (
              <p className="mt-3 text-[#71f5ad] text-xs" aria-live="polite">
                {playlistGenerationMessages[generationMessageIndex]}
                <span className="terminal-cursor">_</span>
              </p>
            )}
            {fetcher.data?.error && (
              <p className="mt-3 text-[#ff8e8e] text-xs">
                ERROR: {fetcher.data.error}
              </p>
            )}
          </TerminalSection>
        </div>

        <div className="flex min-h-0 flex-col gap-4">
          <TerminalSection
            className="flex-1"
            label="ACTIVE CHANNELS"
            status={`${publicRooms.length.toString().padStart(2, '0')} FOUND`}
          >
            <div className="space-y-2">
              {publicRooms.length === 0 && (
                <p className="border border-[#71f5ad]/25 border-dashed p-4 text-[#a6ffd0]/55 text-xs">
                  NO PUBLIC SIGNALS DETECTED.
                </p>
              )}
              {publicRooms.map((room, index) => (
                <button
                  className="group grid w-full cursor-pointer grid-cols-[2rem_1fr_auto] items-center gap-2 border border-[#71f5ad]/25 bg-black/20 px-3 py-3 text-left font-mono hover:border-[#71f5ad] hover:bg-[#071b12] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#71f5ad]"
                  key={room.id}
                  onClick={() => onJoinRoom(room.id)}
                  type="button"
                >
                  <span className="text-[#71f5ad]/55 text-xs">
                    {(index + 1).toString().padStart(2, '0')}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[#dffff0] text-xs uppercase">
                      {room.name}
                    </span>
                    <span className="mt-1 block text-[#a6ffd0]/55 text-[0.6rem]">
                      {room.listenerCount} USERS / {room.songCount} TRACKS
                    </span>
                  </span>
                  <span className="text-[#71f5ad] text-xs">ENTER &gt;</span>
                </button>
              ))}
            </div>
          </TerminalSection>

          <TerminalSection label="SYSTEM STATUS" status="ONLINE">
            <div className="space-y-2 text-[0.65rem] uppercase tracking-[0.08em]">
              <p className="flex justify-between gap-3">
                <span>Providers</span>
                <strong className="text-right text-[#dffff0]">
                  {providers.join(' / ') || 'NONE'}
                </strong>
              </p>
              <p className="flex justify-between gap-3">
                <span>Memory test</span>
                <strong className="text-[#dffff0]">640K VIBES OK</strong>
              </p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 border-[#71f5ad]/20 border-t pt-3 text-[#a6ffd0]/70">
                <Link className="hover:text-[#dffff0]" to="/terms-of-service">
                  [TERMS]
                </Link>
                <Link className="hover:text-[#dffff0]" to="/privacy-policy">
                  [PRIVACY]
                </Link>
                <Link className="hover:text-[#dffff0]" to="/security">
                  [SECURITY]
                </Link>
              </div>
            </div>
          </TerminalSection>
        </div>
      </div>
      {pendingRoomSlug && (
        <div className="absolute inset-0 z-30 grid place-items-center bg-[#010705]/95 p-6">
          <div className="border border-[#71f5ad] bg-[#020e09] p-6 text-center text-sm">
            OPENING /ROOM/{pendingRoomSlug.toUpperCase()}
            <span className="terminal-cursor">_</span>
          </div>
        </div>
      )}
    </TerminalShell>
  );
}
