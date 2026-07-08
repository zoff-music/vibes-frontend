import { usePageVisibility } from '@vibes/shared';
import { Button, CircleHalfIcon, MoonIcon, SunIcon } from '@vibes/ui';
import { useCallback, useEffect, useState } from 'react';
import { Link, useFetcher, useNavigate, useNavigationType } from 'react-router';
import { useThemeDisplay } from '../../hooks/useThemeDisplay';
import { useThemeStore } from '../../stores/themeStore';
import { getPreviousPath } from '../../utils/navigationHistory';
import type { HomeActionData } from './action';
import { action } from './action';
import { loader } from './loader';

export { action, loader };

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

export default function Home() {
  const [roomCode, setRoomCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [placeholderText, setPlaceholderText] = useState('');
  const [wordIndex, setWordIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isBlinkerVisible, setIsBlinkerVisible] = useState(true);
  const fetcher = useFetcher<HomeActionData>();
  const isTabVisible = usePageVisibility();
  const navigate = useNavigate();
  const navigationType = useNavigationType();
  const { toggleDarkMode } = useThemeStore();
  const { themeId, currentTheme } = useThemeDisplay();
  const previousPath = getPreviousPath();
  const shouldFadeIn =
    navigationType === 'POP' &&
    Boolean(previousPath && /^\/rooms\/[^/]+$/.test(previousPath));

  const handleToggleDarkMode = useCallback(() => {
    toggleDarkMode();
  }, [toggleDarkMode]);

  useEffect(() => {
    if (!isTabVisible) return;
    const currentWord = ANIMATED_WORDS[wordIndex];
    const fullTarget = `${currentWord}...`;

    if (isPaused) {
      const timer = setTimeout(() => {
        setIsPaused(false);
        setCharIndex(0);
        setWordIndex((prev) => (prev + 1) % ANIMATED_WORDS.length);
      }, 3000);
      return () => clearTimeout(timer);
    }

    if (charIndex < fullTarget.length) {
      const timer = setTimeout(() => {
        setPlaceholderText(fullTarget.substring(0, charIndex + 1));
        setCharIndex((prev) => prev + 1);
      }, 150);
      return () => clearTimeout(timer);
    } else {
      setIsPaused(true);
    }
  }, [wordIndex, charIndex, isPaused, isTabVisible]);

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

  const handleJoinRoom = async () => {
    if (!roomCode.trim() || isValidating) return;

    const slug = roomCode.trim().toLowerCase().replace(/\s+/g, '-');
    setIsValidating(true);
    fetcher.submit({ roomCode: slug }, { method: 'post' });
  };

  useEffect(() => {
    if (!fetcher.data) return;
    setIsValidating(false);
    if (fetcher.data.roomExists) {
      navigate(`/rooms/${fetcher.data.roomCode}`);
      return;
    }
    navigate(`/rooms/create?name=${encodeURIComponent(roomCode.trim())}`);
  }, [fetcher.data, navigate, roomCode]);

  return (
    <div
      className={`relative flex min-h-screen w-full flex-col items-center justify-center overflow-x-hidden sm:justify-start ${shouldFadeIn ? 'animate-fade-in' : ''}`}
    >
      <div className="relative z-10 mx-auto mt-0 flex w-full max-w-5xl flex-col items-center px-6 sm:mt-[min(35vh_,_285px)]">
        <div className="crt-frame relative w-full max-w-3xl rounded-[36px] p-6 sm:p-10">
          <div className="absolute top-6 right-6 z-20 sm:top-10 sm:right-10">
            <Button
              onClick={handleToggleDarkMode}
              variant={
                themeId !== 'light' ? 'theme-toggle-active' : 'icon-toggle'
              }
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
            <div className="panel-surface rounded-[24px] p-6">
              <label className="mb-3 block font-pixel text-[10px] text-theme-muted tracking-[0.3em]">
                ROOM NAME
              </label>
              <input
                type="text"
                placeholder={
                  placeholderText
                    ? isPaused && !isBlinkerVisible
                      ? `${placeholderText.slice(0, -1)} `
                      : placeholderText
                    : 'Enter Room Name...'
                }
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toLowerCase())}
                onKeyDown={(e) => e.key === 'Enter' && handleJoinRoom()}
                disabled={isValidating}
                className="w-full rounded-2xl border border-theme bg-theme-surface px-4 py-4 font-mono text-base text-theme tracking-widest placeholder:text-theme-subtle focus:border-secondary focus:outline-hidden focus:ring-2 focus:ring-secondary/30 disabled:cursor-not-allowed disabled:opacity-60"
                maxLength={20}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Link
                to="/rooms/create"
                className="group flex cursor-pointer items-center justify-center gap-3 rounded-2xl border border-primary/50 bg-primary/95 px-6 py-4 font-pixel text-sm text-white shadow-[0_0_28px_rgba(255,46,151,0.45)] transition-all hover:-translate-y-0.5 hover:bg-primary"
              >
                Start a Session
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/25 text-white">
                  +
                </span>
              </Link>
              <Button
                onClick={handleJoinRoom}
                disabled={!roomCode.trim() || isValidating}
                variant="home-join"
              >
                {isValidating ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Checking...
                  </span>
                ) : (
                  'Join Room'
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
