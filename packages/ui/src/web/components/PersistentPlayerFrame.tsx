import { Link } from '@kasperrt/smolter/preact';
import { classNames } from '@vibes/shared';
import {
  type ReactNode,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { CloseIcon } from '../icons';
import { IconButton } from './IconButton';

interface PersistentPlayerFrameProps {
  children: ReactNode;
  minimized: boolean;
  persistent?: boolean;
  roomName: string;
  roomHref: string;
  onClose: () => void;
}

export function PersistentPlayerFrame({
  children,
  minimized,
  persistent = false,
  roomName,
  roomHref,
  onClose,
}: PersistentPlayerFrameProps) {
  const frame = useRef<HTMLDivElement>(null);
  const previous = useRef<DOMRect | null>(null);
  const previousMode = useRef(minimized);
  const [hydrated, setHydrated] = useState(false);

  // Device preferences are unavailable to SSR. Match its attribute first so
  // Preact applies the saved value instead of retaining the server's false.
  useEffect(() => setHydrated(true), []);

  useLayoutEffect(() => {
    const element = frame.current?.querySelector<HTMLElement>(
      '[data-room-player-surface]',
    );
    if (!element) return;
    const next = element.getBoundingClientRect();
    const last = previous.current;
    const changed = previousMode.current !== minimized;
    previousMode.current = minimized;
    previous.current = next;
    if (
      document.documentElement.classList.contains('scene-transition') ||
      !changed ||
      !last ||
      !next.width ||
      !next.height ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    )
      return;
    // Fallback when no view transition carries the change: a uniform
    // settle on the surface that changed, never a non-uniform scale that
    // stretches the provider's controls. The provider DOM never moves.
    const target = minimized ? frame.current : element;
    if (!target) return;
    const animation = target.animate(
      minimized
        ? [
            { opacity: 0, transform: 'translate3d(0, 16px, 0) scale(0.96)' },
            { opacity: 1, transform: 'none' },
          ]
        : [
            { opacity: 0.4, transform: 'scale(0.97)' },
            { opacity: 1, transform: 'none' },
          ],
      { duration: 320, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
    );
    return () => animation.cancel();
  }, [minimized]);

  return (
    <div
      ref={frame}
      className={classNames(
        'group/player origin-top-left',
        minimized &&
          'fixed right-4 bottom-4 z-40 w-96 max-w-[calc(100vw-2rem)] overflow-hidden rounded-3xl border border-theme bg-theme-surface p-2 shadow-2xl [view-transition-name:persistent-player] sm:right-6 sm:bottom-6',
      )}
      data-player-persistent={hydrated && persistent}
      data-minimized={minimized}
    >
      {minimized && (
        <div
          data-room-player-header
          className="flex min-h-11 items-center gap-2 pr-0.5 pb-1.5 pl-2"
        >
          <span
            aria-hidden="true"
            className="bg-secondary shadow-secondary-strong size-2 shrink-0 rounded-full motion-safe:animate-pulse"
          />
          <Link
            className="font-heading text-theme hover:text-secondary focus-visible:ring-secondary min-w-0 flex-1 truncate rounded-md text-left text-xs tracking-[0.15em] uppercase transition-colors focus-visible:ring-2 focus-visible:outline-none"
            to={roomHref}
            prefetch="intent"
          >
            {roomName}
          </Link>
          <IconButton
            aria-label="Close persistent player and leave room"
            onClick={onClose}
            variant="ghost"
          >
            <CloseIcon className="h-4 w-4" />
          </IconButton>
        </div>
      )}
      <div className="relative">{children}</div>
    </div>
  );
}
