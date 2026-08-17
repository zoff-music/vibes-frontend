import { NativeButton } from '@vibes/ui/native';
import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Text, View } from 'react-native';

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
      <View className="flex-1 items-center justify-center gap-6 bg-tv-background p-12">
        <Text className="text-center font-heading text-4xl text-tv-text">
          TV screen unavailable
        </Text>
        <Text className="max-w-2xl text-center font-heading text-2xl text-tv-muted">
          The screen could not recover. Try loading it again.
        </Text>
        <NativeButton label="Try again" onPress={this.retry} tone="primary" />
      </View>
    );
  }
}
