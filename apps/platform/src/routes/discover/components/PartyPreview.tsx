import { PlusIcon, VoteIcon } from '@vibes/ui/web';
import { Equalizer } from './showcase/Equalizer';
import { Record } from './showcase/Record';
import { Showcase } from './showcase/Showcase';

export function PartyPreview() {
  return (
    <Showcase
      label="PASS THE LINK. NOT THE PHONE."
      description="Animated party illustration: guests send song requests to one player, votes rise, and the most popular track moves up the shared queue."
    >
      <div
        aria-hidden="true"
        className="scene-content px-5 pb-6 sm:px-7 sm:pb-7"
      >
        <div className="relative h-64">
          <svg
            viewBox="0 0 400 256"
            preserveAspectRatio="none"
            className="pointer-events-none absolute inset-0 h-full w-full fill-none stroke-secondary/40"
            aria-hidden="true"
          >
            <path
              d="M 65 178 H 108 Q 130 178 130 154 V 124 H 164 M 335 68 H 290 Q 272 68 272 88 V 124 H 236 M 200 188 V 256"
              strokeWidth="1.5"
            />
            <path
              className="scene-path-flow"
              d="M 65 178 H 108 Q 130 178 130 154 V 124 H 164 M 335 68 H 290 Q 272 68 272 88 V 124 H 236 M 200 188 V 256"
              strokeWidth="3"
            />
          </svg>
          <div className="absolute top-7 left-1/2 -translate-x-1/2">
            <Record className="h-40 w-40 sm:h-44 sm:w-44" />
          </div>
          <div className="scene-request-left absolute top-36 left-0 w-32 rounded-xl border border-primary/40 bg-theme px-3 py-3 shadow-xl">
            <p className="flex items-center justify-between gap-2 text-primary text-xs">
              Mira’s pick
              <PlusIcon className="h-3 w-3" />
            </p>
            <p className="mt-1 truncate font-pixel text-sm text-theme">
              Night drive
            </p>
          </div>
          <div className="scene-request-right absolute top-10 right-0 w-28 rounded-xl border border-secondary/40 bg-theme px-3 py-3 shadow-xl">
            <p className="flex items-center justify-between gap-2 text-secondary text-xs">
              Room vote
              <VoteIcon className="h-3 w-3" />
            </p>
            <p className="mt-1 font-pixel text-sm text-theme">Turn it up</p>
          </div>
          <Equalizer className="absolute bottom-5 left-1/2 h-9 w-28 -translate-x-1/2" />
        </div>
        <div className="relative rounded-2xl border border-secondary/30 bg-theme/90 p-3 shadow-xl sm:p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="font-pixel text-sm text-theme">The room decides.</p>
            <span className="text-theme-subtle text-xs">Example queue</span>
          </div>
          <div className="relative h-36">
            <div className="scene-party-first absolute inset-x-0 top-0 flex h-17 items-center gap-3 rounded-xl border border-theme bg-theme-surface p-2">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/15">
                <span className="h-6 w-6 rounded-full border-4 border-primary" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-pixel text-sm text-theme">
                  Golden hour
                </span>
                <span className="mt-1 block text-theme-subtle text-xs">
                  A guest’s pick
                </span>
              </span>
              <span className="flex items-center gap-1.5 pr-1 text-secondary text-xs">
                <VoteIcon className="h-4 w-4" />6
              </span>
            </div>
            <div className="scene-party-second absolute inset-x-0 top-0 flex h-17 items-center gap-3 rounded-xl border border-secondary/40 bg-theme-surface p-2 shadow-secondary-soft">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-secondary/15">
                <span className="h-6 w-6 rotate-45 border-4 border-secondary" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-pixel text-sm text-theme">
                  Night drive
                </span>
                <span className="mt-1 block text-theme-subtle text-xs">
                  Mira’s pick
                </span>
              </span>
              <span className="relative flex items-center gap-1.5 pr-1 text-secondary text-xs">
                <VoteIcon className="h-4 w-4" />
                <span className="grid w-3">
                  <span className="scene-votes-before col-start-1 row-start-1">
                    5
                  </span>
                  <span className="scene-votes-after col-start-1 row-start-1">
                    8
                  </span>
                </span>
                <span className="scene-vote-burst absolute right-0 bottom-7 rounded-lg bg-secondary px-2 py-1 font-pixel text-on-secondary">
                  +3
                </span>
              </span>
            </div>
          </div>
        </div>
        <p className="mt-5 text-center font-pixel text-base text-theme">
          More requests. Better nights.
        </p>
      </div>
    </Showcase>
  );
}
