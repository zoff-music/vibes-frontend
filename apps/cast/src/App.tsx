import { DebugConsole, ToastViewport } from '@vibes/ui/web';
import { ActiveView } from './components/ActiveView';
import { CastErrorBoundary } from './components/CastErrorBoundary';
import { CastProvider, useCast } from './components/CastProvider';
import { IdleView } from './components/IdleView';

const CastAppContent = () => {
  const { currentSong, debugMode } = useCast();

  return (
    <>
      <div className="cast-shell relative flex h-screen w-screen items-center justify-center overflow-hidden text-theme">
        <div className="relative z-10 flex h-full w-full items-center justify-center">
          {currentSong && <ActiveView />}
          {!currentSong && <IdleView />}
        </div>
      </div>
      {debugMode && <DebugConsole enabled />}
    </>
  );
};

export const App = () => {
  return (
    <CastErrorBoundary>
      <CastProvider>
        <ToastViewport />
        <CastAppContent />
      </CastProvider>
    </CastErrorBoundary>
  );
};
