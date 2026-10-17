import { AlertCircleIcon } from '@vibes/ui/web';
import { Component, type ErrorInfo, type ReactNode } from 'preact/compat';

interface CastErrorBoundaryProps {
  children: ReactNode;
}

interface CastErrorBoundaryState {
  failed: boolean;
}

export function CastRecoveryView() {
  return (
    <main className="flex h-screen w-screen items-center justify-center overflow-hidden bg-cast-shell px-8 text-text dark:bg-cast-shell-dark dark:text-dark-text [&_*]:animate-none! [&_*]:backdrop-blur-none! [&_*]:transition-none!">
      <section className="flex max-w-2xl flex-col items-center gap-6 rounded-2xl border border-cast-border-strong bg-cast-panel-surface px-10 py-12 text-center shadow-cast dark:border-cast-border-strong-dark dark:bg-cast-panel-surface-dark dark:shadow-cast-dark">
        <AlertCircleIcon aria-hidden className="size-14 text-primary" />
        <div>
          <p className="font-display text-5xl text-shadow-cast-readable text-text dark:text-dark-text">
            ゾフ
          </p>
          <h1 className="mt-5 font-display text-3xl text-shadow-cast-readable text-text dark:text-dark-text">
            The receiver needs to restart
          </h1>
          <p className="mt-3 text-lg text-text-muted dark:text-dark-text-muted">
            Reload this screen, then reconnect from your casting device.
          </p>
        </div>
        <button
          className="rounded-xl border border-secondary/50 bg-secondary px-6 py-3 font-display text-black text-lg text-shadow-cast-readable focus:outline-none focus:ring-2 focus:ring-white"
          onClick={() => window.location.reload()}
          type="button"
        >
          Reload receiver
        </button>
      </section>
    </main>
  );
}

export class CastErrorBoundary extends Component<
  CastErrorBoundaryProps,
  CastErrorBoundaryState
> {
  public state: CastErrorBoundaryState = { failed: false };

  public static getDerivedStateFromError(): CastErrorBoundaryState {
    return { failed: true };
  }

  public componentDidCatch(_error: Error, _info: ErrorInfo): void {
    console.error('[Cast] Receiver render failed.');
  }

  public render(): ReactNode {
    if (!this.state.failed) return this.props.children;

    return <CastRecoveryView />;
  }
}
