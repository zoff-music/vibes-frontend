import { classNames } from '@vibes/shared';
import { Button, PauseIcon, PlayIcon } from '@vibes/ui/web';
import type { ReactNode } from 'react';
import { useShowcaseMotion } from '../../hooks/useShowcaseMotion';
import './showcase.css';

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
  const motion = useShowcaseMotion();
  let content: ReactNode;
  if (typeof children === 'function') {
    content = children(motion.playing);
  } else {
    content = children;
  }

  return (
    <figure
      ref={motion.ref}
      data-animated={motion.animated}
      data-playing={motion.playing}
      className={classNames(
        'music-scene relative isolate overflow-hidden rounded-3xl border border-theme bg-theme-surface shadow-xl',
        className,
      )}
    >
      <div
        aria-hidden="true"
        className="scene-atmosphere pointer-events-none absolute -inset-6 overflow-hidden"
      >
        <div className="scene-aurora absolute top-8 right-0 h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
        <div className="scene-aurora scene-aurora-offset absolute bottom-8 left-0 h-64 w-64 rounded-full bg-secondary/15 blur-3xl" />
        <div className="scene-floor-fade absolute inset-x-0 bottom-6 h-56 opacity-30">
          <div className="scene-floor absolute inset-0" />
        </div>
      </div>
      <div className="scene-header relative flex items-center justify-between gap-3 px-5 pt-4 sm:px-7 sm:pt-5">
        <p className="font-pixel text-primary text-xs tracking-widest">
          {label}
        </p>
        <Button
          variant="tertiary"
          size="icon"
          className="h-11 w-11 rounded-full border border-theme bg-theme-surface text-theme"
          aria-label={motion.paused ? 'Play animation' : 'Pause animation'}
          aria-pressed={motion.paused}
          disabled={motion.reduceMotion === true}
          title={
            motion.reduceMotion
              ? 'Reduced motion enabled'
              : 'Pause or play animation'
          }
          onClick={motion.toggle}
        >
          {motion.paused && <PlayIcon aria-hidden="true" className="h-4 w-4" />}
          {!motion.paused && (
            <PauseIcon aria-hidden="true" className="h-4 w-4" />
          )}
        </Button>
      </div>
      <div className="relative">{content}</div>
      <figcaption className="sr-only">{description}</figcaption>
    </figure>
  );
}
