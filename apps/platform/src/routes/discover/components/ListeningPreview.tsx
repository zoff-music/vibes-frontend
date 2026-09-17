import { Equalizer } from './showcase/Equalizer';
import { Record } from './showcase/Record';
import { Showcase } from './showcase/Showcase';

export function ListeningPreview() {
  return (
    <Showcase
      label="DIFFERENT PLACES. SAME TRACK."
      description="Animated listening illustration: a record spins between two devices, sending a shared signal while both playback timelines move together. No audio plays in this illustration."
    >
      <div aria-hidden="true" className="px-5 pb-7 sm:px-7">
        <div className="relative flex h-64 items-center justify-center">
          <div className="absolute inset-0 flex items-center justify-center">
            {[1, 2, 3].map((ring) => (
              <span
                key={ring}
                className="scene-signal absolute h-56 w-56 rounded-full border border-secondary/30"
              />
            ))}
          </div>
          <Record className="h-40 w-40" />
          <span className="scene-float absolute top-7 left-0 rounded-full border border-theme bg-theme px-3 py-2 font-pixel text-primary text-xs">
            AT HOME
          </span>
          <span className="scene-float scene-float-offset absolute right-0 bottom-7 rounded-full border border-theme bg-theme px-3 py-2 font-pixel text-secondary text-xs">
            ACROSS TOWN
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {['Your headphones', 'Their headphones'].map((label) => (
            <div
              key={label}
              className="relative min-w-0 overflow-hidden rounded-2xl border border-theme bg-theme/90 p-4 shadow-lg"
            >
              <Equalizer className="mx-auto h-16 w-full" />
              <p className="mt-4 truncate text-center font-pixel text-sm text-theme">
                {label}
              </p>
              <div className="mt-4 h-1 overflow-hidden rounded-full bg-theme-surface">
                <span className="scene-progress block h-full w-full origin-left rounded-full bg-secondary" />
              </div>
            </div>
          ))}
        </div>
        <p className="mt-6 text-center font-pixel text-lg text-theme">
          Miles apart. Right here.
        </p>
      </div>
    </Showcase>
  );
}
