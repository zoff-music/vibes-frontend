import { SitePage } from '../layout/SitePage';

export function LegalDocumentFallback() {
  return (
    <SitePage>
      <section aria-busy="true" aria-label="Loading policy">
        <div aria-hidden="true" className="motion-safe:animate-pulse">
          <div className="crt-frame rounded-frame p-6 sm:p-8 lg:p-10">
            <div className="h-5 w-32 rounded-lg bg-theme-surface" />
            <div className="mt-5 h-12 w-64 max-w-full rounded-xl bg-theme-surface" />
            <div className="mt-5 h-16 max-w-2xl rounded-xl bg-theme-surface" />
          </div>
          <div className="grid gap-6 pt-10 sm:pt-16 lg:grid-cols-4 lg:gap-10">
            <div className="h-12 rounded-xl bg-theme-surface lg:h-48" />
            <div className="panel-surface h-96 rounded-3xl border border-theme lg:col-span-3" />
          </div>
        </div>
      </section>
    </SitePage>
  );
}
