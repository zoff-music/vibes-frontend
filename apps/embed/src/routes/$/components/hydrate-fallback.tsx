export function EmbedRoomHydrateFallback() {
  return (
    <main
      className="bg-theme text-theme flex h-full min-h-0 items-center justify-center overflow-auto overscroll-none p-4"
      data-embed-scroll
    >
      <div className="panel-strong border-theme rounded-2xl border p-8 text-center">
        <div className="border-theme border-t-primary mx-auto h-8 w-8 animate-spin rounded-full border-2" />
        <p className="font-pixel mt-3 text-xs">Loading room</p>
      </div>
    </main>
  );
}
