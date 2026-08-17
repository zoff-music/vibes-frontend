import { Component, type ErrorInfo, type ReactNode } from 'react';

interface TizenErrorBoundaryProps {
  children: ReactNode;
}

interface TizenErrorBoundaryState {
  failed: boolean;
}

export class TizenErrorBoundary extends Component<
  TizenErrorBoundaryProps,
  TizenErrorBoundaryState
> {
  state: TizenErrorBoundaryState = { failed: false };

  static getDerivedStateFromError(): TizenErrorBoundaryState {
    return { failed: true };
  }

  componentDidCatch(_error: Error, _info: ErrorInfo) {
    console.error('The Samsung TV interface could not be rendered.');
  }

  private reload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.failed) return this.props.children;
    return <TizenRecoveryView onReload={this.reload} />;
  }
}

interface TizenRecoveryViewProps {
  onReload?: () => void;
}

export function TizenRecoveryView({ onReload }: TizenRecoveryViewProps) {
  const reload = onReload ?? (() => window.location.reload());
  return (
    <main className="flex h-full items-center justify-center bg-tv-background p-16 text-tv-text">
      <section className="max-w-3xl rounded-[2rem] border border-primary/30 bg-tv-card p-12 text-center">
        <h1 className="text-4xl">TV screen unavailable</h1>
        <p className="mt-5 text-2xl text-tv-muted">
          The screen could not recover. Reload it to try again.
        </p>
        <button
          className="mt-8 rounded-xl bg-accent px-8 py-4 text-black text-xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white"
          onClick={reload}
          type="button"
        >
          Reload
        </button>
      </section>
    </main>
  );
}
