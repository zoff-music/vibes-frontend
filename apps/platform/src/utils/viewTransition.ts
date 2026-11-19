import type { RouteModule } from '@kasperrt/smolter/preact';
import {
  enterSceneViewTransition,
  immediateViewTransition,
  pageViewTransition,
  playerViewTransition,
  sceneViewTransition,
} from '@vibes/ui/web';
import { usePersistentPlayerStore } from '../stores/persistentPlayerStore';
import { shouldTransitionPage } from './viewTransitionPolicy';

export const viewTransition: NonNullable<RouteModule['viewTransition']> = (
  commit,
  previous,
  next,
) => {
  const { enabled, activeRoomId } = usePersistentPlayerStore.getState();
  const leavingPlayer = previous.path === '/:id/*' && next.path !== '/:id/*';
  const restoringPlayer =
    previous.path !== '/:id/*' &&
    next.path === '/:id/*' &&
    next.params.id === activeRoomId;
  if (enabled && activeRoomId && (leavingPlayer || restoringPlayer)) {
    playerViewTransition(commit, previous, next);
    return;
  }
  if (!shouldTransitionPage(previous, next)) {
    immediateViewTransition(commit, previous, next);
    return;
  }
  if (next.path === '/:id/*' && previous.path !== '/:id/*') {
    enterSceneViewTransition(commit, previous, next);
    return;
  }
  if (previous.path === '/:id/*' || next.path === '/:id/*') {
    sceneViewTransition(commit, previous, next);
    return;
  }
  pageViewTransition(commit, previous, next);
};
