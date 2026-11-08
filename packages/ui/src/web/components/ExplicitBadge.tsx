import { Tooltip } from './Tooltip';

export function ExplicitBadge() {
  return (
    <Tooltip className="inline-flex shrink-0" content={explanation}>
      <button
        aria-label={explanation}
        className="border-primary/40 bg-primary/10 text-theme focus-visible:outline-secondary rounded border px-1.5 py-0.5 text-xs leading-tight font-semibold focus-visible:outline-2"
        type="button"
      >
        Explicit
      </button>
    </Tooltip>
  );
}

const explanation =
  "This list has been marked for profanity and won't be possible to mark public";
