import { Button, RoomGenerationProgress } from '@vibes/ui/web';
import { useGenerationProgress } from '../hooks/useGenerationProgress';

export function GenerationScreen() {
  const generation = useGenerationProgress();

  return (
    <main
      className="relative z-10 flex min-h-[70svh] flex-col justify-center py-8"
      aria-label="Generating your playlist"
    >
      <RoomGenerationProgress
        awaitingName
        isFailed={generation.failed}
        {...(generation.failed ? { error: generation.error } : {})}
      />
      {generation.failed && (
        <div className="mx-auto px-4">
          <Button variant="primary" onClick={generation.retry}>
            Back to playlist prompt
          </Button>
        </div>
      )}
    </main>
  );
}
