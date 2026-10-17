export function TizenHydrateFallback() {
  return (
    <main className="flex h-full items-center justify-center bg-tv-background p-16 text-tv-text">
      <section className="rounded-[2rem] border border-accent/30 bg-tv-card px-12 py-10 text-center">
        <h1 className="text-4xl">Tuning the signal…</h1>
        <p className="mt-5 text-2xl text-tv-muted">
          Loading rooms and music providers.
        </p>
      </section>
    </main>
  );
}
