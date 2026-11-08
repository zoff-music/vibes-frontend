import { Link, useNavigate } from '@kasperrt/smolter/preact';
import { Button, RemoteIcon } from '@vibes/ui/web';

interface RemoteErrorViewProps {
  message: string;
  title: string;
}

export function RemoteErrorView({ message, title }: RemoteErrorViewProps) {
  const navigate = useNavigate();

  const goBack = () => {
    navigate(-1);
  };
  const reloadPage = () => {
    window.location.reload();
  };

  return (
    <main className="relative z-10 flex min-h-screen items-center justify-center p-4">
      <section className="panel-strong w-full max-w-md rounded-4xl p-8 text-center">
        <RemoteIcon className="text-theme-muted mx-auto h-12 w-12" />
        <h1 className="font-display text-theme mt-5 text-xl">{title}</h1>
        <p className="text-theme-muted mt-3 text-sm">{message}</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Button onClick={reloadPage} type="button" variant="secondary">
            Reload
          </Button>
          <Button onClick={goBack} type="button" variant="tertiary">
            Go back
          </Button>
        </div>
        <Link
          className="text-theme-muted hover:text-theme focus-visible:ring-secondary mt-3 inline-flex w-full items-center justify-center rounded-xl px-5 py-2.5 text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
          to="/remotes/join"
        >
          Pair another remote
        </Link>
      </section>
    </main>
  );
}
