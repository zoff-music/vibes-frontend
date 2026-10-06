import { classNames } from '@vibes/shared';
import { useInView, useReducedMotion } from 'framer-motion';
import { lazy, memo, Suspense, useEffect, useRef, useState } from 'react';
import type { NavigateFunction, NavigationType } from 'react-router';
import { useKonamiMode } from '../../../components/konami/KonamiModeContext';
import { useExperience } from '../../../hooks/useExperience';
import { getPreviousPath } from '../../../utils/navigationHistory';
import { canUseViewTransition } from '../../../utils/viewTransition';
import { useAnimatedPlaceholder } from '../hooks/useAnimatedPlaceholder';
import type { HomeLoaderData } from '../loader';
import { HomeLanding } from './HomeLanding';
import { HomeRoomControls } from './HomeRoomControls';
import { PlaylistGenerationControls } from './PlaylistGenerationControls';
import { ProductIntroduction } from './ProductIntroduction';
import { ReturnToRoom } from './ReturnToRoom';
import { ReturnToRoomPreview } from './ReturnToRoomPreview';

const LazyTerminalHome = lazy(async () => {
  const module = await import('./TerminalHome');
  return { default: module.TerminalHome };
});

const LazyProfileSettingsModal = lazy(async () => {
  const module = await import(
    '../../../components/profile/ProfileSettingsModal'
  );
  return { default: module.ProfileSettingsModal };
});

const LazyJoiningRoomState = lazy(async () => {
  const module = await import('./JoiningRoomState');
  return { default: module.JoiningRoomState };
});

interface HomeScreenProps extends HomeLoaderData {
  navigate: NavigateFunction;
  navigationType: NavigationType;
  searchParams: URLSearchParams;
}

// Fetcher state updates must not rerender the homepage's presentation.
export const HomeScreen = memo(function HomeScreen({
  data,
  navigate,
  navigationType,
  searchParams,
}: HomeScreenProps) {
  const [roomCode, setRoomCode] = useState('');
  const watch = useExperience() === 'WATCH';
  const previewReturn =
    import.meta.env.DEV && searchParams.get('preview') === 'return-to-room';
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
    watch,
  );
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
    navigate(`/${slug}${watch ? '?type=watch' : ''}`, {
      viewTransition: canUseViewTransition(),
    });
  };

  const handleStartSession = () => {
    navigate(watch ? '/rooms/create?type=watch' : '/rooms/create', {
      viewTransition: canUseViewTransition(),
    });
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
        {showProfileSettings && (
          <Suspense fallback={null}>
            <LazyProfileSettingsModal
              isOpen
              onClose={() => setShowProfileSettings(false)}
            />
          </Suspense>
        )}
      </>
    );
  }

  return (
    <div
      className={classNames(
        'home-entry relative w-full',
        shouldFadeIn && 'animate-fade-in',
        pendingRoomSlug && 'pointer-events-none',
      )}
    >
      <HomeLanding
        heroRef={heroRef}
        onGeneratePlaylist={handleGeneratePlaylist}
        onJoinRoom={handleJoinRoom}
        data={data}
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
      {!watch && previewReturn && !pendingRoomSlug && (
        <ReturnToRoomPreview
          onJoinRoom={handleJoinRoom}
          listenerCount={searchParams.get('listeners') === '0' ? 0 : 3}
        />
      )}
      {!watch && !previewReturn && !pendingRoomSlug && (
        <ReturnToRoom onJoinRoom={handleJoinRoom} />
      )}
      {pendingRoomSlug && (
        <Suspense
          fallback={
            <p role="status" className="sr-only">
              Joining room...
            </p>
          }
        >
          <LazyJoiningRoomState roomId={pendingRoomSlug} />
        </Suspense>
      )}
    </div>
  );
});

const RESERVED_TOP_LEVEL_PATHS = new Set([
  'callback',
  'privacy-policy',
  'security',
  'terms-of-service',
]);
