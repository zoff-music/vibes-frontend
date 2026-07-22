import { DebugConsole } from '@vibes/ui';
import { ActiveView } from './components/ActiveView';
import { CastProvider, useCast } from './components/CastProvider';
import { IdleView } from './components/IdleView';

const CastAppContent = () => {
  const { currentSong, debugMode } = useCast();

  return (
    <>
      <div className="relative flex h-screen w-screen items-center justify-center overflow-hidden bg-black text-white">
        {/* Background effects removed for performance */}

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
    <CastProvider>
      <CastAppContent />
    </CastProvider>
  );
};
