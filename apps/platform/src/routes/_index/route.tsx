import { getRateLimitMessage, useRoomGeneration } from '@vibes/api';
import { generatedPlaylistPromptMaxLength } from '@vibes/models';
import { classNames, usePageVisibility } from '@vibes/shared';
import {
  AlertCircleIcon,
  Button,
  CircleHalfIcon,
  MoonIcon,
  SparklesIcon,
  SunIcon,
} from '@vibes/ui';
import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useNavigationType } from 'react-router';
import { useThemeDisplay } from '../../hooks/useThemeDisplay';
import { useThemeStore } from '../../stores/themeStore';
import { getPreviousPath } from '../../utils/navigationHistory';
import { loader } from './loader';

export { loader };

const ANIMATED_WORDS = [
  'electro',
  'おんがく',
  'party',
  'ふんいき',
  'jazz',
  'のり',
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

const GENERATION_MESSAGES = [
  'Generating your playlist',
  'Finding songs that fit the vibe',
  'Checking what plays on YouTube',
  'Building your music room',
];

export default function Home() {
  const [roomCode, setRoomCode] = useState('');
  const [placeholderText, setPlaceholderText] = useState('');
  const [wordIndex, setWordIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isBlinkerVisible, setIsBlinkerVisible] = useState(true);
  const [isAIMode, setIsAIMode] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationMessageIndex, setGenerationMessageIndex] = useState(0);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const isTabVisible = usePageVisibility();
  const navigate = useNavigate();
  const navigationType = useNavigationType();
  const { toggleDarkMode } = useThemeStore();
  const { themeId, currentTheme } = useThemeDisplay();
  const { generateRoom } = useRoomGeneration();
  const previousPath = getPreviousPath();
  const shouldFadeIn =
    navigationType === 'POP' &&
    Boolean(previousPath && /^\/rooms\/[^/]+$/.test(previousPath));

  const handleToggleDarkMode = useCallback(() => {
    toggleDarkMode();
  }, [toggleDarkMode]);

  useEffect(() => {
    if (!isTabVisible) return;
    const animatedWords = isAIMode ? AI_PROMPTS : ANIMATED_WORDS;
    const currentWord = animatedWords[wordIndex];
    const fullTarget = `${currentWord}...`;
    const typingDelay = Math.max(10, Math.floor(800 / fullTarget.length));

    if (isPaused) {
      const timer = setTimeout(() => {
        setIsPaused(false);
        setCharIndex(0);
        setWordIndex((prev) => (prev + 1) % animatedWords.length);
      }, 3000);
      return () => clearTimeout(timer);
    }

    if (charIndex < fullTarget.length) {
      const timer = setTimeout(() => {
        setPlaceholderText(fullTarget.substring(0, charIndex + 1));
        setCharIndex((prev) => prev + 1);
      }, typingDelay);
      return () => clearTimeout(timer);
    } else {
      setIsPaused(true);
    }
  }, [wordIndex, charIndex, isPaused, isTabVisible, isAIMode]);

  // Handle blinking effect for the last dot
  useEffect(() => {
    if (!isTabVisible) {
      setIsBlinkerVisible(true);
      return;
    }

    if (!isPaused) {
      setIsBlinkerVisible(true);
      return;
    }

    const interval = setInterval(() => {
      setIsBlinkerVisible((prev) => !prev);
    }, 500);

    return () => clearInterval(interval);
  }, [isPaused, isTabVisible]);

  useEffect(() => {
    if (!isGenerating || !isTabVisible) return;

    const interval = setInterval(() => {
      setGenerationMessageIndex(
        (current) => (current + 1) % GENERATION_MESSAGES.length,
      );
    }, 1800);

    return () => clearInterval(interval);
  }, [isGenerating, isTabVisible]);

  const handleJoinRoom = () => {
    if (!roomCode.trim()) return;

    const slug = roomCode.trim().toLowerCase().replace(/\s+/g, '-');
    navigate(`/rooms/${slug}`);
  };

  const handleToggleAIMode = () => {
    setIsAIMode((current) => !current);
    setRoomCode('');
    setPlaceholderText('');
    setWordIndex(0);
    setCharIndex(0);
    setIsPaused(false);
    setGenerationError(null);
  };

  const handleGenerateRoom = async () => {
    const prompt = roomCode.trim();
    if (!prompt || isGenerating) return;

    setIsGenerating(true);
    setGenerationMessageIndex(0);
    setGenerationError(null);
    const [error, generatedRoom] = await generateRoom(prompt);
    setIsGenerating(false);

    if (error || !generatedRoom) {
      const rateLimitMessage = error ? getRateLimitMessage(error) : null;
      setGenerationError(
        rateLimitMessage ??
          'Could not generate your music room. Please try again.',
      );
      return;
    }

    navigate(`/rooms/${generatedRoom.room.id}`);
  };

  const handlePrimaryAction = () => {
    if (isAIMode) {
      void handleGenerateRoom();
      return;
    }
    handleJoinRoom();
  };

  return (
    <div
      className={classNames(
        'relative flex min-h-screen w-full flex-col items-center justify-start overflow-x-hidden',
        shouldFadeIn && 'animate-fade-in',
      )}
    >
      <div className="relative z-10 mx-auto mt-[max(6rem,calc(50vh-7.25rem))] flex w-full max-w-5xl flex-col items-center px-6">
        <div className="crt-frame relative w-full max-w-3xl rounded-[36px] p-6 sm:p-10">
          <div className="absolute top-6 right-6 z-20 sm:top-10 sm:right-10">
            <Button
              onClick={handleToggleDarkMode}
              variant={themeId !== 'light' ? 'secondary' : 'tertiary'}
              size="icon"
              title={`Theme: ${currentTheme.name}`}
            >
              {themeId === 'light' && <SunIcon className="h-5 w-5" />}
              {themeId === 'dark' && <MoonIcon className="h-5 w-5" />}
              {themeId === 'auto' && <CircleHalfIcon className="h-5 w-5" />}
            </Button>
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
          </div>

          <div className="mt-8 space-y-5">
            <div
              className={classNames(
                'panel-surface rounded-[24px] p-6 transition-all duration-500',
                isGenerating &&
                  'animate-pulse border-secondary/70 shadow-[0_0_32px_rgba(0,217,255,0.24)]',
              )}
            >
              <label className="mb-3 block font-pixel text-[10px] text-theme-muted tracking-[0.3em]">
                {isAIMode ? 'PLAYLIST PROMPT' : 'ROOM NAME'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder={
                    placeholderText
                      ? isPaused && !isBlinkerVisible
                        ? `${placeholderText.slice(0, -1)} `
                        : placeholderText
                      : isAIMode
                        ? 'Describe the music you want...'
                        : 'Enter Room Name...'
                  }
                  value={roomCode}
                  onChange={(event) => {
                    const value = isAIMode
                      ? event.target.value
                      : event.target.value.toLowerCase();
                    setRoomCode(value);
                    setGenerationError(null);
                  }}
                  onKeyDown={(event) =>
                    event.key === 'Enter' && handlePrimaryAction()
                  }
                  className={classNames(
                    'w-full rounded-2xl border border-theme bg-theme-surface py-4 pr-14 pl-4 font-mono text-base text-theme placeholder:text-theme-subtle focus:border-secondary focus:outline-hidden focus:ring-2 focus:ring-secondary/30 disabled:cursor-not-allowed disabled:opacity-60',
                    !isAIMode && 'tracking-widest',
                  )}
                  maxLength={isAIMode ? generatedPlaylistPromptMaxLength : 20}
                  disabled={isGenerating}
                />
                <Button
                  onClick={handleToggleAIMode}
                  variant={isAIMode ? 'tertiary-active' : 'ghost'}
                  size="icon"
                  aria-label="Toggle AI playlist generation"
                  aria-pressed={isAIMode}
                  title="Generate a music room with AI"
                  disabled={isGenerating}
                  className="absolute top-1/2 right-2 -translate-y-1/2"
                >
                  <SparklesIcon className="h-5 w-5" />
                </Button>
              </div>
              {isAIMode && (
                <div className="mt-3 flex justify-between gap-4 text-theme-subtle text-xs">
                  <span aria-live="polite">
                    {isGenerating
                      ? GENERATION_MESSAGES[generationMessageIndex]
                      : 'Generates a playlist based on your suggestion'}
                  </span>
                  <span className="tabular-nums">
                    {roomCode.length}/{generatedPlaylistPromptMaxLength}
                  </span>
                </div>
              )}
              {generationError && (
                <div className="mt-3 flex items-start gap-2 text-error text-sm">
                  <AlertCircleIcon className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{generationError}</span>
                </div>
              )}
            </div>

            <div
              className={classNames(
                'grid gap-4',
                !isAIMode && 'sm:grid-cols-2',
              )}
            >
              {!isAIMode && (
                <Link
                  to="/rooms/create"
                  className="group flex cursor-pointer items-center justify-center gap-3 rounded-2xl border border-primary/50 bg-primary/95 px-6 py-4 font-pixel text-sm text-white shadow-[0_0_28px_rgba(255,46,151,0.45)] transition-all hover:-translate-y-0.5 hover:bg-primary"
                >
                  Start a Session
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/25 text-white">
                    +
                  </span>
                </Link>
              )}
              <Button
                onClick={handlePrimaryAction}
                disabled={!roomCode.trim() || isGenerating}
                variant="secondary"
                size="large"
                className={classNames(
                  'relative gap-3 overflow-hidden font-pixel',
                  isGenerating && 'animate-ai-button-glow disabled:opacity-100',
                )}
              >
                {isGenerating && (
                  <span className="absolute inset-y-0 w-1/3 animate-ai-button-shimmer bg-linear-to-r from-transparent via-white/35 to-transparent" />
                )}
                {isAIMode && (
                  <span
                    className={classNames(
                      'relative',
                      isGenerating && 'animate-ai-sparkles',
                    )}
                  >
                    <SparklesIcon className="h-5 w-5" />
                  </span>
                )}
                <span className="relative">
                  {isGenerating
                    ? GENERATION_MESSAGES[generationMessageIndex]
                    : isAIMode
                      ? 'Generate Room'
                      : 'Join Room'}
                </span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
