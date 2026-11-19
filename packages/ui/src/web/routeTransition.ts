import type { RouteModule } from '@kasperrt/smolter/preact';
import { safeWrap, safeWrapAsync } from '@vibes/shared/wrap';

let activeTransition: ViewTransition | undefined;
let lastPointer: { x: number; y: number; at: number } | undefined;
type RouteTransition = NonNullable<RouteModule['viewTransition']>;

if (typeof window !== 'undefined') {
  window.addEventListener(
    'pointerdown',
    (event) => {
      lastPointer = { x: event.clientX, y: event.clientY, at: Date.now() };
    },
    { capture: true, passive: true },
  );
}

function clearSceneClasses() {
  document.documentElement.classList.remove(
    'scene-transition',
    'scene-enter',
    'scene-player',
  );
  document.documentElement.style.removeProperty('--player-flight-from');
}

function resetTransition() {
  activeTransition?.skipTransition();
  activeTransition = undefined;
  if (typeof document !== 'undefined') clearSceneClasses();
}

/** Start the reveal where the person acted: their click, else the focused control. */
function setRevealOrigin() {
  const root = document.documentElement;
  let x = window.innerWidth / 2;
  let y = window.innerHeight * 0.4;

  if (lastPointer && Date.now() - lastPointer.at < 5000) {
    ({ x, y } = lastPointer);
  } else if (document.activeElement instanceof HTMLElement) {
    const rect = document.activeElement.getBoundingClientRect();
    if (rect.width && rect.height) {
      x = rect.left + rect.width / 2;
      y = rect.top + rect.height / 2;
    }
  }

  const radius = Math.ceil(
    Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    ),
  );
  root.style.setProperty('--reveal-radius', `${radius}px`);
  root.style.setProperty('--reveal-x', `${Math.round(x)}px`);
  root.style.setProperty('--reveal-y', `${Math.round(y)}px`);
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
  mode: 'page' | 'scene' | 'enter' | 'player',
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

  document.documentElement.classList.toggle(
    'scene-transition',
    mode !== 'page',
  );
  document.documentElement.classList.toggle('scene-player', mode === 'player');
  if (mode === 'enter' || mode === 'player') {
    setRevealOrigin();
    document.documentElement.classList.add('scene-enter');
  }
  const [error, transition] = safeWrap(() =>
    document.startViewTransition(commit),
  );
  if (error || !transition) {
    resetTransition();
    commit();
    return;
  }
  activeTransition = transition;
  const motionPreference = window.matchMedia(
    '(prefers-reduced-motion: reduce)',
  );
  const onMotionChange = () => {
    if (motionPreference.matches) transition.skipTransition();
  };
  motionPreference.addEventListener('change', onMotionChange);
  // Superseded captures and unsupported snapshot surfaces may reject readiness.
  void safeWrapAsync(transition.ready);
  void safeWrapAsync(transition.finished).then(() => {
    motionPreference.removeEventListener('change', onMotionChange);
    if (activeTransition === transition) {
      activeTransition = undefined;
      clearSceneClasses();
    }
  });
}

export const pageViewTransition: RouteTransition = (commit, previous, next) =>
  runTransition(commit, previous, next, 'page');

/** A single composite avoids independently fading incompatible page shells. */
export const sceneViewTransition: RouteTransition = (commit, previous, next) =>
  runTransition(commit, previous, next, 'scene');

/** Entering a room: the room opens out from where the person clicked. */
export const enterSceneViewTransition: RouteTransition = (
  commit,
  previous,
  next,
) => runTransition(commit, previous, next, 'enter');

export const playerViewTransition: RouteTransition = (commit, previous, next) =>
  runTransition(commit, previous, next, 'player');

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
