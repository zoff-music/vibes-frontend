interface ClickToPlayOverlayProps {
  onClick: () => void;
}

export function ClickToPlayOverlay({ onClick }: ClickToPlayOverlayProps) {
  return (
    <button
      type="button"
      className="absolute inset-0 z-40 flex h-full w-full cursor-pointer items-center justify-center bg-black text-white transition-colors hover:bg-theme-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-inset"
      onClick={onClick}
    >
      <span className="rounded-full border border-white/20 bg-white/5 px-6 py-3 font-mono text-caption uppercase tracking-widest">
        ▶ Click to play
      </span>
    </button>
  );
}
