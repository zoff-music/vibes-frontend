import { classNames } from '@vibes/shared';
import {
  AnimatePresence,
  motion,
  useInView,
  useReducedMotion,
} from 'framer-motion';
import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import {
  useLoaderData,
  useNavigate,
  useNavigationType,
  useSearchParams,
} from 'react-router';
import { useKonamiMode } from '../../components/konami/KonamiModeContext';
import { ProfileSettingsModal } from '../../components/profile/ProfileSettingsModal';
import { getPreviousPath } from '../../utils/navigationHistory';
import { canUseViewTransition } from '../../utils/viewTransition';
import { clientAction } from './action';
import { clientLoader } from './clientLoader';
import { HomeLanding } from './components/HomeLanding';
import { HomeRoomControls } from './components/HomeRoomControls';
import { JoiningRoomState } from './components/JoiningRoomState';
import { PlaylistGenerationControls } from './components/PlaylistGenerationControls';
import { ProductIntroduction } from './components/ProductIntroduction';
import { useAnimatedPlaceholder } from './hooks/useAnimatedPlaceholder';
import { loader } from './loader';

export { meta } from './meta';
export { clientAction, clientLoader, loader };

const LazyTerminalHome = lazy(async () => {
  const module = await import('./components/TerminalHome');
  return { default: module.TerminalHome };
});

export default function Home() {
  const { data, pending } = useLoaderData<typeof clientLoader>();
  const [roomCode, setRoomCode] = useState('');
  const [searchParams] = useSearchParams();
  const [isAIMode, setIsAIMode] = useState(searchParams.get('mode') === 'ai');
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [pendingRoomSlug, setPendingRoomSlug] = useState<string | null>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const playlistPromptRef = useRef<HTMLInputElement>(null);
  const roomNameRef = useRef<HTMLInputElement>(null);
  const [generationEntry, setGenerationEntry] = useState(0);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (generationEntry === 0) return;

    const input = isAIMode ? playlistPromptRef.current : roomNameRef.current;
    input?.focus({ preventScroll: true });
    const target = input ?? heroRef.current;
    target?.scrollIntoView({
      behavior: reducedMotion ? 'instant' : 'smooth',
      block: 'center',
    });
  }, [generationEntry, reducedMotion, isAIMode]);

  const handleGeneratePlaylist = () => {
    if (!isAIMode) {
      setRoomCode('');
    }
    setIsAIMode(true);
    setGenerationEntry((current) => current + 1);
  };

  const heroVisible = useInView(heroRef, { amount: 0.1 });
  const { placeholder, reset } = useAnimatedPlaceholder(
    isAIMode,
    heroVisible && roomCode.length === 0,
  );
  const navigate = useNavigate();
  const navigationType = useNavigationType();
  const previousPath = getPreviousPath();
  const konamiEnabled = useKonamiMode();
  const previousRoomId = previousPath?.match(/^\/([^/]+)$/)?.[1];
  const shouldFadeIn =
    navigationType === 'POP' &&
    Boolean(previousRoomId && !RESERVED_TOP_LEVEL_PATHS.has(previousRoomId));
  const handleJoinRoom = (selectedRoomId?: string) => {
    const requestedRoomId = selectedRoomId ?? roomCode;
    if (!requestedRoomId.trim()) return;
    const slug = requestedRoomId.trim().toLowerCase().replace(/\s+/g, '-');
    setPendingRoomSlug(slug);
    navigate(`/${slug}`, { viewTransition: canUseViewTransition() });
  };

  const handleStartSession = () => {
    navigate('/rooms/create', { viewTransition: canUseViewTransition() });
  };

  const handleToggleAIMode = () => {
    setIsAIMode((current) => !current);
    setGenerationEntry((current) => current + 1);
    setRoomCode('');
    reset();
  };

  const handleRoomCodeChange = (value: string) => {
    setRoomCode(value);
  };

  if (konamiEnabled) {
    return (
      <>
        <div ref={heroRef}>
          <Suspense fallback={null}>
            <LazyTerminalHome
              isAIMode={isAIMode}
              onJoinRoom={handleJoinRoom}
              onOpenProfileSettings={() => setShowProfileSettings(true)}
              onRoomCodeChange={handleRoomCodeChange}
              onStartSession={handleStartSession}
              onToggleAIMode={handleToggleAIMode}
              pendingRoomSlug={pendingRoomSlug}
              placeholder={placeholder}
              providers={data.providers ?? []}
              publicRooms={data.publicRooms ?? []}
              roomCode={roomCode}
              totalListeners={data.stats?.totalListeners ?? 0}
            />
          </Suspense>
        </div>
        <div className="product-content relative z-10 px-5 sm:px-6">
          <ProductIntroduction onGeneratePlaylist={handleGeneratePlaylist} />
        </div>
        <ProfileSettingsModal
          isOpen={showProfileSettings}
          onClose={() => setShowProfileSettings(false)}
        />
      </>
    );
  }

  return (
    <motion.div
      animate={{ opacity: 1 }}
      className={classNames(
        'home-entry relative w-full',
        shouldFadeIn && 'animate-fade-in',
        pendingRoomSlug && 'pointer-events-none',
      )}
      initial={{ opacity: 1 }}
    >
      <HomeLanding
        heroRef={heroRef}
        onGeneratePlaylist={handleGeneratePlaylist}
        onJoinRoom={handleJoinRoom}
        data={data}
        pending={pending}
      >
        {!isAIMode && (
          <HomeRoomControls
            inputRef={roomNameRef}
            onJoinRoom={handleJoinRoom}
            onRoomCodeChange={handleRoomCodeChange}
            onStartSession={handleStartSession}
            onToggleAIMode={handleToggleAIMode}
            placeholder={placeholder}
            roomCode={roomCode}
          />
        )}
        {isAIMode && (
          <PlaylistGenerationControls
            inputRef={playlistPromptRef}
            onPromptChange={handleRoomCodeChange}
            onToggleAIMode={handleToggleAIMode}
            placeholder={placeholder}
            prompt={roomCode}
          />
        )}
      </HomeLanding>
      <AnimatePresence>
        {pendingRoomSlug && <JoiningRoomState roomId={pendingRoomSlug} />}
      </AnimatePresence>
    </motion.div>
  );
}

const RESERVED_TOP_LEVEL_PATHS = new Set([
  'callback',
  'privacy-policy',
  'security',
  'terms-of-service',
]);
