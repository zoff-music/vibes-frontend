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

/** Route-owned presentation; data and hash updates keep the current page still. */
function runTransition(
  commit: Parameters<RouteTransition>[0],
  previous: Parameters<RouteTransition>[1],
  next: Parameters<RouteTransition>[2],
  scene: boolean,
) {
  resetTransition();
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
> = (commit) => {
  resetTransition();
  commit();
};
