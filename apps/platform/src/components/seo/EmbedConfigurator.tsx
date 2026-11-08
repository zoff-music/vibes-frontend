import { DeferredContent } from '@vibes/ui/web';
import { lazy } from 'preact/compat';

const LazyEmbedWidget = lazy(() =>
  import('./EmbedWidget').then((module) => ({ default: module.EmbedWidget })),
);

export function EmbedConfigurator() {
  return (
    <div className="mt-8">
      <DeferredContent
        fallback={
          <div
            aria-hidden="true"
            className="border-theme bg-theme-surface h-213 rounded-2xl border md:h-104"
          />
        }
      >
        <LazyEmbedWidget />
      </DeferredContent>
    </div>
  );
}
