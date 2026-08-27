import {
  generatedPlaylistPromptMaxLength,
  type Providers,
  type PublicRoom,
} from '@vibes/models';
import { usePageVisibility } from '@vibes/shared';
import {
  TerminalButton,
  TerminalFeedback,
  TerminalField,
  TerminalInput,
  TerminalInputGroup,
  TerminalListButton,
  TerminalSection,
  TerminalShell,
  TerminalStatus,
  TerminalStatusGrid,
  TerminalToolbar,
  useTerminalShortcuts,
} from '@vibes/ui/konami';
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
import type { HomeActionData } from '../action';

interface TerminalHomeProps {
  isAIMode: boolean;
  onJoinRoom: (roomId?: string) => void;
  onOpenProfileSettings: () => void;
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
  onOpenProfileSettings,
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

  useTerminalShortcuts([
    { key: 'F1', onTrigger: onStartSession },
    { key: 'F2', onTrigger: onToggleAIMode },
  ]);

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
        <TerminalToolbar
          actions={
            <>
              <TerminalButton aria-keyshortcuts="F1" onClick={onStartSession}>
                [F1] NEW ROOM
              </TerminalButton>
              <TerminalButton aria-keyshortcuts="F2" onClick={onToggleAIMode}>
                {isAIMode ? '[F2] ROOM UPLINK' : '[F2] AI PLAYLIST'}
              </TerminalButton>
              <TerminalButton onClick={onOpenProfileSettings}>
                [PROFILE]
              </TerminalButton>
            </>
          }
          description="PUBLIC ROOM DISCOVERY / SHARED PLAYBACK PROTOCOL"
          title="ZOFF / SIGNAL DIRECTORY"
        />

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

            <TerminalField
              className="mt-4"
              htmlFor="terminal-room-command"
              label={isAIMode ? 'PLAYLIST PROMPT' : 'CHANNEL IDENTIFIER'}
            >
              <TerminalInputGroup prefix="&gt;">
                <TerminalInput
                  autoComplete="off"
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
              </TerminalInputGroup>
            </TerminalField>
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
              <TerminalFeedback
                aria-live="polite"
                className="mt-3 bg-black/20"
                tone="success"
              >
                {playlistGenerationMessages[generationMessageIndex]}
                <span className="terminal-cursor">_</span>
              </TerminalFeedback>
            )}
            {fetcher.data?.error && (
              <TerminalFeedback className="mt-3" tone="error">
                ERROR: {fetcher.data.error}
              </TerminalFeedback>
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
                  <TerminalFeedback>
                    NO PUBLIC SIGNALS DETECTED.
                  </TerminalFeedback>
                )}
                {publicRooms.map((room, index) => (
                  <TerminalListButton
                    action="ENTER"
                    index={(index + 1).toString().padStart(2, '0')}
                    key={room.id}
                    metadata={`${room.listenerCount.toString().padStart(3, '0')} USERS / ${room.songCount.toString().padStart(3, '0')} TRACKS / ONLINE`}
                    onClick={() => onJoinRoom(room.id)}
                    title={room.name}
                  />
                ))}
              </div>
            </TerminalSection>

            <TerminalSection label="SYSTEM SIGNAL" status="ONLINE">
              <TerminalStatusGrid>
                <TerminalStatus
                  label="PROVIDER DRIVERS"
                  value={providers.join(' / ') || 'NONE'}
                />
                <TerminalStatus
                  label="DIRECTORY LINK"
                  value="LOCKED / SECURE"
                />
                <TerminalStatus
                  label="PLAYBACK NETWORK"
                  value="READY / STANDBY"
                />
              </TerminalStatusGrid>
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
