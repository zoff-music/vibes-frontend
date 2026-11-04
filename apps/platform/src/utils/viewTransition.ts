import type { RouteModule } from '@kasperrt/smolter/preact';
import {
  immediateViewTransition,
  pageViewTransition,
  sceneViewTransition,
} from '@vibes/ui/web';
import { shouldTransitionPage } from './viewTransitionPolicy';

export const viewTransition: NonNullable<RouteModule['viewTransition']> = (
  commit,
  previous,
  next,
) => {
  if (!shouldTransitionPage(previous, next)) {
    immediateViewTransition(commit, previous, next);
    return;
  }
  if (previous.path === '/:id/*' || next.path === '/:id/*') {
    sceneViewTransition(commit, previous, next);
    return;
  }
  pageViewTransition(commit, previous, next);
};
