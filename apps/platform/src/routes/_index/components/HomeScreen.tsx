import {
  type NavigateFunction,
  type NavigationType,
  useNavigation,
} from '@kasperrt/smolter/preact';
import { classNames, safeWrapAsync } from '@vibes/shared';
import { useInView, useReducedMotion } from 'framer-motion';
import { memo, useCallback, useEffect, useRef, useState } from 'preact/compat';
import { useExperience } from '../../../hooks/useExperience';
import { getPreviousPath } from '../../../utils/navigationHistory';
import { preloadHomeAction } from '../clientAction';
import type { HomeLoaderData } from '../loader';
import { HomeEntryControls } from './HomeEntryControls';
import { HomeLanding } from './HomeLanding';
import { HomePlaceholder } from './HomePlaceholder';
import { ReturnToRoom } from './ReturnToRoom';
import { ReturnToRoomPreview } from './ReturnToRoomPreview';

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
  const [prompt, setPrompt] = useState('');
  const watch = useExperience() === 'WATCH';
  const previewReturn =
    import.meta.env.DEV && searchParams.get('preview') === 'return-to-room';
  const [isAIMode, setIsAIMode] = useState(searchParams.get('mode') === 'ai');
  const navigation = useNavigation();
  const pendingRoomSlug =
    navigation.state === 'loading'
      ? navigation.location?.pathname.match(/^\/([^/]+)\/?$/)?.[1]
      : null;
  const heroRef = useRef<HTMLDivElement>(null);
  const roomNameRef = useRef<HTMLInputElement>(null);
  const [generationEntry, setGenerationEntry] = useState(0);
  const reducedMotion = useReducedMotion();
  const restoreGeneration = useCallback((value: string) => {
    setIsAIMode(true);
    setPrompt(value);
  }, []);

  useEffect(() => {
    if (!isAIMode) return;

    void safeWrapAsync(preloadHomeAction());
  }, [isAIMode]);

  useEffect(() => {
    if (generationEntry === 0) return;

    const input = roomNameRef.current;
    input?.focus({
      preventScroll: true,
    });
    const target = input ?? heroRef.current;
    target?.scrollIntoView({
      behavior: reducedMotion ? 'instant' : 'smooth',
      block: 'center',
    });
  }, [generationEntry, reducedMotion]);

  const handleGeneratePlaylist = () => {
    setIsAIMode(true);
    setGenerationEntry((current) => current + 1);
  };
  const heroVisible = useInView(heroRef, {
    amount: 0.1,
  });
  const previousPath = getPreviousPath();
  const previousRoomId = previousPath?.match(/^\/([^/]+)$/)?.[1];
  const shouldFadeIn =
    navigationType === 'POP' &&
    (typeof document === 'undefined' || !document.startViewTransition) &&
    Boolean(previousRoomId && !RESERVED_TOP_LEVEL_PATHS.has(previousRoomId));
  const handleJoinRoom = (selectedRoomId?: string) => {
    const requestedRoomId = selectedRoomId ?? roomCode;

    if (!requestedRoomId.trim()) return;

    const slug = requestedRoomId.trim().toLowerCase().replace(/\s+/g, '-');
    navigate(`/${slug}${watch ? '?type=watch' : ''}`, {});
  };

  const handleStartSession = () => {
    navigate(watch ? '/rooms/create?type=watch' : '/rooms/create', {});
  };

  const handleToggleAIMode = () => {
    setIsAIMode((current) => !current);
    roomNameRef.current?.focus({ preventScroll: true });
    if (!isAIMode && window.matchMedia('(max-width: 767px)').matches) {
      setGenerationEntry((current) => current + 1);
    }
  };

  const handleRoomCodeChange = (value: string) => {
    setRoomCode(value);
  };

  return (
    <div
      aria-busy={Boolean(pendingRoomSlug)}
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
        <HomePlaceholder
          isAIMode={isAIMode}
          enabled={heroVisible && (isAIMode ? prompt : roomCode).length === 0}
          watch={watch}
        >
          {(placeholder) => (
            <HomeEntryControls
              pending={Boolean(pendingRoomSlug)}
              active={isAIMode}
              enabled={heroVisible}
              inputRef={roomNameRef}
              onJoinRoom={handleJoinRoom}
              onChange={isAIMode ? setPrompt : handleRoomCodeChange}
              onStartSession={handleStartSession}
              onRestoreGeneration={restoreGeneration}
              onToggle={handleToggleAIMode}
              placeholder={placeholder}
              value={isAIMode ? prompt : roomCode}
            />
          )}
        </HomePlaceholder>
      </HomeLanding>
      {!watch && previewReturn && (
        <ReturnToRoomPreview
          onJoinRoom={handleJoinRoom}
          listenerCount={searchParams.get('listeners') === '0' ? 0 : 3}
        />
      )}
      {!watch && !previewReturn && <ReturnToRoom onJoinRoom={handleJoinRoom} />}
      {pendingRoomSlug && (
        <p role="status" className="sr-only">
          Joining {pendingRoomSlug}…
        </p>
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
