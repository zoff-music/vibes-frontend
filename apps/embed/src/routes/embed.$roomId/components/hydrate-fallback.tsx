export function EmbedRoomHydrateFallback() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-theme p-4 text-theme">
      <div className="panel-strong rounded-2xl border border-theme p-8 text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-theme border-t-primary" />
        <p className="mt-3 font-pixel text-xs">Loading room</p>
      </div>
    </main>
  );
}
