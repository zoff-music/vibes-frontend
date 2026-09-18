import { DeferredContent } from '@vibes/ui/web';
import { lazy } from 'react';

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
            className="h-213 rounded-2xl border border-theme bg-theme-surface md:h-104"
          />
        }
      >
        <LazyEmbedWidget />
      </DeferredContent>
    </div>
  );
}
