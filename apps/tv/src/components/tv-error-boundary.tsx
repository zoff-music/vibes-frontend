import { Component, type ErrorInfo, type ReactNode } from 'react';
import { TvRecoveryView } from './tv-recovery-view';

interface TvErrorBoundaryProps {
  children: ReactNode;
}

interface TvErrorBoundaryState {
  failed: boolean;
}

export class TvErrorBoundary extends Component<
  TvErrorBoundaryProps,
  TvErrorBoundaryState
> {
  state: TvErrorBoundaryState = { failed: false };

  static getDerivedStateFromError(): TvErrorBoundaryState {
    return { failed: true };
  }

  componentDidCatch(_error: Error, _info: ErrorInfo) {
    console.error('The TV interface could not be rendered.');
  }

  private retry = () => {
    this.setState({ failed: false });
  };

  render() {
    if (!this.state.failed) return this.props.children;

    return (
      <TvRecoveryView
        title="TV screen unavailable"
        message="The screen could not recover. Try loading it again."
        retry={this.retry}
      />
    );
  }
}
