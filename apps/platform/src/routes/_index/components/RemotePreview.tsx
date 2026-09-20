import { ArrowRightIcon, DeferredContent } from '@vibes/ui/web';
import { lazy } from 'react';
import { Link } from 'react-router';

const LazyRemotePlayerDemo = lazy(() =>
  import('./RemotePlayerDemo').then((module) => ({
    default: module.RemotePlayerDemo,
  })),
);

export function RemotePreview() {
  return (
    <section
      aria-labelledby="remote-heading"
      className="grid items-center gap-8 py-16 sm:py-28 lg:grid-cols-5 lg:gap-16"
    >
      <div className="lg:order-2 lg:col-span-2">
        <p className="font-pixel text-secondary text-xs tracking-label">
          REMOTE CONTROL
        </p>
        <h2
          id="remote-heading"
          className="mt-4 font-pixel text-3xl normal-case leading-tight tracking-tight sm:text-5xl"
        >
          Your phone is the remote.
        </h2>
        <p className="mt-5 text-theme-muted leading-relaxed">
          Scan the player’s QR code, or enter its ID and pairing code. Control
          playback from your phone while the music stays on the other device.
        </p>
        <p className="mt-4 text-sm text-theme-muted">
          Watch it pair, then try pausing, skipping or seeking.
        </p>
        <Link
          to="/discovery/apps"
          className="mt-6 inline-flex min-h-11 items-center gap-3 rounded-xl border border-theme bg-theme-surface px-5 py-3 text-sm text-theme hover:border-secondary/60 hover:bg-theme focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
        >
          Apps and remotes <ArrowRightIcon className="h-4 w-4" />
        </Link>
      </div>
      <div className="min-w-0 lg:order-1 lg:col-span-3">
        <DeferredContent
          fallback={
            <div
              aria-hidden="true"
              className="h-144 rounded-2xl border border-theme bg-theme-surface sm:h-92 lg:h-144 xl:h-92"
            />
          }
        >
          <LazyRemotePlayerDemo />
        </DeferredContent>
      </div>
    </section>
  );
}
