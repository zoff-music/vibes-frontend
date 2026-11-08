import { Link } from '@kasperrt/smolter/preact';
import { ArrowRightIcon, DeferredContent } from '@vibes/ui/web';
import { lazy } from 'preact/compat';

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
      className="border-theme grid items-center gap-10 border-t py-16 sm:py-24 lg:grid-cols-5 lg:gap-14"
    >
      <div className="lg:col-span-2">
        <p className="font-pixel tracking-label dark:text-secondary text-xs text-cyan-800">
          PICK YOUR PLAYER
        </p>
        <h2
          id="remote-heading"
          className="font-pixel mt-4 text-3xl leading-tight tracking-tight normal-case sm:text-5xl"
        >
          Big sound.
          <br />
          Small remote.
        </h2>
        <p className="text-theme-muted mt-5 leading-relaxed">
          Let the TV or computer play. Pair your phone to pause, skip or seek
          without leaving the sofa.
        </p>
        <p className="text-theme-muted mt-4 text-sm">
          One audio source in the room. No second song on your phone.
        </p>
        {showAppsLink && (
          <Link
            to="/discovery/apps"
            prefetch="intent"
            className="border-theme bg-theme-surface text-theme hover:border-secondary/60 hover:bg-theme focus-visible:ring-secondary mt-6 inline-flex min-h-11 items-center gap-3 rounded-xl border px-5 py-3 text-sm focus-visible:ring-2 focus-visible:outline-none"
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
