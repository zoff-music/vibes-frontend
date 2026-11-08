export function TizenHydrateFallback() {
  return (
    <main className="bg-tv-background text-tv-text flex h-full items-center justify-center p-16">
      <section className="border-accent/30 bg-tv-card rounded-[2rem] border px-12 py-10 text-center">
        <h1 className="text-4xl">Tuning the signal…</h1>
        <p className="text-tv-muted mt-5 text-2xl">
          Loading rooms and music providers.
        </p>
      </section>
    </main>
  );
}
