interface ClickToPlayOverlayProps {
  onClick: () => void;
}

export function ClickToPlayOverlay({ onClick }: ClickToPlayOverlayProps) {
  return (
    <button
      type="button"
      className="hover:bg-theme-surface focus-visible:ring-secondary absolute inset-0 z-40 flex h-full w-full cursor-pointer items-center justify-center bg-black text-white transition-colors focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset"
      onClick={onClick}
    >
      <span className="text-caption rounded-full border border-white/20 bg-white/5 px-6 py-3 font-mono tracking-widest uppercase">
        ▶ Click to play
      </span>
    </button>
  );
}
