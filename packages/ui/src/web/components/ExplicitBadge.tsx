import { Tooltip } from './Tooltip';

export function ExplicitBadge() {
  return (
    <Tooltip className="inline-flex shrink-0" content={explanation}>
      <button
        aria-label={explanation}
        className="rounded border border-primary/40 bg-primary/10 px-1.5 py-0.5 font-semibold text-theme text-xs leading-tight focus-visible:outline-2 focus-visible:outline-secondary"
        type="button"
      >
        Explicit
      </button>
    </Tooltip>
  );
}

const explanation =
  "This list has been marked for profanity and won't be possible to mark public";
