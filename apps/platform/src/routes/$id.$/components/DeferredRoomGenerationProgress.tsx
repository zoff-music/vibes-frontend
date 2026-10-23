import type { RoomGenerationProgressProps } from '@vibes/ui/web';
import { lazy, Suspense } from 'preact/compat';

const LazyRoomGenerationProgress = lazy(async () => {
  const module = await import(
    '@vibes/ui/web/components/RoomGenerationProgress'
  );

  return {
    default: module.RoomGenerationProgress,
  };
});

export function DeferredRoomGenerationProgress(
  props: RoomGenerationProgressProps,
) {
  return (
    <Suspense
      fallback={
        <div
          className="mx-auto flex h-full min-h-64 items-center justify-center p-8 text-theme-muted"
          role="status"
        >
          {props.isFailed
            ? 'Playlist generation stopped'
            : 'Preparing your playlist…'}
        </div>
      }
    >
      <LazyRoomGenerationProgress {...props} />
    </Suspense>
  );
}
