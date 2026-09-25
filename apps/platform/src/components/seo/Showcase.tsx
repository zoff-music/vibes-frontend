import { classNames } from '@vibes/shared';
import type { ReactNode } from 'react';
import { useShowcaseMotion } from './useShowcaseMotion';

interface ShowcaseProps {
  children: ReactNode | ((playing: boolean) => ReactNode);
  label: string;
  description: string;
  className?: string;
}

export function Showcase({
  children,
  label,
  description,
  className,
}: ShowcaseProps) {
  const { ref, state } = useShowcaseMotion();
  let content: ReactNode;

  if (typeof children === 'function') {
    content = children(state.playing);
  } else {
    content = children;
  }

  return (
    <figure
      ref={ref}
      data-playing={state.playing}
      className={classNames(
        'group/showcase relative isolate min-w-0',
        className,
      )}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -inset-y-6 overflow-hidden [mask-image:radial-gradient(ellipse_closest-side,black_45%,transparent)]"
      >
        <div className="absolute top-8 right-0 h-72 w-72 rounded-full bg-primary/15 blur-3xl motion-safe:animate-sunset-glow group-data-[playing=false]/showcase:[animation-play-state:paused]" />
        <div className="absolute bottom-8 left-0 h-64 w-64 rounded-full bg-secondary/15 blur-3xl" />
        <div className="absolute inset-x-0 bottom-6 h-56 opacity-30 [mask-image:radial-gradient(ellipse_closest-side,black_30%,transparent)]">
          <div className="absolute inset-0 origin-bottom bg-[length:40px_40px] bg-[linear-gradient(#ff2e97_1px,transparent_1px),linear-gradient(90deg,#00d9ff_1px,transparent_1px)] [transform:perspective(200px)_rotateX(45deg)_scale(1.8)]" />
        </div>
      </div>
      <div className="relative">
        <h2 className="font-pixel text-primary text-xs tracking-widest">
          {label}
        </h2>
      </div>
      <div className="relative">{content}</div>
      <figcaption className="sr-only">{description}</figcaption>
    </figure>
  );
}
