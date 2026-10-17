import { getRoomAnalyticsPath, plausibleClient } from '@vibes/api';
import { DebugConsole, ToastViewport } from '@vibes/ui/web';
import { useEffect } from 'preact/compat';
import { ActiveView } from './components/ActiveView';
import { CastErrorBoundary } from './components/CastErrorBoundary';
import { CastProvider, useCast } from './components/CastProvider';
import { IdleView } from './components/IdleView';
import type { CastLoaderData } from './routes/$/clientLoader';

const CastAppContent = () => {
  const { currentPlaylistItem, debugMode, roomId } = useCast();

  useEffect(() => {
    const path = roomId ? getRoomAnalyticsPath(roomId) : '/casting/receiver';
    void plausibleClient.trackPageview({ path, surface: 'cast' });
  }, [roomId]);

  return (
    <>
      <div className="relative flex h-screen w-screen items-center justify-center overflow-hidden bg-cast-shell text-text dark:bg-cast-shell-dark dark:text-dark-text [&_*]:animate-none! [&_*]:backdrop-blur-none! [&_*]:transition-none!">
        <div className="relative z-10 flex h-full w-full items-center justify-center">
          {currentPlaylistItem && <ActiveView />}
          {!currentPlaylistItem && <IdleView />}
        </div>
      </div>
      {debugMode && <DebugConsole enabled />}
    </>
  );
};

interface AppProps {
  loaderData: CastLoaderData;
}

export const App = ({ loaderData }: AppProps) => {
  return (
    <CastErrorBoundary>
      <CastProvider loaderData={loaderData}>
        <ToastViewport />
        <CastAppContent />
      </CastProvider>
    </CastErrorBoundary>
  );
};
