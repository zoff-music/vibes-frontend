import { SiteHeader } from '../seo/SiteHeader';

export function LegalDocumentFallback() {
  return (
    <div className="relative z-10">
      <SiteHeader />
      <main
        aria-busy="true"
        aria-label="Loading policy"
        className="mx-auto w-full max-w-6xl px-5 pb-8 sm:px-6"
      >
        <div aria-hidden="true" className="motion-safe:animate-pulse">
          <div className="pt-6 pb-10 sm:pt-10">
            <div className="h-5 w-32 rounded-lg bg-theme-surface" />
            <div className="mt-5 h-12 w-64 max-w-full rounded-xl bg-theme-surface" />
            <div className="mt-5 h-16 max-w-2xl rounded-xl bg-theme-surface" />
          </div>
          <div className="grid gap-6 border-theme border-t pt-6 lg:grid-cols-4 lg:gap-10">
            <div className="h-12 rounded-xl bg-theme-surface lg:h-48" />
            <div className="panel-surface h-96 rounded-3xl border border-theme lg:col-span-3" />
          </div>
        </div>
      </main>
    </div>
  );
}
