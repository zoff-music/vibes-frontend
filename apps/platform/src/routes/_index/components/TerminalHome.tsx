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
      <div className="flex flex-1 flex-col gap-4">
        <section className="flex flex-wrap items-center gap-2 border border-[#71f5ad]/30 bg-[#020e09] p-2">
          <div className="min-w-0 flex-1 px-2 py-1">
            <p className="truncate text-[#dffff0] text-sm uppercase">
              ZOFF / SIGNAL DIRECTORY
            </p>
            <p className="mt-1 text-[#71f5ad]/55 text-[0.58rem] uppercase tracking-[0.12em]">
              PUBLIC ROOM DISCOVERY / SHARED PLAYBACK PROTOCOL
            </p>
          </div>
          <TerminalButton onClick={onStartSession}>
            [F1] NEW ROOM
          </TerminalButton>
          <TerminalButton onClick={onToggleAIMode}>
            {isAIMode ? '[F2] ROOM UPLINK' : '[F2] AI PLAYLIST'}
          </TerminalButton>
        </section>

        <div className="grid min-h-0 flex-1 content-start items-start gap-4 lg:grid-cols-5">
          <TerminalSection
            className="lg:col-span-2"
            label={isAIMode ? 'AI PLAYLIST COMMAND' : 'ROOM UPLINK'}
            status={isGenerating ? 'PROCESSING' : 'READY'}
          >
            <div className="border-[#71f5ad]/20 border-b pb-4">
              <p className="text-[#71f5ad]/55 text-[0.6rem] uppercase tracking-[0.16em]">
                CURRENT COMMAND
              </p>
              <p className="mt-2 text-[#e0ffef] text-sm uppercase">
                {isAIMode
                  ? 'GENERATE PLAYLIST SIGNAL'
                  : 'CONNECT TO ROOM CHANNEL'}
              </p>
              <p className="mt-1 text-[#a6ffd0]/55 text-[0.62rem] uppercase">
                {isAIMode
                  ? 'DESCRIBE THE SOUND TO COMPILE'
                  : 'ENTER AN EXISTING CHANNEL NAME'}
              </p>
            </div>

            <label
              className="mt-4 mb-2 block text-[#a6ffd0]/70 text-[0.6rem] uppercase tracking-[0.16em]"
              htmlFor="terminal-room-command"
            >
              {isAIMode ? 'PLAYLIST PROMPT' : 'CHANNEL IDENTIFIER'}
            </label>
            <div className="flex items-stretch gap-2">
              <span className="flex items-center border border-[#71f5ad]/35 bg-black/40 px-3 text-[#71f5ad]">
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
            </div>
            <TerminalButton
              className="mt-2 w-full text-center"
              disabled={!roomCode.trim() || isGenerating}
              onClick={isAIMode ? handleGenerate : handleJoin}
            >
              {isAIMode
                ? '[ EXECUTE PLAYLIST COMMAND ]'
                : '[ OPEN ROOM CHANNEL ]'}
            </TerminalButton>
            {isGenerating && (
              <p
                className="mt-3 border border-[#71f5ad]/20 bg-black/20 p-3 text-[#71f5ad] text-xs"
                aria-live="polite"
              >
                {playlistGenerationMessages[generationMessageIndex]}
                <span className="terminal-cursor">_</span>
              </p>
            )}
            {fetcher.data?.error && (
              <p className="mt-3 text-[#ff8e8e] text-xs">
                ERROR: {fetcher.data.error}
              </p>
            )}

            <div className="mt-4 border-[#71f5ad]/20 border-t pt-4">
              <p className="mb-2 text-[#71f5ad]/55 text-[0.6rem] uppercase tracking-[0.16em]">
                COMMAND REGISTERS
              </p>
              <div className="space-y-2 text-[0.65rem] uppercase tracking-[0.08em]">
                <p className="flex justify-between gap-3">
                  <span>INTERFACE</span>
                  <strong className="text-[#dffff0]">
                    {isAIMode ? 'AI GENERATOR' : 'ROOM DIRECTORY'}
                  </strong>
                </p>
                <p className="flex justify-between gap-3">
                  <span>LISTENERS</span>
                  <strong className="text-[#dffff0]">
                    {totalListeners.toString().padStart(3, '0')} ONLINE
                  </strong>
                </p>
                <p className="flex justify-between gap-3">
                  <span>ROOM INDEX</span>
                  <strong className="text-[#dffff0]">
                    {publicRooms.length.toString().padStart(2, '0')} VISIBLE
                  </strong>
                </p>
              </div>
            </div>
          </TerminalSection>

          <div className="flex min-h-0 flex-col gap-4 lg:col-span-3">
            <TerminalSection
              className="flex-1"
              label="ACTIVE CHANNELS"
              status={`${publicRooms.length.toString().padStart(2, '0')} FOUND`}
            >
              <div className="space-y-1.5">
                {publicRooms.length === 0 && (
                  <p className="border border-[#71f5ad]/25 border-dashed p-4 text-[#a6ffd0]/55 text-xs">
                    NO PUBLIC SIGNALS DETECTED.
                  </p>
                )}
                {publicRooms.map((room, index) => (
                  <button
                    className="group grid w-full cursor-pointer grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-2 border border-[#71f5ad]/20 bg-black/15 px-2.5 py-2.5 text-left font-mono hover:border-[#71f5ad] hover:bg-[#071b12] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#71f5ad]"
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
                      <span className="mt-1 block truncate text-[#a6ffd0]/50 text-[0.6rem] uppercase">
                        {room.listenerCount.toString().padStart(3, '0')} USERS /{' '}
                        {room.songCount.toString().padStart(3, '0')} TRACKS /
                        ONLINE
                      </span>
                    </span>
                    <span className="border border-[#71f5ad]/35 px-2 py-1 text-[#a6ffd0]/70 text-[0.62rem] group-hover:border-[#71f5ad] group-hover:text-white">
                      ENTER
                    </span>
                  </button>
                ))}
              </div>
            </TerminalSection>

            <TerminalSection label="SYSTEM SIGNAL" status="ONLINE">
              <div className="grid gap-2 text-[0.62rem] uppercase tracking-[0.08em] sm:grid-cols-3">
                <div className="border border-[#71f5ad]/20 bg-black/15 p-2.5">
                  <p className="text-[#71f5ad]/50">PROVIDER DRIVERS</p>
                  <p className="mt-1 truncate text-[#dffff0]">
                    {providers.join(' / ') || 'NONE'}
                  </p>
                </div>
                <div className="border border-[#71f5ad]/20 bg-black/15 p-2.5">
                  <p className="text-[#71f5ad]/50">DIRECTORY LINK</p>
                  <p className="mt-1 text-[#dffff0]">LOCKED / SECURE</p>
                </div>
                <div className="border border-[#71f5ad]/20 bg-black/15 p-2.5">
                  <p className="text-[#71f5ad]/50">PLAYBACK NETWORK</p>
                  <p className="mt-1 text-[#dffff0]">READY / STANDBY</p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-[#71f5ad]/20 border-t pt-3 text-[#a6ffd0]/70 text-[0.62rem]">
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
            </TerminalSection>
          </div>
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
