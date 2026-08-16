import { classNames } from '@vibes/shared';
import { useEffect } from 'react';
import '@vibes/ui/konami/styles.css';

const BOOT_DURATION_MS = 7_600;

const BOOT_LINES = [
  {
    delayClass: '[animation-delay:700ms]',
    label: 'MEMORY TEST',
    value: '640K VIBES OK',
  },
  {
    delayClass: '[animation-delay:1050ms]',
    label: 'MOUNTING /DEV/MUSIC',
    value: 'READY',
  },
  {
    delayClass: '[animation-delay:1400ms]',
    label: 'SYNCING HEARTBEATS',
    value: 'LOCKED',
  },
  {
    delayClass: '[animation-delay:1750ms]',
    label: 'YOUTUBE ADAPTER',
    value: 'ONLINE',
  },
  {
    delayClass: '[animation-delay:2100ms]',
    label: 'SOUNDCLOUD ADAPTER',
    value: 'ONLINE',
  },
  {
    delayClass: '[animation-delay:2450ms]',
    label: 'ROOM SIGNAL',
    value: 'ACQUIRED',
  },
] as const;

interface RetroBootExperienceProps {
  onComplete: () => void;
}

export function RetroBootExperience({ onComplete }: RetroBootExperienceProps) {
  useEffect(() => {
    const timer = window.setTimeout(onComplete, BOOT_DURATION_MS);
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onComplete();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onComplete]);

  return (
    <output
      aria-label="Zoff retro boot sequence"
      aria-live="polite"
      className="fixed inset-0 z-[1000] grid place-items-center overflow-hidden bg-[#010705] font-mono text-[#8cffc5] [animation:retro-boot-enter_100ms_linear_both] before:pointer-events-none before:absolute before:inset-0 before:z-[3] before:bg-[repeating-linear-gradient(to_bottom,transparent_0_3px,rgba(130,255,191,0.05)_3px_4px)] before:content-[''] after:pointer-events-none after:absolute after:inset-x-0 after:top-0 after:z-[4] after:h-[12vh] after:bg-[linear-gradient(transparent,rgba(140,255,197,0.07),transparent)] motion-reduce:after:animate-none after:[animation:retro-boot-scan_1.4s_linear_infinite] motion-reduce:[animation-duration:1ms]"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(48,255,153,0.07),transparent_68%)] shadow-[inset_0_0_15vw_#000]" />
      <div className="relative z-[2] w-[min(58rem,calc(100vw-2rem))] border border-[#55ffad] bg-[rgba(1,12,8,0.96)] shadow-[inset_0_0_4rem_rgba(49,255,154,0.06),0_0_3rem_rgba(49,255,154,0.16)] [animation:retro-boot-terminal-enter_550ms_ease-out_both] [text-shadow:0_0_0.55rem_rgba(89,255,169,0.8)] motion-reduce:[animation-duration:1ms]">
        <header className="flex justify-between bg-[#71f5ad] px-4 py-[0.7rem] font-bold text-[#03150d] text-shadow-none uppercase max-sm:text-[0.68rem]">
          <span>ZOFF BIOS v19.89</span>
          <span>[ SIGNAL TERMINAL ]</span>
        </header>

        <div className="min-h-[31rem] p-[clamp(1.25rem,4vw,2.5rem)] max-sm:min-h-[27rem]">
          <p className="mt-0 mb-[1.8rem] text-[#b9ffda] text-xs">
            ZOFF LISTENING SYSTEMS · 音楽は共有するもの
          </p>

          {BOOT_LINES.map((line) => (
            <p
              className="relative my-2 grid grid-cols-[auto_1fr_auto] items-center gap-[0.65rem] overflow-hidden text-[clamp(0.72rem,1.6vw,1rem)] max-sm:grid-cols-[auto_1fr]"
              key={line.label}
            >
              <span>{line.label}</span>
              <i className="border-[rgba(140,255,197,0.45)] border-b border-dotted max-sm:hidden" />
              <strong className="text-[#e0ffef] max-sm:text-right">
                {line.value}
              </strong>
              <b
                className={classNames(
                  'absolute inset-0 bg-[#010c08] [animation:retro-boot-line-reveal_350ms_steps(12)_both] motion-reduce:[animation-delay:0ms] motion-reduce:[animation-duration:1ms]',
                  line.delayClass,
                )}
              />
            </p>
          ))}

          <div className="mt-[1.8rem] grid grid-cols-[auto_1fr_auto] items-center gap-[0.8rem] text-[#b9ffda] text-[clamp(0.68rem,1.4vw,0.9rem)] max-sm:grid-cols-[1fr_auto]">
            <span className="max-sm:col-span-full">LOADING ROOM PROTOCOL</span>
            <div className="h-3 overflow-hidden border border-[#71f5ad] p-0.5">
              <i className="block h-full w-full origin-left bg-[repeating-linear-gradient(90deg,#71f5ad_0_12px,transparent_12px_15px)] [animation:retro-boot-progress_1.25s_steps(12)_2.7s_both] motion-reduce:[animation-delay:0ms] motion-reduce:[animation-duration:1ms]" />
            </div>
            <strong>100%</strong>
          </div>

          <div
            className="mt-10 flex flex-col text-center text-[#b9ffda] text-[clamp(1rem,3vw,1.8rem)] leading-[1.35] [animation:retro-boot-mark_4.5s_ease-out_both] motion-reduce:[animation-delay:0ms] motion-reduce:[animation-duration:1ms]"
            aria-hidden="true"
          >
            <span>╔════════════════════╗</span>
            <strong className="font-normal text-white">
              ║　　ゾ フ O S　　║
            </strong>
            <span>╚════════════════════╝</span>
          </div>

          <p className="mt-8 mb-0 text-[#71f5ad] text-[clamp(0.72rem,1.5vw,0.95rem)] [animation:retro-boot-ready_5.7s_steps(1)_both] motion-reduce:[animation-delay:0ms] motion-reduce:[animation-duration:1ms]">
            SIGNAL ACQUIRED. RESUMING TRANSMISSION
            <span className="[animation:retro-boot-cursor_700ms_steps(1)_infinite]">
              _
            </span>
          </p>
        </div>

        <footer className="flex justify-between border-[rgba(113,245,173,0.35)] border-t px-4 py-[0.55rem] text-[0.62rem] text-[rgba(185,255,218,0.65)] uppercase tracking-[0.08em]">
          <span>CH 1989</span>
          <span>ESC TO BYPASS</span>
        </footer>
      </div>
    </output>
  );
}
