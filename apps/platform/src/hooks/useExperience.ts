import { useLocation } from 'react-router';

export function useExperience() {
  const { pathname, search } = useLocation();
  const path = pathname.replace(/\/+$/, '') || '/';

  if (path === '/' || path === '/features/music') {
    return 'MUSIC';
  }

  const watch =
    path === '/features/watch' ||
    path.startsWith('/discovery/watch') ||
    new URLSearchParams(search).get('type') === 'watch';

  return watch ? 'WATCH' : 'MUSIC';
}
