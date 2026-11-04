interface NavigationPage {
  url: string;
  path?: string;
  params: Record<string, string>;
}

const homePages = new Set(['/', '/features/music', '/features/watch']);

/** Keep scene changes, panel navigation, filters and hash jumps local. */
export function shouldTransitionPage(
  previous: NavigationPage,
  next: NavigationPage,
) {
  const from =
    new URL(previous.url).pathname.replace(/\/settings\/device\/?$/, '') || '/';
  const to =
    new URL(next.url).pathname.replace(/\/settings\/device\/?$/, '') || '/';
  if (from === to) return false;
  // The homepage already owns its Music/Watch eclipse animation.
  if (homePages.has(from) && homePages.has(to)) return false;
  // Panels in the same room retain the live provider and focused inputs.
  if (
    previous.path === '/:id/*' &&
    next.path === '/:id/*' &&
    from.split('/')[1] === to.split('/')[1]
  )
    return false;
  return true;
}
