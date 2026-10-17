import {
  Link,
  useNavigate,
  useNavigation,
  useRevalidator,
} from '@kasperrt/smolter/preact';
import { Button } from '@vibes/ui/web';

interface PlatformErrorViewProps {
  message: string;
  title: string;
  requiresReload?: boolean;
}

export function PlatformErrorView({
  message,
  title,
  requiresReload = false,
}: PlatformErrorViewProps) {
  const navigate = useNavigate();
  const revalidator = useRevalidator();
  const navigation = useNavigation();

  const retry = () => {
    if (requiresReload) {
      window.location.reload();

      return;
    }

    void revalidator();
  };

  return (
    <main
      id="page-content"
      tabIndex={-1}
      className="relative z-10 flex min-h-screen items-center justify-center p-4"
    >
      <section className="panel-strong w-full max-w-md rounded-4xl p-8 text-center">
        <h1 className="font-display text-theme text-xl">{title}</h1>
        <p className="mt-3 text-sm text-theme-muted">{message}</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Button
            disabled={navigation.state === 'loading'}
            onClick={retry}
            type="button"
            variant="primary"
          >
            {requiresReload ? 'Load latest version' : 'Try again'}
          </Button>
          <Button onClick={() => navigate(-1)} type="button" variant="tertiary">
            Go back
          </Button>
        </div>
        <Link
          className="mt-3 inline-flex w-full items-center justify-center rounded-xl px-5 py-2.5 text-sm text-theme-muted transition-colors hover:text-theme focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
          to="/"
          reloadDocument={requiresReload}
        >
          Return home
        </Link>
      </section>
    </main>
  );
}
