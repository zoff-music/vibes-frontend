import { SitePage } from '../layout/SitePage';

export function LegalDocumentFallback() {
  return (
    <SitePage>
      <section aria-busy="true" aria-label="Loading policy">
        <div aria-hidden="true" className="motion-safe:animate-pulse">
          <div className="crt-frame rounded-frame p-6 sm:p-8 lg:p-10">
            <div className="bg-theme-surface h-5 w-32 rounded-lg" />
            <div className="bg-theme-surface mt-5 h-12 w-64 max-w-full rounded-xl" />
            <div className="bg-theme-surface mt-5 h-16 max-w-2xl rounded-xl" />
          </div>
          <div className="grid gap-6 pt-10 sm:pt-16 lg:grid-cols-4 lg:gap-10">
            <div className="bg-theme-surface h-12 rounded-xl lg:h-48" />
            <div className="panel-surface border-theme h-96 rounded-3xl border lg:col-span-3" />
          </div>
        </div>
      </section>
    </SitePage>
  );
}
