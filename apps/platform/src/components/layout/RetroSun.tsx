import { classNames } from '@vibes/shared';

interface RetroSunProps {
  paused: boolean;
}

export function RetroSun({ paused }: RetroSunProps) {
  return (
    <div aria-hidden="true" className="relative aspect-square w-full">
      <div
        className={classNames(
          'absolute -inset-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,94,156,0.28)_0%,rgba(230,58,160,0.16)_30%,rgba(159,66,196,0.07)_50%,transparent_70%)] motion-safe:animate-sunset-glow',
          paused && '[animation-play-state:paused]',
        )}
      />
      <div className="absolute inset-0 rounded-full bg-[linear-gradient(to_bottom,#ffe8a3_0%,#ffb574_24%,#ff6b9b_48%,#f336a4_70%,#ac42d5_100%)] opacity-85 [mask-image:linear-gradient(to_bottom,#000_0%_47%,transparent_47%_48%,#000_48%_54%,transparent_54%_56%,#000_56%_62%,transparent_62%_65%,#000_65%_71%,transparent_71%_75%,#000_75%_80%,transparent_80%_85%,#000_85%_90%,transparent_90%_95%,#000_95%_100%)]" />
    </div>
  );
}
