export function EmbedRoomErrorBoundary() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-theme p-4 text-theme">
      <div className="panel-strong rounded-2xl border border-theme p-8 text-center">
        <p className="font-pixel text-sm">Room unavailable</p>
        <p className="mt-2 text-theme-muted text-xs">
          Check the room name and try again.
        </p>
      </div>
    </main>
  );
}
