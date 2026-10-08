import { ArrowRightIcon, DeferredContent } from '@vibes/ui/web';
import { lazy } from 'react';
import { Link } from 'react-router';

const LazyRemotePlayerDemo = lazy(() =>
  import('./RemotePlayerDemo').then((module) => ({
    default: module.RemotePlayerDemo,
  })),
);

interface RemotePreviewProps {
  showAppsLink?: boolean;
}

export function RemotePreview({ showAppsLink = true }: RemotePreviewProps) {
  return (
    <section
      aria-labelledby="remote-heading"
      className="grid items-center gap-10 border-theme border-t py-16 sm:py-24 lg:grid-cols-5 lg:gap-14"
    >
      <div className="lg:col-span-2">
        <p className="font-pixel text-cyan-800 text-xs tracking-label dark:text-secondary">
          PICK YOUR PLAYER
        </p>
        <h2
          id="remote-heading"
          className="mt-4 font-pixel text-3xl normal-case leading-tight tracking-tight sm:text-5xl"
        >
          Big sound.
          <br />
          Small remote.
        </h2>
        <p className="mt-5 text-theme-muted leading-relaxed">
          Let the TV or computer play. Pair your phone to pause, skip or seek
          without leaving the sofa.
        </p>
        <p className="mt-4 text-sm text-theme-muted">
          One audio source in the room. No second song on your phone.
        </p>
        {showAppsLink && (
          <Link
            to="/discovery/apps"
            prefetch="intent"
            className="mt-6 inline-flex min-h-11 items-center gap-3 rounded-xl border border-theme bg-theme-surface px-5 py-3 text-sm text-theme hover:border-secondary/60 hover:bg-theme focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
          >
            Apps and remotes <ArrowRightIcon className="h-4 w-4" />
          </Link>
        )}
      </div>
      <div className="min-w-0 lg:col-span-3">
        <DeferredContent
          fallback={
            <div aria-hidden="true" className="h-186 rounded-3xl sm:h-170" />
          }
        >
          <LazyRemotePlayerDemo />
        </DeferredContent>
      </div>
    </section>
  );
}
