export function SecurityHydrateFallback() {
  return (
    <main className="relative z-10 min-h-screen px-6 py-16 sm:py-24">
      <div className="crt-frame mx-auto max-w-4xl animate-pulse rounded-frame p-6 sm:p-10">
        <div className="h-8 w-64 rounded-xl bg-theme-surface" />
        <div className="mt-8 h-4 w-full rounded-xl bg-theme-surface" />
        <div className="mt-3 h-4 w-4/5 rounded-xl bg-theme-surface" />
        <div className="mt-10 h-48 rounded-3xl bg-theme-surface" />
      </div>
    </main>
  );
}
