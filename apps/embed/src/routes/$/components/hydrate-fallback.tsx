export function EmbedRoomHydrateFallback() {
  return (
    <main
      className="flex h-full min-h-0 items-center justify-center overflow-auto overscroll-none bg-theme p-4 text-theme"
      data-embed-scroll
    >
      <div className="panel-strong rounded-2xl border border-theme p-8 text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-theme border-t-primary" />
        <p className="mt-3 font-pixel text-xs">Loading room</p>
      </div>
    </main>
  );
}
