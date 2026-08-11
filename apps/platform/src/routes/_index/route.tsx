import { classNames, usePageVisibility } from '@vibes/shared';
import {
  Button,
  CircleHalfIcon,
  MoonIcon,
  SunIcon,
  Tooltip,
} from '@vibes/ui/web';
import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useState } from 'react';
import { useLoaderData, useNavigate, useNavigationType } from 'react-router';
import { SiteFooter } from '../../components/legal/SiteFooter';
import { useThemeDisplay } from '../../hooks/useThemeDisplay';
import { useThemeStore } from '../../stores/themeStore';
import { getPreviousPath } from '../../utils/navigationHistory';
import { clientAction } from './action';
import { HomeRoomControls } from './components/HomeRoomControls';
import { JoiningRoomState } from './components/JoiningRoomState';
import { LegalAcknowledgement } from './components/LegalAcknowledgement';
import { PlaylistGenerationControls } from './components/PlaylistGenerationControls';
import { ProviderAttribution } from './components/ProviderAttribution';
import { loader } from './loader';

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

export default function Home() {
  const { providers, publicRooms, totalListeners } =
    useLoaderData<typeof loader>();
  const [roomCode, setRoomCode] = useState('');
  const [placeholderText, setPlaceholderText] = useState('');
  const [wordIndex, setWordIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isBlinkerVisible, setIsBlinkerVisible] = useState(true);
  const [isAIMode, setIsAIMode] = useState(false);
  const [pendingRoomSlug, setPendingRoomSlug] = useState<string | null>(null);
  const isTabVisible = usePageVisibility();
  const navigate = useNavigate();
  const navigationType = useNavigationType();
  const { toggleDarkMode } = useThemeStore();
  const { themeId, currentTheme } = useThemeDisplay();
  const previousPath = getPreviousPath();
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

  const handleToggleDarkMode = useCallback(() => {
    toggleDarkMode();
  }, [toggleDarkMode]);

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
    navigate(`/${slug}`, { viewTransition: true });
  };

  const handleStartSession = () => {
    navigate('/rooms/create', { viewTransition: true });
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

  return (
    <motion.div
      animate={{ opacity: 1 }}
      className={classNames(
        'home-entry relative flex min-h-dvh w-full flex-col items-center overflow-x-hidden',
        shouldFadeIn && 'animate-fade-in',
        pendingRoomSlug && 'pointer-events-none',
      )}
      initial={{ opacity: 1 }}
    >
      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-5 py-6 sm:px-6 sm:py-10">
        <div className="crt-frame relative w-full max-w-3xl rounded-frame p-6 sm:p-10">
          <div className="absolute top-6 right-6 z-20 sm:top-10 sm:right-10">
            <Tooltip
              align="end"
              className="inline-flex"
              content={`Theme: ${currentTheme.name}`}
              side="bottom"
            >
              <Button
                aria-label={`Theme: ${currentTheme.name}`}
                onClick={handleToggleDarkMode}
                size="icon"
                variant={themeId === 'auto' ? 'tertiary' : 'secondary'}
              >
                {themeId === 'light' && <SunIcon className="h-5 w-5" />}
                {themeId === 'dark' && <MoonIcon className="h-5 w-5" />}
                {themeId === 'auto' && <CircleHalfIcon className="h-5 w-5" />}
              </Button>
            </Tooltip>
          </div>

          <div className="text-center">
            <h1
              className="vhs-tear vhs-tear-strong glow-text font-wide text-4xl text-theme leading-none sm:text-5xl"
              data-text="ゾフ"
            >
              ゾフ
            </h1>
            <p className="mt-3 font-pixel text-sm text-theme-muted sm:text-base">
              Shared music rooms, made for listening together
            </p>
            <p className="jp-art mt-2 text-theme-subtle text-xs">
              音楽は共有するもの
            </p>
            {/* lol i aint fucking showing these terrible stats, so lets just drop the embarrassment */}
            {totalListeners > 10 && (
              <p className="mt-4 font-pixel text-theme-muted text-xs sm:text-sm">
                The signal is live. Join {totalListeners} other listeners across
                the airwaves
              </p>
            )}
          </div>

          {!isAIMode && (
            <HomeRoomControls
              onJoinRoom={handleJoinRoom}
              onRoomCodeChange={handleRoomCodeChange}
              onStartSession={handleStartSession}
              onToggleAIMode={handleToggleAIMode}
              placeholder={placeholder}
              roomCode={roomCode}
              rooms={publicRooms}
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
          <ProviderAttribution providers={providers} />
          <LegalAcknowledgement />
        </div>
      </div>
      <SiteFooter />
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
