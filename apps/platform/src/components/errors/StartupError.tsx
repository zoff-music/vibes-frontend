export function StartupError() {
  return (
    <main className="fixed inset-0 z-50 flex items-center justify-center bg-theme p-6 text-theme">
      <section
        role="alert"
        className="panel-strong w-full max-w-md rounded-3xl border border-theme p-8 text-center"
      >
        <h1 className="font-display text-2xl">Zoff couldn't finish loading</h1>
        <p className="mt-4 text-theme-muted">
          A connection problem or an update may have interrupted this page.
          Reload to try again.
        </p>
        <a
          className="mt-6 flex min-h-11 items-center justify-center rounded-xl bg-secondary px-5 py-3 text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
          href={window.location.href}
        >
          Reload page
        </a>
        <a
          className="mt-3 inline-flex min-h-11 items-center text-theme-muted underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
          href="/"
        >
          Return home
        </a>
      </section>
    </main>
  );
}
