import { classNames } from '@vibes/shared';

interface RecordProps {
  className?: string;
}

export function Record({ className }: RecordProps) {
  return (
    <div
      className={classNames(
        'scene-record-shell relative aspect-square rounded-full',
        className,
      )}
    >
      <div className="scene-orbit absolute -inset-3 rounded-full border border-primary/40" />
      <div className="scene-orbit scene-orbit-offset absolute -inset-6 rounded-full border border-secondary/25" />
      <div className="scene-record relative flex h-full w-full items-center justify-center overflow-hidden rounded-full border border-white/20 bg-[#100a1b] shadow-2xl">
        <div className="scene-grooves absolute inset-0 rounded-full" />
        <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_30deg,transparent,rgba(255,255,255,0.15),transparent_25%,transparent_55%,rgba(0,217,255,0.13),transparent_80%)]" />
        <img
          src="/logo.png"
          width={1024}
          height={1024}
          alt=""
          loading="lazy"
          decoding="async"
          className="relative h-3/5 w-3/5 rounded-full"
        />
        <span className="absolute h-2 w-2 rounded-full border border-white/50 bg-[#100a1b]" />
      </div>
    </div>
  );
}
