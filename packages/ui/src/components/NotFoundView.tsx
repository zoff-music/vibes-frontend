export function NotFoundView() {
  return (
    <main className="relative z-10 flex min-h-dvh items-center justify-center overflow-hidden px-6 py-16">
      <section className="crt-frame relative w-full max-w-2xl overflow-hidden rounded-frame p-8 text-center sm:p-12">
        <div
          aria-hidden="true"
          className="absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-secondary to-transparent"
        />
        <p className="font-pixel text-secondary text-xs tracking-label">
          404 · SIGNAL LOST
        </p>
        <p
          aria-hidden="true"
          className="glow-text mt-8 font-wide text-7xl text-theme leading-none sm:text-8xl"
        >
          404
        </p>
        <h1 className="mt-8 font-pixel text-2xl text-theme sm:text-3xl">
          This track went missing
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-theme-muted leading-7">
          The page you were looking for does not exist, or it moved somewhere
          else in the queue.
        </p>
        <a
          className="mt-8 inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 font-pixel text-sm text-text-inverse transition-all hover:-translate-y-0.5 hover:bg-primary-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-theme"
          href="/"
        >
          Back to Zoff
        </a>
      </section>
    </main>
  );
}
