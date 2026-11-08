interface TizenRecoveryViewProps {
  onReload?: () => void;
}

export function TizenRecoveryView({ onReload }: TizenRecoveryViewProps) {
  const reload = onReload ?? (() => window.location.reload());

  return (
    <main className="bg-tv-background text-tv-text flex h-full items-center justify-center p-16">
      <section className="border-primary/30 bg-tv-card max-w-3xl rounded-[2rem] border p-12 text-center">
        <h1 className="text-4xl">TV screen unavailable</h1>
        <p className="text-tv-muted mt-5 text-2xl">
          The screen could not recover. Reload it to try again.
        </p>
        <button
          className="bg-accent mt-8 rounded-xl px-8 py-4 text-xl text-black focus-visible:ring-4 focus-visible:ring-white focus-visible:outline-none"
          onClick={reload}
          type="button"
        >
          Reload
        </button>
      </section>
    </main>
  );
}
