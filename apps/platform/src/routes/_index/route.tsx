import { classNames, usePageVisibility } from '@vibes/shared';
import { AnimatePresence, motion } from 'framer-motion';
import { lazy, Suspense, useEffect, useState } from 'react';
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
import { HomeLanding } from './components/HomeLanding';
import { HomeRoomControls } from './components/HomeRoomControls';
import { JoiningRoomState } from './components/JoiningRoomState';
import { PlaylistGenerationControls } from './components/PlaylistGenerationControls';
import { ProductIntroduction } from './components/ProductIntroduction';
import { loader } from './loader';

export { meta } from './meta';
export { clientAction, loader };

const ANIMATED_WORDS = [
  'electro',
  'おんがく',
  'party',
  'ふんいき',
  'jazz',
  'ゾフ',
  'techno',
  'よる',
  'ambient',
  'おと',
  'house',
  'againagainagain',
  'ゆめ',
  'drumandbass',
  'くうき',
  'hiphop',
  'しんや',
  'rnb',
  'ちょうし',
  'soul',
  'きょうゆう',
  'funk',
  'disco',
  'よいん',
  'rock',
  'しずか',
  'punk',
  'metal',
  'indie',
  'なみ',
  'alternative',
  'pop',
  'かんかく',
  'dance',
  'でんし',
];

const AI_PROMPTS = [
  'sunny indie pop for a weekend road trip',
  'late-night jazz in a quiet city bar',
  'high-energy 2000s dance floor anthems',
  'dreamy shoegaze for watching the rain',
  'funk and soul that keeps a party moving',
  'melodic drum and bass for deep focus',
  'classic hip-hop for a summer cookout',
  'heavy riffs for an intense gym session',
];

const LazyTerminalHome = lazy(async () => {
  const module = await import('./components/TerminalHome');
  return { default: module.TerminalHome };
});

export default function Home() {
  const { providers, publicRooms, totalListeners } =
    useLoaderData<typeof loader>();
  const [roomCode, setRoomCode] = useState('');
  const [placeholderText, setPlaceholderText] = useState('');
  const [wordIndex, setWordIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isBlinkerVisible, setIsBlinkerVisible] = useState(true);
  const [searchParams] = useSearchParams();
  const [isAIMode, setIsAIMode] = useState(searchParams.get('mode') === 'ai');
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  const [pendingRoomSlug, setPendingRoomSlug] = useState<string | null>(null);
  const isTabVisible = usePageVisibility();
  const navigate = useNavigate();
  const navigationType = useNavigationType();
  const previousPath = getPreviousPath();
  const konamiEnabled = useKonamiMode();
  const previousRoomId = previousPath?.match(/^\/([^/]+)$/)?.[1];
  const shouldFadeIn =
    navigationType === 'POP' &&
    Boolean(previousRoomId && !RESERVED_TOP_LEVEL_PATHS.has(previousRoomId));
  const placeholder = placeholderText
    ? isPaused && !isBlinkerVisible
      ? `${placeholderText.slice(0, -1)} `
      : placeholderText
    : isAIMode
      ? 'Describe the music you want...'
      : 'Enter Room Name...';

  useEffect(() => {
    if (!isTabVisible) return;
    const animatedWords = isAIMode ? AI_PROMPTS : ANIMATED_WORDS;
    const currentWord = animatedWords[wordIndex];
    const fullTarget = `${currentWord}...`;
    const typingDelay = Math.max(10, Math.floor(700 / fullTarget.length));

    if (isPaused) {
      const timer = window.setTimeout(() => {
        setIsPaused(false);
        setCharIndex(0);
        setWordIndex((current) => (current + 1) % animatedWords.length);
      }, 1600);
      return () => window.clearTimeout(timer);
    }

    if (charIndex < fullTarget.length) {
      const timer = window.setTimeout(() => {
        setPlaceholderText(fullTarget.substring(0, charIndex + 1));
        setCharIndex((current) => current + 1);
      }, typingDelay);
      return () => window.clearTimeout(timer);
    }

    setIsPaused(true);
  }, [wordIndex, charIndex, isPaused, isTabVisible, isAIMode]);

  useEffect(() => {
    if (!isTabVisible) {
      setIsBlinkerVisible(true);
      return;
    }
    if (!isPaused) {
      setIsBlinkerVisible(true);
      return;
    }

    const interval = window.setInterval(() => {
      setIsBlinkerVisible((current) => !current);
    }, 500);

    return () => window.clearInterval(interval);
  }, [isPaused, isTabVisible]);

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
    setRoomCode('');
    setPlaceholderText('');
    setWordIndex(0);
    setCharIndex(0);
    setIsPaused(false);
  };

  const handleRoomCodeChange = (value: string) => {
    setRoomCode(value);
  };

  if (konamiEnabled) {
    return (
      <>
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
            providers={providers}
            publicRooms={publicRooms}
            roomCode={roomCode}
            totalListeners={totalListeners}
          />
        </Suspense>
        <div className="product-content relative z-10 px-5 sm:px-6">
          <ProductIntroduction />
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
        onJoinRoom={handleJoinRoom}
        providers={providers}
        publicRooms={publicRooms}
      >
        {!isAIMode && (
          <HomeRoomControls
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
