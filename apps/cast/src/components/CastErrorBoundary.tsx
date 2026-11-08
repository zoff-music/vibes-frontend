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
    <main className="bg-cast-shell text-text dark:bg-cast-shell-dark dark:text-dark-text flex h-screen w-screen items-center justify-center overflow-hidden px-8 [&_*]:animate-none! [&_*]:backdrop-blur-none! [&_*]:transition-none!">
      <section className="border-cast-border-strong bg-cast-panel-surface shadow-cast dark:border-cast-border-strong-dark dark:bg-cast-panel-surface-dark dark:shadow-cast-dark flex max-w-2xl flex-col items-center gap-6 rounded-2xl border px-10 py-12 text-center">
        <AlertCircleIcon aria-hidden className="text-primary size-14" />
        <div>
          <p className="font-display text-shadow-cast-readable text-text dark:text-dark-text text-5xl">
            ゾフ
          </p>
          <h1 className="font-display text-shadow-cast-readable text-text dark:text-dark-text mt-5 text-3xl">
            The receiver needs to restart
          </h1>
          <p className="text-text-muted dark:text-dark-text-muted mt-3 text-lg">
            Reload this screen, then reconnect from your casting device.
          </p>
        </div>
        <button
          className="border-secondary/50 bg-secondary font-display text-shadow-cast-readable rounded-xl border px-6 py-3 text-lg text-black focus:ring-2 focus:ring-white focus:outline-none"
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
