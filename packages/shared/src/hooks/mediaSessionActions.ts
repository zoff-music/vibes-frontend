interface MediaActions {
  play: (() => void) | null;
  pause: (() => void) | null;
  next: (() => void) | null;
  previous: (() => void) | null;
}

export function configureMediaSessionActions(
  setHandler: (
    action: MediaSessionAction,
    handler: MediaSessionActionHandler | null,
  ) => void,
  actions: MediaActions,
) {
  for (const action of ['seekto', 'seekforward', 'seekbackward'] as const) {
    setHandler(action, null);
  }
  setHandler('play', actions.play);
  setHandler('pause', actions.pause);
  setHandler('previoustrack', actions.previous);
  setHandler('nexttrack', actions.next);
}
