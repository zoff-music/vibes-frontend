import { classNames } from '@vibes/shared';
import {
  type ReactNode,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

type TooltipSide = 'bottom' | 'top';

type TooltipAlign = 'center' | 'end' | 'start';

interface TooltipProps {
  align?: TooltipAlign;
  as?: 'div' | 'span';
  children: ReactNode;
  className: string;
  content: string;
  side?: TooltipSide;
}

interface TooltipPosition {
  left: number;
  top: number;
}

export function Tooltip({
  align = 'center',
  as: Wrapper = 'span',
  children,
  className,
  content,
  side = 'top',
}: TooltipProps) {
  const anchorRef = useRef<HTMLElement | null>(null);
  const tooltipRef = useRef<HTMLSpanElement>(null);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [position, setPosition] = useState<TooltipPosition | null>(null);
  const visible = Boolean(content) && (hovered || focused);
  const setAnchor = useCallback((element: HTMLElement | null) => {
    anchorRef.current = element;
  }, []);

  useLayoutEffect(() => {
    if (!visible) {
      setPosition(null);
      return;
    }
    const updatePosition = () => {
      const anchor = anchorRef.current;
      const tooltip = tooltipRef.current;
      if (!anchor || !tooltip) return;
      const bounds = anchor.getBoundingClientRect();
      const width = tooltip.offsetWidth;
      const height = tooltip.offsetHeight;
      let left = bounds.left + (bounds.width - width) / 2;
      if (align === 'start') left = bounds.left;
      if (align === 'end') left = bounds.right - width;
      let top = bounds.top - height - tooltipGap;
      if (side === 'bottom' || top < tooltipGap) {
        top = bounds.bottom + tooltipGap;
      }
      if (top + height > window.innerHeight - tooltipGap) {
        top = bounds.top - height - tooltipGap;
      }
      setPosition({
        left: Math.max(
          tooltipGap,
          Math.min(left, window.innerWidth - width - tooltipGap),
        ),
        top: Math.max(tooltipGap, top),
      });
    };
    const dismiss = () => {
      setHovered(false);
      setFocused(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') dismiss();
    };
    updatePosition();
    const observer = new ResizeObserver(updatePosition);
    if (tooltipRef.current) observer.observe(tooltipRef.current);
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', dismiss, true);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', dismiss, true);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [align, side, visible]);

  return (
    <Wrapper
      ref={setAnchor}
      className={classNames('relative', className)}
      onPointerEnter={(event) => {
        if (event.pointerType === 'mouse') setHovered(true);
      }}
      onPointerLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget))
          setFocused(false);
      }}
    >
      {children}
      {visible &&
        typeof document !== 'undefined' &&
        createPortal(
          <span
            ref={tooltipRef}
            aria-hidden="true"
            className={classNames(
              'tooltip-content pointer-events-none fixed z-100 max-w-[calc(100vw-1rem)] rounded-lg border border-theme bg-theme-surface px-2.5 py-1.5 font-pixel text-3xs text-theme shadow-xl',
              !position && 'invisible',
            )}
            {...(position ? { style: position } : {})}
          >
            {content}
          </span>,
          document.body,
        )}
    </Wrapper>
  );
}

const tooltipGap = 8;
