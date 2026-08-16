import { TerminalFeedback } from './TerminalFeedback';
import { TerminalLoading } from './TerminalLoading';
import { TerminalSection } from './TerminalSection';
import { TerminalStatus, TerminalStatusGrid } from './TerminalStatus';

interface TerminalGenerationProgressProps {
  error?: string;
  isFailed: boolean;
  isTakingLonger: boolean;
  message: string;
}

export function TerminalGenerationProgress({
  error,
  isFailed,
  isTakingLonger,
  message,
}: TerminalGenerationProgressProps) {
  const status = isFailed ? 'HALTED' : 'COMPILING';

  return (
    <div className="flex min-h-[24rem] flex-1 items-center justify-center py-4">
      <TerminalSection
        className="w-full max-w-3xl"
        contentClassName="p-5 sm:p-7"
        label="PLAYLIST SYNTHESIS DAEMON"
        status={status}
      >
        <div className="border border-[#71f5ad]/20 bg-black/25 p-4 sm:p-6">
          <div className="flex items-center justify-between gap-4 border-[#71f5ad]/20 border-b pb-3 font-mono text-[0.62rem] uppercase tracking-[0.14em]">
            <span className="text-[#71f5ad]/55">PROCESS / GEN-1989</span>
            <span className={isFailed ? 'text-[#ff8e8e]' : 'text-[#71f5ad]'}>
              {isFailed ? 'EXIT 01' : 'RUNNING'}
            </span>
          </div>

          {!isFailed && (
            <TerminalLoading
              className="!min-h-44 !border-0 !bg-transparent !px-0"
              label={message}
            />
          )}

          {isFailed && (
            <div className="py-10 text-center">
              <p className="font-mono text-[#ff8e8e]/60 text-[0.62rem] uppercase tracking-[0.2em]">
                PROCESS TERMINATED
              </p>
              <p className="mt-4 font-mono text-[#ffb1b1] text-base uppercase">
                PLAYLIST GENERATION STOPPED
              </p>
            </div>
          )}

          <TerminalStatusGrid>
            <TerminalStatus
              label="ROOM CHANNEL"
              value={isFailed ? 'AVAILABLE' : 'ONLINE'}
            />
            <TerminalStatus
              label="BACKGROUND JOB"
              value={isFailed ? 'STOPPED' : 'PERSISTENT'}
            />
            <TerminalStatus
              label="REFRESH SAFETY"
              value={isFailed ? 'ROOM RETAINED' : 'ENABLED'}
            />
          </TerminalStatusGrid>

          <TerminalFeedback
            aria-live="polite"
            className="mt-4"
            tone={isFailed ? 'error' : 'success'}
          >
            {isFailed &&
              (error ??
                'Could not finish this playlist. You can still use the room normally.')}
            {!isFailed &&
              'ROOM READY. GENERATION CONTINUES AFTER REFRESH OR DISCONNECT.'}
          </TerminalFeedback>

          {!isFailed && isTakingLonger && (
            <TerminalFeedback className="mt-3">
              NOTICE: PROCESS IS TAKING LONGER THAN EXPECTED.
            </TerminalFeedback>
          )}
        </div>
      </TerminalSection>
    </div>
  );
}
