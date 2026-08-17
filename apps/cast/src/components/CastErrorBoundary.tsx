import { AlertCircleIcon } from '@vibes/ui/web';
import { Component, type ErrorInfo, type ReactNode } from 'react';

interface CastErrorBoundaryProps {
  children: ReactNode;
}

interface CastErrorBoundaryState {
  failed: boolean;
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

    return (
      <main className="cast-shell flex h-screen w-screen items-center justify-center overflow-hidden px-8 text-theme">
        <section className="panel-frame panel-surface flex max-w-2xl flex-col items-center gap-6 px-10 py-12 text-center">
          <AlertCircleIcon aria-hidden className="size-14 text-primary" />
          <div>
            <p className="font-display text-5xl text-readable text-theme">
              ゾフ
            </p>
            <h1 className="mt-5 font-display text-3xl text-theme">
              The receiver needs to restart
            </h1>
            <p className="mt-3 text-lg text-theme-muted">
              Reload this screen, then reconnect from your casting device.
            </p>
          </div>
          <button
            className="rounded-xl border border-secondary/50 bg-secondary px-6 py-3 font-display text-black text-lg focus:outline-none focus:ring-2 focus:ring-white"
            onClick={() => window.location.reload()}
            type="button"
          >
            Reload receiver
          </button>
        </section>
      </main>
    );
  }
}
