import { Button } from '@vibes/ui/web';

export function EmbedRoomErrorBoundary() {
  return (
    <main
      className="bg-theme text-theme flex h-full min-h-0 items-center justify-center overflow-auto overscroll-none p-4"
      data-embed-scroll
    >
      <div className="panel-strong border-theme rounded-2xl border p-8 text-center">
        <p className="font-pixel text-sm">Room unavailable</p>
        <p className="text-theme-muted mt-2 text-xs">
          Check the room name and try again.
        </p>
        <Button
          className="mt-5"
          onClick={() => window.location.reload()}
          type="button"
          variant="tertiary"
        >
          Reload player
        </Button>
      </div>
    </main>
  );
}
