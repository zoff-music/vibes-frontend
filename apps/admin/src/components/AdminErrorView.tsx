import { Link } from '@kasperrt/smolter/preact';
import { Button } from '@vibes/ui/web';

interface AdminErrorViewProps {
  message: string;
  title?: string;
}

export function AdminErrorView({
  message,
  title = 'Admin unavailable',
}: AdminErrorViewProps) {
  return (
    <main className="text-theme relative flex min-h-screen items-center justify-center px-6 py-12">
      <section className="panel-strong border-theme-strong relative z-10 w-full max-w-md rounded-3xl border p-8 text-center">
        <h1 className="text-3xl font-black tracking-tight">{title}</h1>
        <p className="text-theme-muted mt-3 text-sm">{message}</p>
        <Button
          className="mt-6 w-full"
          onClick={() => window.location.reload()}
          type="button"
          variant="primary"
        >
          Reload
        </Button>
        <Link
          className="text-theme-muted hover:text-theme focus-visible:ring-primary mt-3 inline-flex w-full items-center justify-center rounded-xl px-4 py-2 text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
          to="/admin"
        >
          Return to sign in
        </Link>
      </section>
    </main>
  );
}
