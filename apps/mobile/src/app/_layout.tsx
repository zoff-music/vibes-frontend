import '@/global.css';
import {
  initialWindowMetrics,
  SafeAreaProvider,
} from 'react-native-safe-area-context';
import { AppBootstrap } from '@/components/layout/app-bootstrap';
import { ScreenInsetsProvider } from '@/components/screen-safe-area';

export { ErrorBoundary } from '@/components/layout/root-error-boundary';

export default function RootLayout() {
  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <ScreenInsetsProvider>
        <AppBootstrap />
      </ScreenInsetsProvider>
    </SafeAreaProvider>
  );
}
