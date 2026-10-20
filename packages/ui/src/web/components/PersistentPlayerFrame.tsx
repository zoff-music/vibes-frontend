import { classNames } from '@vibes/shared';
import { type ReactNode, useLayoutEffect, useRef } from 'react';
import { CloseIcon } from '../icons';
import { Button } from './Button';
import { LinkButton } from './LinkButton';

interface PersistentPlayerFrameProps {
  children: ReactNode;
  minimized: boolean;
  roomName: string;
  roomHref: string;
  onClose: () => void;
}

export function PersistentPlayerFrame({
  children,
  minimized,
  roomName,
  roomHref,
  onClose,
}: PersistentPlayerFrameProps) {
  const frame = useRef<HTMLDivElement>(null);
  const previous = useRef<DOMRect | null>(null);
  const previousMode = useRef(minimized);

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
      !changed ||
      !last ||
      !next.width ||
      !next.height ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    )
      return;
    // Runtime geometry only; all presentation remains in Tailwind. Animate
    // the existing surface without moving or cloning the provider DOM.
    const target = minimized ? frame.current : element;
    if (!target) return;
    const targetBounds = target.getBoundingClientRect();
    const animation = target.animate(
      [
        {
          transform: `translate(${last.x - targetBounds.x}px, ${last.y - targetBounds.y}px) scale(${last.width / targetBounds.width}, ${last.height / targetBounds.height})`,
        },
        { transform: 'none' },
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
          'fixed right-5 bottom-4 z-40 w-96 max-w-[calc(100vw-2.5rem)] overflow-hidden rounded-2xl border border-theme bg-theme shadow-xl [view-transition-name:persistent-player] sm:right-[max(1.5rem,calc((100vw-72rem)/2+1.5rem))]',
      )}
      data-minimized={minimized}
    >
      {minimized && (
        <div className="flex items-center gap-2 border-theme border-b px-3 py-2">
          <LinkButton
            className="min-w-0 flex-1 truncate text-left text-sm"
            to={roomHref}
            prefetch="intent"
            viewTransition={false}
            size="none"
            variant="ghost"
          >
            {roomName}
          </LinkButton>
          <Button
            aria-label="Close persistent player and leave room"
            onClick={onClose}
            size="icon"
            variant="tertiary"
          >
            <CloseIcon className="h-4 w-4" />
          </Button>
        </div>
      )}
      <div className="relative">{children}</div>
    </div>
  );
}
