import { lazy, Suspense } from 'preact/compat';

const LazyNotFoundContent = lazy(() =>
  import('./NotFoundContent').then((module) => ({
    default: module.NotFoundContent,
  })),
);

export function NotFoundPage() {
  return (
    <Suspense
      fallback={
        <main className="relative z-10 mx-auto w-full max-w-5xl px-5 py-10 sm:px-6 sm:py-16">
          <h1 className="font-pixel text-3xl text-theme">Page not found</h1>
          <a
            href="/"
            className="mt-7 inline-block text-secondary underline focus-visible:outline focus-visible:outline-2"
          >
            Back home
          </a>
        </main>
      }
    >
      <LazyNotFoundContent />
    </Suspense>
  );
}
