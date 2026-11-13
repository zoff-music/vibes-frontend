import type { RouteModule } from '@kasperrt/smolter/preact';
import { safeWrap, safeWrapAsync } from '@vibes/shared/wrap';

let activeTransition: ViewTransition | undefined;
type RouteTransition = NonNullable<RouteModule['viewTransition']>;

function resetTransition() {
  activeTransition?.skipTransition();
  activeTransition = undefined;
  if (typeof document !== 'undefined') {
    document.documentElement.classList.remove('scene-transition');
  }
}

/** Let the destination document share the snapshot instead of capturing a SPA update. */
const documentViewTransition: RouteTransition = (commit, previous, next) => {
  if (
    typeof document !== 'undefined' &&
    document.visibilityState === 'visible' &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches &&
    new URL(previous.url).origin === new URL(next.url).origin
  ) {
    commit({ crossDocument: [] });
    return;
  }
  commit();
};

/** Route-owned presentation; data and hash updates keep the current page still. */
function runTransition(
  commit: Parameters<RouteTransition>[0],
  previous: Parameters<RouteTransition>[1],
  next: Parameters<RouteTransition>[2],
  scene: boolean,
) {
  resetTransition();
  if (next.leaving) {
    documentViewTransition(commit, previous, next);
    return;
  }
  if (
    typeof document === 'undefined' ||
    !document.startViewTransition ||
    document.visibilityState !== 'visible' ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
    !previous.loaded ||
    (new URL(previous.url).pathname.replace(/\/settings\/device\/?$/, '') ||
      '/') ===
      (new URL(next.url).pathname.replace(/\/settings\/device\/?$/, '') || '/')
  ) {
    commit();
    return;
  }

  document.documentElement.classList.toggle('scene-transition', scene);
  const [error, transition] = safeWrap(() =>
    document.startViewTransition(commit),
  );
  if (error || !transition) {
    resetTransition();
    commit();
    return;
  }
  activeTransition = transition;
  // Superseded captures and unsupported snapshot surfaces may reject readiness.
  void safeWrapAsync(transition.ready);
  void safeWrapAsync(transition.finished).then(() => {
    if (activeTransition === transition) {
      activeTransition = undefined;
      document.documentElement.classList.remove('scene-transition');
    }
  });
}

export const pageViewTransition: RouteTransition = (commit, previous, next) =>
  runTransition(commit, previous, next, false);

/** A single composite avoids independently fading incompatible page shells. */
export const sceneViewTransition: RouteTransition = (commit, previous, next) =>
  runTransition(commit, previous, next, true);

/** Panels and custom scene animations commit without a document snapshot. */
export const immediateViewTransition: NonNullable<
  RouteModule['viewTransition']
> = (commit, previous, next) => {
  resetTransition();
  if (next.leaving) {
    documentViewTransition(commit, previous, next);
    return;
  }
  commit();
};
