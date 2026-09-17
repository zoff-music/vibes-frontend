import {
  ArrowRightIcon,
  QueueEmptyIcon,
  VolumeIcon,
  VoteIcon,
} from '@vibes/ui/web';

export function PartyPreview() {
  return (
    <figure className="overflow-hidden rounded-3xl border border-theme bg-theme-surface p-6 sm:p-8">
      <p className="font-pixel text-2xs text-primary tracking-label">
        THE PARTY SETUP
      </p>
      <div className="mt-6 flex items-center gap-5 rounded-2xl border border-theme bg-theme p-5">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <VolumeIcon aria-hidden="true" className="h-7 w-7" />
        </span>
        <div>
          <p className="font-pixel text-theme text-xl">One main player</p>
          <p className="mt-1 text-sm text-theme-muted">
            Connected to your speakers
          </p>
        </div>
      </div>
      <div aria-hidden="true" className="mx-auto h-8 w-px bg-secondary/50" />
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-secondary/40 bg-secondary/10 p-5">
        <div>
          <p className="font-pixel text-lg text-theme">The shared queue</p>
          <p className="mt-1 text-sm text-theme-muted">
            Your host keeps the controls
          </p>
        </div>
        <QueueEmptyIcon
          aria-hidden="true"
          className="h-7 w-7 shrink-0 text-secondary"
        />
      </div>
      <div aria-hidden="true" className="mx-auto h-8 w-px bg-secondary/50" />
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-theme bg-theme p-4">
          <ArrowRightIcon
            aria-hidden="true"
            className="mb-3 h-5 w-5 text-primary"
          />
          <p className="font-pixel text-sm text-theme">Guest requests</p>
          <p className="mt-2 text-theme-muted text-xs">
            Songs from their phones
          </p>
        </div>
        <div className="rounded-2xl border border-theme bg-theme p-4">
          <VoteIcon
            aria-hidden="true"
            className="mb-3 h-5 w-5 text-secondary"
          />
          <p className="font-pixel text-sm text-theme">Room votes</p>
          <p className="mt-2 text-theme-muted text-xs">
            A say in what plays next
          </p>
        </div>
      </div>
      <figcaption className="mt-4 text-theme-subtle text-xs leading-relaxed">
        Keep the player off on guest devices when you only want one audio
        source.
      </figcaption>
    </figure>
  );
}
