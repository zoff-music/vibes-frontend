export function StartupError() {
  return (
    <main className="bg-theme text-theme fixed inset-0 z-50 flex items-center justify-center p-6">
      <section
        role="alert"
        className="panel-strong border-theme w-full max-w-md rounded-3xl border p-8 text-center"
      >
        <h1 className="font-display text-2xl">Zoff couldn't finish loading</h1>
        <p className="text-theme-muted mt-4">
          A connection problem or an update may have interrupted this page.
          Reload to try again.
        </p>
        <a
          className="bg-secondary focus-visible:ring-secondary mt-6 flex min-h-11 items-center justify-center rounded-xl px-5 py-3 text-black focus-visible:ring-2 focus-visible:outline-none"
          href={window.location.href}
        >
          Reload page
        </a>
        <a
          className="text-theme-muted focus-visible:ring-secondary mt-3 inline-flex min-h-11 items-center underline focus-visible:ring-2 focus-visible:outline-none"
          href="/"
        >
          Return home
        </a>
      </section>
    </main>
  );
}
