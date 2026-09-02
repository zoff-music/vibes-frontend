import { Button } from '@vibes/ui/web';
import { Link } from 'react-router';

interface AdminErrorViewProps {
  message: string;
  title?: string;
}

export function AdminErrorView({
  message,
  title = 'Admin unavailable',
}: AdminErrorViewProps) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-theme px-6 py-12 text-theme">
      <section className="panel-strong relative z-10 w-full max-w-md rounded-3xl border border-theme-strong p-8 text-center">
        <h1 className="font-black text-3xl tracking-tight">{title}</h1>
        <p className="mt-3 text-sm text-theme-muted">{message}</p>
        <Button
          className="mt-6 w-full"
          onClick={() => window.location.reload()}
          type="button"
          variant="primary"
        >
          Reload
        </Button>
        <Link
          className="mt-3 inline-flex w-full items-center justify-center rounded-xl px-4 py-2 text-sm text-theme-muted transition-colors hover:text-theme focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          to="/admin"
        >
          Return to sign in
        </Link>
      </section>
    </main>
  );
}
