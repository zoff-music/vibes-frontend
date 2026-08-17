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
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-surface px-6 py-12 text-ink dark:bg-gray-900 dark:text-white">
      <section className="glass relative z-10 w-full max-w-md rounded-3xl border-2 border-ink/10 p-8 text-center dark:border-gray-700">
        <h1 className="font-black text-3xl tracking-tight">{title}</h1>
        <p className="mt-3 text-ink/60 text-sm dark:text-gray-400">{message}</p>
        <Button
          className="mt-6 w-full"
          onClick={() => window.location.reload()}
          type="button"
          variant="primary"
        >
          Reload
        </Button>
        <Link
          className="mt-3 inline-flex w-full items-center justify-center rounded-xl px-4 py-2 text-ink/60 text-sm transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:text-gray-400 dark:hover:text-white"
          to="/admin"
        >
          Return to sign in
        </Link>
      </section>
    </main>
  );
}
