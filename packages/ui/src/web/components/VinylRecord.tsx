import { classNames } from '@vibes/shared';

interface VinylRecordProps {
  artworkUrl?: string;
  playing?: boolean;
  className?: string;
}

export function VinylRecord({
  artworkUrl,
  playing = false,
  className,
}: VinylRecordProps) {
  return (
    <div
      aria-hidden="true"
      className={classNames(
        'relative flex aspect-square shrink-0 items-center justify-center rounded-full border border-white/15 bg-[repeating-radial-gradient(circle,#21192d_0px,#21192d_2px,#100b18_3px,#100b18_7px)] shadow-2xl motion-safe:animate-[spin_24s_linear_infinite]',
        !playing && 'motion-safe:[animation-play-state:paused]',
        className,
      )}
    >
      {artworkUrl && (
        <img
          src={artworkUrl}
          width={100}
          height={100}
          alt=""
          className="size-1/2 rounded-full border-4 border-[#100b18]"
        />
      )}
      {!artworkUrl && (
        <span className="flex size-1/2 items-center justify-center rounded-full border-4 border-[#100b18] bg-primary font-pixel text-pink-950 text-xs">
          ZOFF
        </span>
      )}
      <span className="absolute size-2 rounded-full border border-white/30 bg-[#100b18]" />
    </div>
  );
}
